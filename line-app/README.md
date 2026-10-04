# Vinfinity LINE + Booking (Phase 1)

Next.js 15 on Vercel + Postgres (Neon). Customer side lives in LINE (rich menu, consent, LIFF booking, confirmation card, D-1 reminder). Staff side is `/staff` (Today board, Lead inbox, Appointments, Settings, Team).

## Run locally
```
npm install
npm test                       # unit tests (in-memory Postgres)
SESSION_SECRET=x npm run dev   # /liff?dev_user=U1 and /api/auth/login (dev login)
```
With no `DATABASE_URL` it uses in-memory Postgres; dev login and `dev_user` are disabled in production.

## Deploy
1. Vercel → Add New Project → import the repo, **Root Directory = `line-app`**.
2. Vercel → Storage → add **Neon Postgres** (sets `DATABASE_URL`). Tables are created on first request.
3. Add env vars from `.env.example` (`SESSION_SECRET` and `CRON_SECRET` = long random strings; `APP_URL` = production URL).
4. Redeploy. Crons in `vercel.json`: D-1 reminders 18:00 and staff list 20:00 (Bangkok).

## LINE setup
1. LINE Developers → Provider → **Messaging API channel** for the official account (OA Manager → Settings → Messaging API → enable). Copy channel secret + long-lived access token.
2. Webhook URL = `APP_URL/api/webhook`, Use webhook = on. In OA Manager turn **off** auto-reply and greeting message (the app sends its own).
3. New **LINE Login channel** (same provider). Copy channel ID + secret. Callback URL = `APP_URL/api/auth/callback`. Add a **LIFF app**: size Full, endpoint `APP_URL/liff`, scopes `openid profile`; copy the LIFF ID to `NEXT_PUBLIC_LIFF_ID`. Link the OA to the Login channel.
4. Open `APP_URL/staff/login`, sign in with LINE: the first person becomes manager (BM). Others wait for approval in **Team**.
5. Settings → **Install rich menu**. Invite the bot into the staff LINE group, type one message there, then Settings → use that group.

## Notes
- Consent text is a draft (`consentVersion`), pending legal/doctor review.
- Pushes count against the OA plan quota; reminders are D-1 only. Check the plan before launch.
- SLA watchdog (10/30 min alerts) needs a per-minute cron, not in Phase 1 on the Hobby plan; Leads highlights waits > 10 min instead.
