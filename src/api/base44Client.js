import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "uploads";

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

const ENTITY_TABLE_MAP = {
  Plugin: "plugin",
  PluginReview: "plugin_review",
  PluginAccount: "plugin_account",
  BeamPDDownload: "beampd_download",
};

function toTableName(entityName) {
  return ENTITY_TABLE_MAP[entityName] ?? entityName;
}

function applyFilters(query, filters) {
  let next = query;
  for (const [key, value] of Object.entries(filters || {})) {
    if (value === undefined) continue;
    if (value === null) {
      next = next.is(key, null);
    } else {
      next = next.eq(key, value);
    }
  }
  return next;
}

function applySort(query, sort) {
  if (!sort || typeof sort !== "string") return query;
  const descending = sort.startsWith("-");
  const column = descending ? sort.slice(1) : sort;
  if (!column) return query;
  return query.order(column, { ascending: !descending });
}

function normalizeError(error, fallbackMessage) {
  if (!error) return new Error(fallbackMessage);
  return new Error(error.message || fallbackMessage);
}

function ensureSupabase() {
  if (supabase) return supabase;
  throw new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local."
  );
}

function createEntityHandler(entityName) {
  const table = toTableName(entityName);
  return {
    async filter(filters = {}, sort = "-created_date", limit = 100) {
      const client = ensureSupabase();
      let query = client.from(table).select("*");
      query = applyFilters(query, filters);
      query = applySort(query, sort);
      if (typeof limit === "number" && Number.isFinite(limit)) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw normalizeError(error, `Failed to load ${entityName}.`);
      return data ?? [];
    },
    async get(id) {
      const client = ensureSupabase();
      const { data, error } = await client.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw normalizeError(error, `Failed to get ${entityName}.`);
      return data;
    },
    async create(payload) {
      const client = ensureSupabase();
      const { data, error } = await client.from(table).insert(payload).select("*").single();
      if (error) throw normalizeError(error, `Failed to create ${entityName}.`);
      return data;
    },
    async update(id, payload) {
      const client = ensureSupabase();
      const { data, error } = await client
        .from(table)
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw normalizeError(error, `Failed to update ${entityName}.`);
      return data;
    },
    async delete(id) {
      const client = ensureSupabase();
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw normalizeError(error, `Failed to delete ${entityName}.`);
      return { id };
    },
  };
}

async function uploadToStorage(file) {
  const client = ensureSupabase();
  if (!file) throw new Error("No file provided for upload.");

  const safeName = (file.name || "upload.bin").replace(/[^\w.\-]/g, "_");
  const uniquePart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const path = `${new Date().toISOString().slice(0, 10)}/${uniquePart}_${safeName}`;

  const { error } = await client.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, file, {
    upsert: false,
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
  });
  if (error) {
    throw normalizeError(
      error,
      `Upload failed. Ensure storage bucket '${SUPABASE_STORAGE_BUCKET}' exists and allows uploads.`
    );
  }

  const { data } = client.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.");
  }

  return { file_url: data.publicUrl };
}

const db = {
  auth: {
    async isAuthenticated() {
      if (!supabase) return false;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return Boolean(session?.user);
    },
    async me() {
      if (!supabase) return null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user ?? null;
    },
    async logout(redirectTo) {
      if (supabase) {
        await supabase.auth.signOut();
      }
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    },
    redirectToLogin(redirectTo) {
      window.location.href = redirectTo || "/plugins/login";
    },
  },
  entities: new Proxy(
    {},
    {
      get: (_, entityName) => createEntityHandler(entityName),
    }
  ),
  integrations: {
    Core: {
      UploadFile: uploadToStorage,
    },
  },
  analytics: {
    track: async () => undefined,
  },
  raw: {
    supabase,
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.__B44_DB__ = db;
}

export { db };
export const base44 = db;
export default db;
export const client = supabase;
export const isSupabaseConfigured = hasSupabaseConfig;
