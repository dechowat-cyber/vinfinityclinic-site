# How every daily agent runs (read after README.md)

SETUP (do this first)
- Work in the repo github.com/dechowat-cyber/vinfinityclinic-site (static site for vinfinityclinic.com; Thai/English/Lao; built with `python3 build.py`). If it is not already in the working directory, clone it. `git pull --rebase origin main` before you start.
- Read ops/agents/README.md (rules) and your own state file (named below) before doing anything. The backlog at the top of your file is your to-do list; the log is what previous runs did. Do not repeat finished work.
- Clinic: Vinfinity Clinic, Udon Thani (also Vientiane, Laos). Doctor: นพ.เดโชวัต พรมดา (Dechowat Promda, M.D.), license ว.48943, "The Filler Architect". LINE @vinfinityclinic, tel 082-462-2963. CI: Royal Blue & Silver (navy #0B142E/#1A326B/#1E3470, silver #D5DDEE/#EEF2F8). Foreign (English-speaking) patients are rising; Thai is primary.

HARD RULES
- Follow ops/agents/README.md exactly. Technical SEO fixes may be pushed to main; anything patients read as content goes to a branch agent/<name>-<yyyymmdd> for the doctor's approval — never merge it yourself.
- Never change prices, the license number, NAP, before/after cases, consent-gated material, or anything in line-app/. Never create, edit or launch ads, post on social media, send messages or emails to anyone other than this report, or change any account setting.
- Never invent facts, statistics, reviews, rankings or awards. Follow Thai medical-advertising limits (banned words listed in the README).
- Work for at most ~25 minutes. Small, finished, verified improvements beat big half-done ones.

END OF RUN (always)
1. Append to the Log in your state file: "### <yyyy-mm-dd>" then 3–8 bullets (done / found / proposed, with file paths, commit hashes, branch names). Update the Backlog (remove finished items, add new ones, keep top 10 ordered by impact).
2. Commit with a clear message ending with the line:
Co-Authored-By: Claude <noreply@anthropic.com>
(and the session link line if your environment provides one), then `git pull --rebase origin main && git push origin main` (state file and any technical fixes go to main; content goes on its own branch).
3. Final reply = the progress report, in Thai, short, for a busy doctor-owner reading on a phone:
   - หัวข้อ: "<AGENT> · <date>" 
   - ✅ ทำแล้ววันนี้ (max 5 bullets, plain words, what changed on the site and why it matters)
   - 🔍 ที่เจอ (max 3 bullets, with numbers you actually measured)
   - 🟡 รออนุมัติ (branch + its Vercel preview URL if any, one line each — find it with the Vercel tools: project prj_XFPlnUswSwtbbIkGDFGOLdAYjIB1, team team_WkZWImwJ3QKAoDUZaCXb4J8l, deployments for that branch) — or "ไม่มี"
   - ➡️ พรุ่งนี้ (1–3 bullets from the backlog)
   No jargon without a 3-word explanation. No more than ~200 words.

4. EMAIL THE REPORT (required — this is how the doctor receives it): send the same report with the Microsoft 365 tool `outlook_send_mail` (load it with ToolSearch "select:mcp__Microsoft_365__outlook_send_mail") to dechowat@healthtag.io only, subject "[Vinfinity Agent] <AGENT> · <d MMM yyyy in Thai>", bodyType "html" (headings/lists, no images). This is the only email you may send, and only to that address. If the tool is unavailable, say so at the top of your final reply. Do not use Gmail (that connector is not set up for this account).
