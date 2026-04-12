Run these files in order in the Supabase SQL editor:

1. `00_supabase_extensions_and_helpers.sql`
2. `01_plugin_account.sql`
3. `02_plugin.sql`
4. `03_plugin_review.sql`
5. `04_beampd_download.sql`
6. `05_storage_uploads_bucket.sql` (optional but needed for upload from frontend)
7. `06_supabase_auth_and_rls.sql` (recommended hardening: Supabase Auth + RLS)

Entity-to-table mapping:
- `PluginAccount` -> `public.plugin_account`
- `Plugin` -> `public.plugin`
- `PluginReview` -> `public.plugin_review`
- `BeamPDDownload` -> `public.beampd_download`

Paste-text seed files (for Supabase Table Editor -> `Add content` -> `Paste text`):
- `paste_text_plugin_account.tsv` -> `public.plugin_account`
- `paste_text_plugin.tsv` -> `public.plugin`
- `paste_text_plugin_review.tsv` -> `public.plugin_review`
- `paste_text_beampd_download.tsv` -> `public.beampd_download`

Paste order:
1. `plugin_account`
2. `plugin`
3. `plugin_review`
4. `beampd_download`

Storage:
- If you want plugin/image uploads to work from the site, also run `05_storage_uploads_bucket.sql`.
- This creates a public `uploads` storage bucket and policies used by `db.integrations.Core.UploadFile`.

Security hardening:
- Run `06_supabase_auth_and_rls.sql` after the base schema files.
- This migration keeps `beampd_download` unchanged and adds RLS hardening for:
  - `plugin_account`
  - `plugin`
  - `plugin_review`
- It also introduces `auth_user_id` on `plugin_account` so plugin ownership can be tied to Supabase Auth users.
