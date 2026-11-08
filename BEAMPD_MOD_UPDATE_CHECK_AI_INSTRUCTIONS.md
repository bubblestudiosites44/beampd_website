# BeamPD: Response Mod Update Check Instructions

Give the following request to the AI implementing the BeamNG mod change:

```text
Implement a non-blocking update check in the existing BeamPD: Response mod.

Latest-version endpoint:
https://beampd.xirako.com/beampd-version.json

The endpoint returns JSON shaped like:
{
  "app": "BeamPD: Response",
  "latest_version": "1.3.0",
  "download_url": "https://.../BeamPD_Response.zip",
  "updated_at": "2026-11-01T16:01:23.537Z",
  "source": "beampd_download"
}

Requirements:
1. First inspect the existing mod code and use the HTTP/networking method supported by the installed BeamNG version. Do not invent a Lua API; verify its signature in the existing code, shipped BeamNG files, or official BeamNG documentation.
2. Check once after the main BeamPD extension has initialized. Never block the game loading thread while the request is running.
3. Use a short timeout and handle offline mode, DNS errors, HTTP errors, malformed JSON, and missing fields without breaking gameplay. A failed check should quietly leave the mod usable.
4. Read `latest_version` as a string and compare it semantically with the installed mod version (major, minor, patch, including prerelease suffixes if the mod uses them). Do not compare version strings alphabetically.
5. If the endpoint version is newer, show one BeamNG toast/notification that says an update is available and includes the latest version. If appropriate for this mod's UX, include the provided `download_url` as a clickable action; otherwise show the URL in the notification details or log. Do not automatically download, install, replace files, or restart the game.
6. If versions match, show no notification. Avoid repeating the same notification during one game session; throttle or cache checks so map loads do not create repeated requests.
7. Keep the installed version in the mod's existing single source of truth and add a small test or testable helper for version comparison.
8. Keep the change isolated and explain which files changed, how to test offline behavior, and how to test when the endpoint reports a newer version.
```

The version response is generated from active, non-coming-soon rows in Supabase `public.beampd_download`. It is cached for up to five minutes at the CDN, so allow that delay after publishing a release.

For Cloudflare Pages, the route is implemented by `functions/beampd-version.json.js`. Configure these runtime variables under **Settings > Variables and Secrets** for Production (and Preview if you test previews), then redeploy:

- `SUPABASE_URL`: the Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY`: the Supabase publishable key. The legacy `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY` names are also accepted.

Use only a public anon/publishable key; never put a Supabase service-role or secret key in this endpoint. Once deployed, verify the route responds with `Content-Type: application/json` and a `latest_version` field.
