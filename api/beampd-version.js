const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "Content-Type": "application/json; charset=utf-8",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function parseVersion(value) {
  const match = String(value || "").trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) return null;

  return {
    parts: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split(".") : null,
  };
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return 0;

  for (let i = 0; i < 3; i += 1) {
    if (a.parts[i] !== b.parts[i]) return a.parts[i] > b.parts[i] ? 1 : -1;
  }

  if (a.prerelease === null && b.prerelease !== null) return 1;
  if (a.prerelease !== null && b.prerelease === null) return -1;
  if (a.prerelease === null) return 0;

  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < length; i += 1) {
    const aPart = a.prerelease[i];
    const bPart = b.prerelease[i];
    if (aPart === undefined) return -1;
    if (bPart === undefined) return 1;
    if (aPart === bPart) continue;

    const aNumeric = /^\d+$/.test(aPart);
    const bNumeric = /^\d+$/.test(bPart);
    if (aNumeric && bNumeric) return Number(aPart) > Number(bPart) ? 1 : -1;
    if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
    return aPart > bPart ? 1 : -1;
  }

  return 0;
}

export default {
  async fetch(request, env = process.env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }
    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const anonKey =
      env.SUPABASE_PUBLISHABLE_KEY ||
      env.SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return jsonResponse({ error: "Version service is not configured" }, 503);
    }

    try {
      const tableUrl = new URL("/rest/v1/beampd_download", supabaseUrl);
      tableUrl.search = new URLSearchParams({
        select: "type,version,download_url,updated_date,created_date",
        is_active: "eq.true",
        coming_soon: "eq.false",
        order: "updated_date.desc,created_date.desc",
        limit: "100",
      }).toString();

      const supabaseHeaders = {
        apikey: anonKey,
        Accept: "application/json",
      };
      if (!anonKey.startsWith("sb_publishable_")) {
        supabaseHeaders.Authorization = `Bearer ${anonKey}`;
      }

      const response = await fetch(tableUrl, {
        headers: supabaseHeaders,
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.error("Supabase version query failed:", response.status);
        return jsonResponse({ error: "Could not load the current BeamPD version" }, 502);
      }

      const rows = await response.json();
      const validRows = Array.isArray(rows)
        ? rows.filter((row) => parseVersion(row.version))
        : [];
      if (validRows.length === 0) {
        return jsonResponse({ error: "No active BeamPD version is configured" }, 404);
      }

      const latestVersion = validRows.reduce((latest, row) =>
        compareVersions(row.version, latest.version) > 0 ? row : latest
      );
      const matchingRows = validRows.filter(
        (row) => compareVersions(row.version, latestVersion.version) === 0
      );
      const downloadRow =
        matchingRows.find((row) => row.type === "manual" && row.download_url) ||
        matchingRows.find((row) => row.download_url);

      return jsonResponse({
        app: "BeamPD: Response",
        latest_version: latestVersion.version.replace(/^v/, ""),
        download_url: downloadRow?.download_url || null,
        updated_at: latestVersion.updated_date || latestVersion.created_date || null,
        source: "beampd_download",
      });
    } catch (error) {
      console.error("BeamPD version endpoint failed:", error?.message || error);
      return jsonResponse({ error: "Could not load the current BeamPD version" }, 502);
    }
  },
};
