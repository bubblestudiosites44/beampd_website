import { db } from "@/api/base44Client";

const SESSION_KEY = "beampd_plugin_session";

function ensureSupabase() {
  const supabase = db?.raw?.supabase;
  if (!supabase) {
    throw new Error(
      "Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeIdentifier(value) {
  return String(value || "").trim();
}

function safeUsernameFromUser(user) {
  const metadataUsername =
    typeof user?.user_metadata?.username === "string"
      ? user.user_metadata.username.trim()
      : "";
  if (metadataUsername) return metadataUsername;

  const email = normalizeEmail(user?.email);
  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return `user_${String(user?.id || "").slice(0, 8)}`;
}

function writeSessionCache(profile) {
  if (!profile) return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
}

function clearSessionCache() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function waitForOwnProfile(authUserId, retries = 5, delayMs = 180) {
  const supabase = ensureSupabase();
  let lastError = null;

  for (let i = 0; i < retries; i += 1) {
    const { data, error } = await supabase
      .from("plugin_account")
      .select("id, username, email, auth_user_id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (!error && data) return data;
    lastError = error;

    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { data: null, error: lastError };
}

async function ensureOwnPluginAccount(user, preferredUsername = "") {
  const supabase = ensureSupabase();
  if (!user?.id) throw new Error("Missing authenticated user.");

  const existing = await waitForOwnProfile(user.id);
  if (existing?.id) return existing;

  const fallbackUsername = normalizeIdentifier(preferredUsername) || safeUsernameFromUser(user);
  const email = normalizeEmail(user.email);

  const insertPayload = {
    auth_user_id: user.id,
    username: fallbackUsername,
    email: email || `${String(user.id).slice(0, 8)}@local.invalid`,
    password_hash: null,
  };

  const { error: insertError } = await supabase.from("plugin_account").insert(insertPayload);
  if (insertError && insertError.code !== "23505") {
    throw new Error(insertError.message || "Failed to create plugin account profile.");
  }

  const profile = await waitForOwnProfile(user.id, 6, 160);
  if (profile?.id) return profile;

  throw new Error("Could not load plugin account profile after login.");
}

async function resolveLoginEmail(identifier) {
  const supabase = ensureSupabase();
  const value = normalizeIdentifier(identifier);
  if (!value) return null;

  if (value.includes("@")) return normalizeEmail(value);

  const { data, error } = await supabase.rpc("resolve_plugin_login_email", {
    p_identifier: value,
  });
  if (error) {
    throw new Error("Login lookup failed. Please try again.");
  }

  const resolved = normalizeEmail(data);
  return resolved || null;
}

function invalidCredentialsError() {
  return new Error("Invalid username/email or password.");
}

export async function signUp(username, email, password) {
  const supabase = ensureSupabase();
  const cleanUsername = normalizeIdentifier(username);
  const cleanEmail = normalizeEmail(email);

  if (!cleanUsername) throw new Error("Username is required.");
  if (!cleanEmail) throw new Error("Email is required.");

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        username: cleanUsername,
      },
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to create account.");
  }

  if (!data?.user) {
    throw new Error("Failed to create account.");
  }

  if (!data.session) {
    throw new Error("Account created. Check your email to confirm, then sign in.");
  }

  const profile = await ensureOwnPluginAccount(data.user, cleanUsername);
  writeSessionCache(profile);
  return profile;
}

export async function logIn(identifier, password) {
  const supabase = ensureSupabase();
  const email = await resolveLoginEmail(identifier);
  if (!email) throw invalidCredentialsError();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    throw invalidCredentialsError();
  }

  const profile = await ensureOwnPluginAccount(data.user);
  writeSessionCache(profile);
  return profile;
}

export function logOut() {
  clearSessionCache();
  const supabase = db?.raw?.supabase;
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}

export async function hydrateSession() {
  const supabase = ensureSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    clearSessionCache();
    return null;
  }

  const profile = await ensureOwnPluginAccount(user);
  writeSessionCache(profile);
  return profile;
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

