# seo agent

## Backlog (top = next)
1. Generate sitemap.xml from build.py (today it is hand-written; lastmod is stale at 2026-10-03…10 for every URL). Add EN URLs' lastmod from page/article dates; keep image:image entries.
2. Doctor to decide: JSON-LD `medicalSpecialty: "Dermatology"` on MedicalClinic + Physician (build.py) — is that accurate? If not, remove it (technical fix on main once confirmed). Also Physician `award` lists Galderma awards (historical; README says Galderma is not a current affiliation — wording on /doctor/ says "Galderma AART trainer" in present tense).
3. GA4 / Meta / TikTok IDs are empty in `window.VF` on every page → no analytics. Ask the doctor for the GA4 ID; set up Google Search Console access so this agent can read real queries.
4. Content gap (branch draft, max 1/week): skin-booster page never mentions Vitaran or PN by name in TH/EN even though the mission targets "Vitaran อุดร" / "PN อุดร". Propose a /skin-booster/pn-vitaran/ sub-page or a section (needs doctor-verified product/price facts).
5. Trim the remaining long titles: TH price (74), TH chin (70 incl. marks), EN tear-trough (70), EN articles (headline + suffix 80–100 chars → add a short `seo_title` separate from the on-page headline).
6. Long TH meta descriptions still >170: doctor (178), price (187 raw), filler (187 raw) — trim without touching prices.
7. Off-site: Thai SERPs for "ฟิลเลอร์ใต้ตา อุดรธานี" are dominated by HDmall/aggregators; EN "filler clinic Udon Thani" by WhatClinic/Thaiger deals. Hand to marketing agent: claim/verify listings (no paid ads).
8. Lao (LO) pages do not exist yet — build only has TH/EN. If Vientiane patients matter, plan /lo/ with hreflang lo.
9. Check image weight: list largest files in assets/img and convert to WebP/AVIF with width/height kept.
10. Banned-word sweep of EN body copy beyond award names ("Best Result on Difficult Case" is a proper noun — OK).

## Log
### 2026-10-29
- First run: audited 51 built pages. No duplicate titles/descriptions, all canonical + hreflang (th/en/x-default) present and correct, every indexable page in sitemap, all JSON-LD parses, 0 broken internal links, robots.txt OK. /menu/ is noindex on purpose. Alt="" only on decorative logo mark and duplicate before/after slider images (intended).
- Live check: vinfinityclinic.com is blocked from this sandbox (proxy 403); checked production deployment dpl_CdimzPFThsfo1rMgRVEJccdbixGa (READY, commit be3aaa6) via Vercel — /filler/tear-trough/ renders 200 with full JSON-LD.
- Main (technical, commit 1fefdc9): shortened TH home + doctor titles, 13 EN titles (e.g. home 82→62 chars, price 91→58, doctor 89→60); trimmed TH home/price meta descriptions; removed "เห็นผลทันที" from TH chin meta and "visible straight away" from EN chin meta (banned claims). Files: build.py, i18n_en.py + rebuilt HTML.
- Branch agent/seo-20261029 (commit 4c36fd2, needs doctor approval): body/FAQ wording without banned words on filler-chin, sculptra, collagen-stimulator article and 2 FAQ answers in build.py (เห็นผลทันที → เห็นการเปลี่ยนแปลงหลังฉีด, ผลดีที่สุด → ผลดี, ถาวร → อยู่จนกว่าจะผ่าตัดเอาออก).
- Found: analytics IDs empty; sitemap lastmod stale and hand-maintained; medicalSpecialty "Dermatology" in schema unverified; no Vitaran/PN named on skin-booster pages.
