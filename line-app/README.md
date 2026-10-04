# Vinfinity LINE + Booking (Phase 1)

Next.js 15 on Vercel + Postgres (Neon). Customer side lives in LINE (rich menu, consent, LIFF booking, confirmation card, D-1 reminder). Staff side is `/staff` (Today board, Lead inbox, Appointments, Settings, Team).

## Look and feel
Same CI v2 as vinfinityclinic.com (`assets/styles.css`): Midnight #0B142E, Royal #1E3470, Sapphire #3A5496, Silver Ice #D5DDEE, Mist #EEF2F8, gradient 135°; Montserrat (Latin, numbers) + Kanit (Thai), self-hosted in `public/fonts` (no Google Fonts request). Logo mark in `public/brand`, favicon `app/icon.svg`. The staff menu is grouped by task (งานวันนี้ / ลูกค้า / ธุรกิจ / ตั้งค่า), shows only what the role can open, and carries live badges (photos to take, chats waiting, care requests, recalls due). Long client pages have a sticky section bar. Keep Thai labels free of wide letter-spacing.

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

## Revenue, recall and reports (CRM full loop)
- **Payments** (client page → การชำระเงิน; BM / FD / CS): record each payment against the client and, if any, the plan; plan rows show paid / outstanding; the header shows lifetime spend. Receipt numbers run per month in Buddhist years (`RC6910-0001`) and are printable at `/staff/receipts/[id]` (a clinic receipt, **not** a tax invoice). Only BM can void, with a reason; voided rows and numbers stay.
- **Recall** (`/staff/recall`): catalog items carry a repeat cycle (`รอบ … วัน` on the price catalog page; defaults filler 270, toxin 120, skin booster 28, Doublo 180). The newest treatment of an item opens a recall. Daily after 10:00 the scheduler sends a LINE invite `recallLeadDays` (default 7) before the due date **only** when BM has switched it on and the client gave marketing consent; everyone else goes to the staff call list (and one group alert). A new appointment marks it booked, a repeat treatment marks it superseded. Second tab: clients not seen for 6+ months. Message text is a draft for the doctor to approve.
- **Reports** (`/staff/reports`; BM, MK): funnel by first-touch source for new clients in the period (new → booked → arrived → treated → paid → came back, revenue so far and per paying client), revenue and receipts in the period, new vs returning revenue, payment methods, treatments, recall conversion, revenue by month. Treated counts come from "ทำแล้ว" on the plan, so the team has to press it.

## Photo studio (Next Motion style)
**Getting in:** side menu **📷 Photo Studio** (second item, clinical roles only) is the home: today's photo queue with one big button per visit (ถ่ายก่อนทำ → ถ่ายหลังทำ → ถ่ายต่อ), client search for walk-ins, follow-ups due, the before & after gallery. The same one-tap camera button is on the Today board (column ภาพ), in the client page header and in the client list. The angle set is picked from what the client came for (ใต้ตา → under-eye, ปาก/คาง → lips, ยก/Doublo/HIFU → jaw, else face 5). On the iPad, open Photo Studio → Share → Add to Home Screen for a "Photo Studio" icon.
Client page → **PHOTO STUDIO** → choose ก่อนทำ / หลังทำทันที / ติดตามผล and a protocol (face 5 angles, under-eye, lips/chin, jaw/neck) → **เปิดกล้อง**.
- Live camera on the clinic iPad (`/staff/clients/[id]/capture`). Every shot is stored as a 3:4 crop, so the **ghost** of the earlier photo of the same angle (taken from the latest earlier "before" session) lines up 1:1. Opacity slider, alignment guides, 3-second timer, switch camera; Bluetooth shutter remotes (Enter / space / volume-up) work. Hold "กดค้างเพื่อเทียบ" to flick between the new shot and the reference.
- Each session links to today's appointment, the latest consult and (after / follow-up) the latest treatment. A retake replaces the shot while the session is open; **บันทึกชุดภาพ** locks it. Empty sessions can be discarded.
- **Automatic before & after:** every after / follow-up session pairs itself with the before session of the same course (the latest before taken ahead of the treatment, sharing at least one angle). Saving an after / follow-up session opens the swipe slider straight away.
- Swipe slider: drag or swipe left-right anywhere on the photo; it sweeps once by itself when a pair or angle opens; angle tabs, replay, full screen (to show the client on the iPad), arrow keys. Shown on the client page (latest pair), on `/staff/clients/[id]/compare` (all pairs, or pick any two sessions, or side by side) and as a 30-day gallery on `/staff/photos`.
- Today board: column **ภาพ** (no before photos yet = red) and a KPI for follow-up shots due at D14 / D30 / D90. The list is under **ภาพก่อน-หลัง** (`/staff/photos`).
- Photos stay in Postgres (never the device gallery). The API refuses uploads without data consent (FR-11), and every capture, view and compare is written to `health_access`.
- Safari needs camera permission for the app domain (HTTPS). Use the same backdrop, light and distance every time.

## Notes
- Consent text is a draft (`consentVersion`), pending legal/doctor review.
- Pushes count against the OA plan quota; reminders are D-1 only. Check the plan before launch.
- SLA watchdog (10/30 min alerts) needs a per-minute cron, not in Phase 1 on the Hobby plan; Leads highlights waits > 10 min instead.
