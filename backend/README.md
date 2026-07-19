# Job Portal — Backend (PostgreSQL / Sequelize)

Migrated from MongoDB Atlas + Mongoose to PostgreSQL + Sequelize. Routes, JWT
auth, the scraper, and every API response shape are unchanged — the frontend
needs no code changes.

## Local setup

1. Install Postgres locally, or use a free hosted instance (Render, Railway,
   Neon, Supabase all offer one).
2. Create a database, e.g. `jobportal`.
3. Copy `.env` and fill in `DATABASE_URL` with your connection string:
   ```
   postgres://<username>:<password>@<host>:<port>/<database_name>
   ```
4. `npm install`
5. `npm run dev`

On startup the app calls `sequelize.sync({ alter: true })`, which creates the
`users`, `jobs`, `applications`, and `saved_jobs` tables automatically from
the models — no manual SQL or migration files needed to get running.

## Deploying

- Any managed Postgres works: Render, Railway, Neon, Supabase, AWS RDS.
- Render/Railway/Neon/Supabase all require SSL on their connection — that's
  already handled in `models/index.js` via the `DB_SSL` env var (defaults to
  `true`). Only set `DB_SSL=false` for a local Postgres without SSL.
- Set `DATABASE_URL` and `JWT_SECRET` as environment variables on whichever
  platform you deploy to (same as you would have for `MONGO_URI` before).

## Notes on the migration

- `_id` is preserved in every API response (aliased from Postgres's integer
  `id`) so the existing React frontend keeps working without changes.
- `skills` and `benefits` on `Job` use Postgres's native array column type —
  no join table needed for simple filtering.
- Mongo's `.populate()` calls became Sequelize `include`; the aggregate
  pipeline in the admin dashboard became a `GROUP BY`/`COUNT`.
- `sequelize.sync({ alter: true })` is convenient for an assessment/dev
  project. For a real production app, switch to `sequelize-cli` migrations
  so schema changes are tracked and reversible instead of auto-altered.
