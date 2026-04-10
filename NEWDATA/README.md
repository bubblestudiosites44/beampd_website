Run these files in order in the Supabase SQL editor:

1. `00_supabase_extensions_and_helpers.sql`
2. `01_plugin_account.sql`
3. `02_plugin.sql`
4. `03_plugin_review.sql`
5. `04_beampd_download.sql`
6. `05_storage_uploads_bucket.sql` (optional but needed for upload from frontend)

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
