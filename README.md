# AmazonFX

**Different Mindset. Same Mission.**

AmazonFX is a trading education and practice platform for learning, practice, analysis, and personal trade journaling. It includes a React Router frontend and an Express API backed by MySQL or MariaDB.

> Trading involves substantial risk. AmazonFX is educational software; it does not guarantee profits or provide trading signals.

## Quick start

Requirements: Node.js 20 or newer, npm, and MySQL/MariaDB (XAMPP is supported).

1. Start MySQL, then import [`database/schema.sql`](./database/schema.sql) using phpMyAdmin or a MySQL client.
2. Install backend dependencies and create the local environment file:

```powershell
npm --prefix backend install
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and replace `JWT_SECRET` with a unique random secret of at least 32 characters. Keep `.env` private; it is ignored by Git.

3. Start the API:

```powershell
npm --prefix backend run dev
```

4. In another terminal, start the frontend:

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:4000` by default.

If you imported an earlier schema before scheduled classes were added, also import [`database/migrations/002_create_classes.sql`](./database/migrations/002_create_classes.sql).

## Checks

```powershell
npm --prefix frontend run typecheck
npm --prefix frontend run build
npm --prefix backend test
```

## Project details

See [README2.md](./README2.md) for the feature overview, complete API route list, administrator setup, and troubleshooting steps.

