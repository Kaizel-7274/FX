# AmazonFX frontend

The responsive React Router app is organized by responsibility:

- `app/routes/` — public landing page and authenticated dashboard route
- `app/components/` — dashboard, layout, auth/profile, and course UI
- `app/data/` — sample content used by the dashboard preview
- `app/lib/` — shared API configuration
- `app/types.ts` — frontend domain types

Run `npm run dev` from this folder. The public home page is `/`; signed-in members continue to `/dashboard`. The API URL defaults to `http://localhost:4000` and can be overridden with `VITE_API_URL`.

Build and type-check with `npm run build` and `npm run typecheck`.
