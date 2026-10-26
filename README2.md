# AmazonFX

**Different Mindset. Same Mission.**

AmazonFX is a modular trading education and practice platform. It brings learning, practical tools, and personal trade journaling together so users can learn, practice, analyze, and improve.

> **Risk notice:** Trading involves substantial risk and may not be suitable for everyone. AmazonFX is an educational platform; it does not guarantee profits or provide guaranteed trading results.

## Project at a glance

| Area | Current implementation |
| --- | --- |
| Public experience | Responsive landing page |
| Member experience | Account registration and sign-in, profile editing, dashboard |
| Education | Course catalogue and scheduled-class listing |
| Practice | Browser-based trading calculators and session clocks |
| Reflection | Private, account-scoped trading journal |
| Administration | Admin-only overview, member-role management, course management, and class scheduling |
| Backend | Express API with MySQL/MariaDB |

Live market feeds, automated trading, payments, and community features are not part of the current implementation. Prices or statistics shown as sample dashboard content are illustrative, not live market data.

## Technology

- **Frontend:** React 19, TypeScript, React Router, Vite, Tailwind CSS
- **API:** Node.js (20+), Express 5
- **Database:** MySQL or MariaDB (XAMPP is supported for local development)
- **Validation and security:** Zod, bcrypt, JWT, HttpOnly cookies, Helmet, CORS, and authentication rate limits

## Repository layout

```text
AmazonFX/
├── backend/
│   ├── src/
│   │   ├── routes/          # Authentication, courses, classes, journal, admin
│   │   ├── app.js           # Express middleware and API route mounting
│   │   ├── auth.js          # Session authentication and admin authorization
│   │   ├── config.js        # Environment configuration
│   │   ├── db.js            # MySQL connection pool
│   │   └── server.js        # API startup and shutdown
│   └── test/                # Node.js API tests
├── database/
│   ├── schema.sql           # Initial database schema
│   └── migrations/          # Changes for existing databases
├── frontend/
│   └── app/
│       ├── components/      # Feature-focused UI components
│       ├── lib/             # Shared frontend API configuration
│       └── routes/          # Public landing page and member dashboard
└── README2.md
```

## Requirements

- Node.js 20 or later and npm
- XAMPP with MySQL enabled, or another compatible MySQL/MariaDB server
- A modern browser

## Local development with XAMPP

### 1. Create the database

1. Start **MySQL** in the XAMPP Control Panel.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Import [`database/schema.sql`](./database/schema.sql). This creates the `amazonfx` database and its initial tables.
4. If the database already existed before the classes feature was added, select the `amazonfx` database and import [`database/migrations/002_create_classes.sql`](./database/migrations/002_create_classes.sql).

The migration is safe to import more than once: it creates the `classes` table only if it does not already exist.

### 2. Configure and start the API

Open a terminal in the project root and install the API dependencies:

```powershell
npm --prefix backend install
```

Create `backend/.env` with the settings below, then replace the JWT placeholder with a unique random secret of at least 32 characters. Set `DB_PASSWORD` to the password configured for your local MySQL user.

```dotenv
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-unique-random-secret-of-at-least-32-characters
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=amazonfx
DB_USER=root
DB_PASSWORD=
```

Do not commit `.env` or share its contents. Start the API and keep its terminal open:

```powershell
npm --prefix backend run dev
```

The API should report that it is listening on `http://localhost:4000` and that the MySQL connection is ready.

### 3. Start the frontend

In a second terminal, install frontend dependencies and start the development server:

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```

Open `http://localhost:5173`. The public landing page is `/`; the member dashboard is `/dashboard`.

The frontend uses `http://localhost:4000` as its default API URL. To use a different API URL, define `VITE_API_URL` in the frontend environment. For local development, use `localhost` consistently rather than switching between `localhost` and `127.0.0.1`: the API CORS origin must match the frontend origin.

## Administrator setup

1. Register a normal account through the app.
2. In phpMyAdmin, run the following query with that account's email:

   ```sql
   UPDATE amazonfx.users
   SET role = 'admin', updated_at = NOW()
   WHERE email = 'your-admin@example.com';
   ```

3. Sign out and back in, then open the dashboard. The Admin navigation is shown to administrator accounts.

The API checks the user's current database role for admin requests. There is no public administrator registration route. The final administrator cannot be demoted through the admin interface.

## Available API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a member account |
| `POST` | `/api/auth/login` | Public | Sign in and establish a session |
| `POST` | `/api/auth/logout` | Public | Clear the session cookie |
| `GET` | `/api/auth/me` | Signed in | Read the current account |
| `PATCH` | `/api/auth/me` | Signed in | Update the current profile |
| `GET` | `/api/courses` | Public | List published courses |
| `GET` | `/api/classes` | Public | List upcoming scheduled classes |
| `GET` | `/api/journal` | Signed in | List the current user's journal entries |
| `POST` | `/api/journal` | Signed in | Add a journal entry |
| `DELETE` | `/api/journal/:id` | Signed in | Delete an entry owned by the current user |
| `GET` | `/api/admin/overview` | Admin | Read platform overview counts |
| `/api/admin/users` | `GET`, `PATCH` | Admin | List members and change member roles |
| `/api/admin/courses` | `GET`, `POST`, `PATCH`, `DELETE` | Admin | Manage courses |
| `/api/admin/classes` | `GET`, `POST`, `PATCH`, `DELETE` | Admin | Manage scheduled classes |
| `GET` | `/api/health` | Public | Check whether the API process is responding |
| `GET` | `/api/ready` | Public | Check API and database readiness |

Authentication uses an eight-hour HttpOnly session cookie. Passwords are hashed; SQL queries use parameters; request bodies are validated. The trading calculators run in the browser and do not place trades.

## Development checks

Run these from the project root:

```powershell
npm --prefix frontend run typecheck
npm --prefix frontend run build
npm --prefix backend test
```

Or run `npm run typecheck` and `npm run build` from `frontend`, and `npm test` from `backend`.

## Troubleshooting

### The browser shows “Failed to fetch”

The frontend cannot connect to the API. Confirm:

1. The API terminal is still running and listening on port `4000`.
2. `http://localhost:4000/api/health` returns `{"status":"ok"}`.
3. `http://localhost:4000/api/ready` returns `{"status":"ready"}`.
4. MySQL is running in XAMPP and the values in `backend/.env` match your MySQL configuration.
5. `FRONTEND_ORIGIN` matches the address in the browser, typically `http://localhost:5173`.

An SQL role update changes the account's permissions in the database; it does not start the API. If the API cannot connect to MySQL, inspect the API terminal for the startup error.

### Admin features are unavailable after changing the role

Verify the account email and role in phpMyAdmin:

```sql
SELECT email, role
FROM amazonfx.users
WHERE email = 'your-admin@example.com';
```

Then sign out and sign in again to refresh the user state in the app.

### Classes fail to load

Verify that the `amazonfx.classes` table exists. If this is an existing database, import the classes migration and restart the API if it was stopped by a database startup error.

## Product direction

AmazonFX is being built as an educational and technology platform. Future capabilities may include expanded courses, progress tracking, quizzes, richer analytics, market-data integrations, and simulated bot backtesting. Any future market-data or payment integrations must follow provider licensing, secure server-side verification, and webhook validation requirements. Live-money automation is outside the current scope.

**Learn. Practice. Analyze. Improve.**
