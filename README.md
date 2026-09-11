# StudyLite

Gamified student learning MVP: **Study. Level Up. Repeat.**

> **Central promise:** StudyLite doesn't just help students study.  
> **It helps them build a study habit.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- **Postgres (Docker) + Drizzle** for student app progress (recommended)
- Optional localStorage fallback when `NEXT_PUBLIC_USE_POSTGRES` is unset
- Supabase-ready schema for admin / cloud deployment
- AI Tutor with OpenAI support + **mock fallback** (demo-safe)

## Product architecture

```text
                 STUDYLITE
                     │
        ┌────────────┴────────────┐
        │                         │
     LEARNING                  HABIT
        │                         │
   Lessons                    Streaks
   Quizzes                    Missions
   AI Tutor                   Reminders
   Feedback                   Goals
        │                         │
        └────────────┬────────────┘
                     │
                GAMIFICATION
                     │
              XP • Levels
           Achievements
            Leaderboards
             Challenges
                     │
                     ↓
              STUDENT RETENTION
                     │
                     ↓
             "COME BACK TOMORROW"
```

## Quick start (Postgres)

```bash
npm install
cp .env.example .env.local
docker compose up -d
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`NEXT_PUBLIC_USE_POSTGRES=true` makes the student app use Docker Postgres via `/api/student` (auth, missions, quizzes, XP, leaderboard, challenges). Battle arena UI still keeps match state in the browser and writes XP/notifications to Postgres when claiming rewards.

### LocalStorage-only fallback

Omit `NEXT_PUBLIC_USE_POSTGRES` (or set it to `false`) to run without Docker — progress stays in `localStorage`.

### Demo login (presentation-ready)

| Field | Value |
| --- | --- |
| Email | `demo@studylite.app` |
| Password | `demo1234` |

Or use **Continue as demo user** on the login page.

### Recommended demo story

```text
Login → Dashboard → Battle Hub → Quick Match → 3-2-1 → Answer → Results → XP
→ Leaderboard → Challenge #above you → Rematch
```

Or the habit loop:

```text
Login → Dashboard (Today's Mission) → Lesson → Quiz → Results → Leaderboard → AI Tutor
```

### Live Battle (Demo Mode)

Nav → **Battle**:

- **Quick Match** — 10 questions, 10s timer, simulated opponent
- **Challenge** from leaderboard student cards
- Synchronized scoring (correctness > speed)
- XP once per battle (anti-abuse claim flag)
- Battle history + stats + achievements

Without Supabase Realtime this runs as **Demo Battle**. Schema for true multiplayer is in `supabase/battles.sql`.

## Admin (Railway Postgres)

Admin uses the **same** `DATABASE_URL` as the student app (Railway).

1. Ensure Postgres is seeded: `npm run db:setup`
2. Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
3. Log in with seeded admin:
   - Email: `admin@studylite.app`
   - Password: `admin1234`
4. Or create an account, then promote it:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@email.com';
```

Admin routes: `/admin`, `/admin/subjects`, `/admin/topics`, `/admin/lessons`, `/admin/questions`, `/admin/users`

Content edits in admin update the same tables the student app reads from Postgres.

## Demo mode (cannot break)

Without cloud AI keys, StudyLite still works:

- With Postgres: profiles, XP, streaks, quizzes, missions, achievements → Docker DB
- Without Postgres flag: same data in `localStorage`
- Seed content ships in-app (4 subjects · 12 topics · 24 lessons · 120 questions)
- AI Tutor returns helpful mock answers if no `OPENAI_API_KEY`

## Postgres

```bash
docker compose up -d
npm run db:setup
```

Uses port **5433** by default (`DATABASE_URL` in `.env.local`).

You can point `DATABASE_URL` at any Postgres instance (including Supabase’s connection string) later; the student API uses Drizzle against that URL.

## Deploy on Vercel

1. **Create cloud Postgres** (free): [neon.tech](https://neon.tech) → New project → copy the connection string (`?sslmode=require`).

2. **Seed that database** once from your machine:

```bash
# PowerShell
$env:DATABASE_URL="postgres://USER:PASS@HOST/DB?sslmode=require"
npm run db:setup
```

3. **Log in to Vercel** (one-time in a terminal):

```bash
vercel login
```

4. **Deploy** from the project folder:

```bash
vercel --prod
```

5. In the Vercel dashboard → Project → **Settings → Environment Variables**, set:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | your Neon connection string |
| `USE_LOCAL_DB` | `true` |
| `NEXT_PUBLIC_USE_POSTGRES` | `true` |

Then redeploy (**Deployments → … → Redeploy**) so the env vars apply.

### GitHub + Vercel (optional, nicer long-term)

```bash
gh auth login
# create a GitHub repo, commit, push, then Import on vercel.com
```

Keep `.env.local` out of git (already in `.gitignore`).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run db:setup` — push schema + seed Postgres
- `npm run lint` — ESLint

## Core loop

Sign up → onboard → **daily mission** → lesson → quiz → XP/streak → progress → leaderboard → come back tomorrow.
