# BeamPD Site

## Local setup

1. Install dependencies:
   - `npm install`
2. Create `.env.local` with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_STORAGE_BUCKET=uploads
```

3. Run dev server:
   - `npm run dev`

## Database

Supabase SQL schema and paste-text seed files are in [`NEWDATA`](./NEWDATA).

- Run schema SQL files in the order listed in [`NEWDATA/README.md`](./NEWDATA/README.md).
- Then import paste-text TSV files into the matching tables.

## Notes

- Never put `service_role` keys in frontend code or Vite env vars.
- The app uses a compatibility `db` client in [`src/api/base44Client.js`](./src/api/base44Client.js) backed by Supabase.

