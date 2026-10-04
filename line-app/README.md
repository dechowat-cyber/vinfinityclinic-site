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

## When the Messaging API channel is in someone else's provider
LINE does not let a channel move between providers. The app still works:
- Put `LINE_CHANNEL_ID` + `LINE_CHANNEL_SECRET` (OA Manager → Settings → Messaging API) in Vercel; the app issues its own short-lived tokens.
- Set the webhook URL in the same OA Manager page.
- Leave `NEXT_PUBLIC_LIFF_ID` empty: the rich menu sends a postback and the bot replies with a signed personal booking link (45 days).
- LINE Login for staff can live in your own provider.

## Scheduler (every 5 minutes)
`/api/cron/tick` runs SLA watchdog (FR-07), wait timer (FR-19), T-2h reminder (FR-15), no-show + rebook (FR-16),
nurture D1/D3/D7 (FR-09), aftercare D0/D1/D3/D7 (FR-32), care escalation (FR-33), D14 CSAT + review (FR-34/35),
plan follow-up D2 (A09), D-1 reminder 18:00 and the 20:00 unconfirmed list. Every step is idempotent (`jobs` table).
GitHub Actions (`.github/workflows/line-tick.yml`) calls it without a secret (throttled, returns no details); Vercel cron with CRON_SECRET gets the summary.
Settings → kill switch pauses all automatic messages. Aftercare stays off until a doctor approves the texts.

## Photo studio (Next Motion style)
Client page → **PHOTO STUDIO** → choose ก่อนทำ / หลังทำทันที / ติดตามผล and a protocol (face 5 angles, under-eye, lips/chin, jaw/neck) → **เปิดกล้อง**.
- Live camera on the clinic iPad (`/staff/clients/[id]/capture`). Every shot is stored as a 3:4 crop, so the **ghost** of the earlier photo of the same angle (taken from the latest earlier "before" session) lines up 1:1. Opacity slider, alignment guides, 3-second timer, switch camera; Bluetooth shutter remotes (Enter / space / volume-up) work. Hold "กดค้างเพื่อเทียบ" to flick between the new shot and the reference.
- Each session links to today's appointment, the latest consult and (after / follow-up) the latest treatment. A retake replaces the shot while the session is open; **บันทึกชุดภาพ** locks it. Empty sessions can be discarded.
- `/staff/clients/[id]/compare`: before vs after per angle, as a wipe or side by side.
- Today board: column **ภาพ** (no before photos yet = red) and a KPI for follow-up shots due at D14 / D30 / D90. The list is under **ภาพก่อน-หลัง** (`/staff/photos`).
- Photos stay in Postgres (never the device gallery). The API refuses uploads without data consent (FR-11), and every capture, view and compare is written to `health_access`.
- Safari needs camera permission for the app domain (HTTPS). Use the same backdrop, light and distance every time.

## Notes
- Consent text is a draft (`consentVersion`), pending legal/doctor review.
- Pushes count against the OA plan quota; reminders are D-1 only. Check the plan before launch.
- SLA watchdog (10/30 min alerts) needs a per-minute cron, not in Phase 1 on the Hobby plan; Leads highlights waits > 10 min instead.
