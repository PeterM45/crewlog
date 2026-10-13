# Crewlog

Crewlog tracks roofing jobs, the crews assigned to them and the notes crews leave on site. It's a Next.js App Router app backed by Postgres through Drizzle.

## Requirements

- Node.js 22 or later
- pnpm 11 (older pnpm versions switch to the version pinned in `package.json` on their own)
- Docker with Compose v2

## Setup

```sh
pnpm install
cp .env.example .env
pnpm dev:up
```

`pnpm dev:up` starts Postgres in Docker on port 5434, applies migrations, seeds the database and runs the dev server at http://localhost:3000. After the first run, `pnpm dev` is enough while the container is up. To reset the data, run `pnpm db:seed`, which truncates and re-inserts everything.

If port 5434 is taken, change the port mapping in `docker-compose.yml` and both URLs in `.env`.

## Signing in

There's no real auth provider. `/sign-in` lists every user in the database. Clicking one stores that user's id in the `crewlog_user_id` cookie, and `getCurrentUser()` in `lib/session.ts` reads it back. Pages, server actions and route handlers all get the user from `getCurrentUser()`. This is for local development only.

Seeded users:

| Role | Users | Sees |
| --- | --- | --- |
| Admin | Dana Whitfield | Every job. Can create and edit jobs. |
| Foreman | Marco Bellini (North Crew), Priya Raman (East Crew) | Their crew's jobs |
| Crew member | Luis Ortega, Sam Kowalski, Jamal Reid (North Crew); Hannah Cole, Tom Nguyen, Erin Walsh (East Crew) | Jobs assigned to their crew |

To call the API from the command line, pass the cookie yourself:

```sh
curl -b crewlog_user_id=2 http://localhost:3000/api/jobs
curl -b crewlog_user_id=2 "http://localhost:3000/api/jobs/1/notes?limit=10"
```

## Tests

```sh
pnpm test
```

Tests run against the `crewlog_test` database, which the Postgres container creates on first start. Each test truncates the tables and builds its own fixture, so seed data doesn't matter. `next/headers` cookies are mocked in `tests/setup.ts`, and `setSessionUser(user.id)` signs a test in.

Other scripts:

- `pnpm lint` runs Biome. `pnpm format` applies its formatting.
- `pnpm db:generate` creates a migration in `drizzle/` after you change `db/schema.ts`. `pnpm db:migrate` applies it.
- `pnpm build` makes a production build.

## Project layout

```
app/                  pages, server actions (app/jobs/actions.ts) and route handlers (app/api)
components/           app components; components/ui holds the shadcn/ui components
db/schema.ts          Drizzle schema and inferred types
drizzle/              generated migrations
lib/                  data access and helpers; components never query the database directly
scripts/seed.ts       seed data
tests/                Vitest tests and fixtures
```

## Conventions

- **Job access.** Every page, server action and route handler that takes a job id calls `requireJobAccess(user, jobId)` from `lib/access.ts` before touching the job or its notes. It returns the job, or throws an `AccessError` with a 404 or 403 status. Pages turn that into a 404 with `notFoundOnAccessError`. Route handlers turn it into a JSON error with `accessErrorResponse`. Job lists use `jobScopeFor(user)`, so the same rules apply.
- **Dates.** `COMPANY_TIMEZONE` in `lib/config.ts` is `America/Toronto`. Use the helpers in `lib/dates.ts` to show timestamps or group them by day, so a note written at 10pm lands on the right day. `scheduled_date` is a plain calendar date with no timezone.
- **Data access.** Queries live in `lib/`. Lists are bounded (notes default to 50 per request), and related data such as author names is joined rather than fetched row by row.
- **UI.** Use the shadcn/ui components in `components/ui`. Add more with `pnpm dlx shadcn@latest add <component>`.
