# JAX Points Tracker

A web app for the JAX Ale Exchange homebrew club to track member points, run homebrew
competitions, manage club events, and coordinate judging — all in one place.

Built with **SvelteKit** and **Supabase**, deployed as a container on **Google Cloud Run**,
and installable as a Progressive Web App (PWA) with push notifications.

## Features

- **Points & leaderboard** — members submit point-earning activities for officer approval; an
  ongoing leaderboard ranks the club.
- **Competitions** — create competitions, submit entries, and publish results. Supports BJCP
  style categories and custom category sets.
- **Judging** — a dedicated judge workflow with scoresheets, plus multi-judge ranking groups
  for intraclub competitions (see [`docs/MULTI_JUDGE_RANKINGS.md`](docs/MULTI_JUDGE_RANKINGS.md)).
- **Events & calendar** — schedule club events with an integrated read-only Google Calendar sync.
- **Officer tools** — approvals, member management, reports, competition/event management, and
  notification broadcasts.
- **Roles** — member and officer roles (plus competition-director and judge capabilities),
  enforced at the database layer via Supabase Row Level Security (RLS).
- **Progressive Web App** — installable, with Web Push notifications (VAPID).

## Tech stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Framework  | [SvelteKit](https://kit.svelte.dev/) (Svelte 5)        |
| Backend    | [Supabase](https://supabase.com/) (Postgres, Auth, Realtime, RLS) |
| Hosting    | Docker → Google Cloud Run (via Cloud Build)            |
| Adapter    | `@sveltejs/adapter-node`                               |
| PWA/Push   | `web-push` (VAPID)                                     |
| PDF export | `jspdf`                                                |
| Testing    | [Playwright](https://playwright.dev/)                  |

## Getting started

### Prerequisites

- Node.js **22+** (see [`.nvmrc`](.nvmrc))
- A [Supabase](https://supabase.com/) project

### Installation

```bash
git clone https://github.com/MattPOlson/jax-points-tracker.git
cd jax-points-tracker
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                    | Description                                                    |
| --------------------------- | ------------------------------------------------------------- |
| `VITE_SUPABASE_URL`         | Supabase project URL (embedded in the client bundle)          |
| `VITE_SUPABASE_ANON_KEY`    | Supabase anon/public key                                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-side only, never expose**         |
| `VITE_VAPID_PUBLIC_KEY`     | VAPID public key for Web Push                                 |
| `VAPID_PRIVATE_KEY`         | VAPID private key — server-side only                          |
| `VAPID_SUBJECT`             | VAPID subject, e.g. `mailto:admin@jaxale.com`                 |
| `GOOGLE_CALENDAR_ID`        | Public Google Calendar ID to sync                             |
| `GOOGLE_CALENDAR_API_KEY`   | Google API key restricted to the Calendar API                |

Generate VAPID keys with:

```bash
node -e "const wp = require('web-push'); console.log(JSON.stringify(wp.generateVAPIDKeys(), null, 2));"
```

### Run in development

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Note: login is required for all data — RLS is enabled
on every table.

## Available scripts

| Command               | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Start the Vite dev server                       |
| `npm run build`       | Production build                                 |
| `npm run preview`     | Preview the production build                     |
| `npm run check`       | Type-check with `svelte-check`                  |
| `npm run lint:css`    | Lint CSS/Svelte styles with Stylelint           |
| `npm run lint:inline` | Check for disallowed inline styles              |

## Testing

End-to-end tests use Playwright. See [`PLAYWRIGHT_TESTING.md`](PLAYWRIGHT_TESTING.md) for details.

```bash
npx playwright test
```

## Database

Schema and migrations live as SQL files in the repository root and in [`supabase/`](supabase/).
The database uses Supabase Row Level Security — all tables have RLS enabled, so authentication
is required to read or write any data.

## Deployment

The app is containerized ([`Dockerfile`](Dockerfile)) and deployed to Google Cloud Run via
Cloud Build ([`cloudbuild.yaml`](cloudbuild.yaml)). `VITE_*` variables are baked in at build
time as `--build-arg` substitutions; server-only secrets are supplied to the running service.

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_VITE_SUPABASE_URL=...,_VITE_SUPABASE_ANON_KEY=...,_VITE_VAPID_PUBLIC_KEY=...
```

The container serves on port `8080` and includes a health check for Cloud Run.

## Project structure

```
src/
├── lib/
│   ├── components/   # Shared UI components (incl. ui/ design system)
│   ├── stores/       # Svelte stores for app state & data access
│   ├── utils/        # Helpers (dates, entry numbers, …)
│   └── supabaseClient.js
├── routes/
│   ├── api/          # Server endpoints (push, calendar)
│   ├── competitions/ # Entry submission, results, my-entries
│   ├── judge/        # Judging workflow & scoresheets
│   ├── officers/     # Approvals, members, reports, management
│   ├── events/       # Club events
│   ├── leaderboard/  # Club leaderboard
│   └── ...
static/               # PWA manifest, icons, robots.txt, sitemap
supabase/             # Supabase config & migrations
```

## License

No license file is currently included; this is a private project for the JAX Ale Exchange club.
