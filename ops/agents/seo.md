# seo agent

## Backlog (top = next)
1. Content (week of 2026-11-02, max 1/week): TH "ฟิลเลอร์ขมับ อุดร" page — 2026-10-31 search shows only HDmall/aggregator pages, no Udon clinic page; temple filler is in schema knowsAbout and on the price table but has no page. Draft as branch agent/seo-<date>, facts from site only.
2. Ask doctor (strategy, do not change): titles/URLs use "โบท็อก" (brand-derived word) while the mission says toxin without brand names. Thai search volume is on "โบท็อก"; keep or switch to "ฉีดลดริ้วรอย/โบทูลินัมท็อกซิน"?
3. Set up Google Search Console access so this agent can read real queries/impressions (Adspirer connector has a google_search_console tool — check if the account is linked). Meta/TikTok pixel IDs still empty in `window.VF`.
4. Remaining TH meta descriptions 164–168 codepoints (home, lifting, dissolve page, same-filler article, price 165 incl. prices) — fine visually, trim only if Search Console shows truncation.
5. Remaining long TH titles (codepoints incl. tone marks): home 72, price 74, filler 72, skin-booster 71, chin 70. EN tear-trough 70.
6. Off-site: Thai SERPs for "ฟิลเลอร์ใต้ตา อุดรธานี" / "ฟิลเลอร์ขมับ อุดรธานี" dominated by HDmall; EN by WhatClinic/Thaiger. Hand to marketing agent: claim/verify listings (no paid ads).
7. EN "botox Udon Thani"/"anti-wrinkle Udon Thani" — check SERPs, consider after temple page.
8. Lao (LO) pages do not exist yet — build only has TH/EN. If Vientiane patients matter, plan /lo/ with hreflang lo.
9. Banned-word sweep of EN body copy beyond award names.
10. Physician JSON-LD `award` lists Galderma awards (historical, OK as past awards) — leave.

## Log
### 2026-10-31 (commit eaf176e)
- Main (technical): trimmed 12 TH meta descriptions 171–189 → 136–165 codepoints in build.py (filler, price, sculptra, toxin, lips, doctor + 6 articles). Prices and facts unchanged; only "ที่ Vinfinity Clinic อุดรธานี"/"โดย นพ.…" tails and filler words removed. Article JSON-LD descriptions follow the same vars.
- Main (same commit): footer stacked logo now loading="lazy" decoding="async" on all TH/EN pages (only below-fold image without it). Remaining 130 non-lazy imgs = header logos + hero/article cover images (above the fold, correct).
- Rebuild also refreshed sitemap lastmod (39 URLs → 2026-10-28, from the tear-trough case-33 commit that hadn't been rebuilt).
- Audit: 51 pages, 0 duplicate titles/descriptions, 0 broken internal links, all JSON-LD parses, canonical everywhere except /menu/ (noindex, intended).
- Live: production dpl_DhDnp2J4fLDh4hMUgNKNfmrsGZRi (commit dcd6569) READY; /price/ renders 200 with valid schema.
- Resolved old question: "สกินบูสเตอร์เริ่ม 8,900" matches Ejal 40 (8,900/ครั้ง) on the price page — not a conflict with Vitaran 9,990.
- Keyword: "ฟิลเลอร์ขมับ อุดรธานี" — no Udon clinic page ranks (HDmall/KTC/gangnamunni only) → backlog #1 for next week.
### 2026-10-30 (doctor)
- English consultations: yes. medicalSpecialty "Dermatology": keep. Remove these from the backlog.
### 2026-10-30 (doctor, via main session)
- Doctor approved everything from the first runs: agent/seo-20261030 (Vitaran/PN section on skin-booster TH/EN). Merged to main where it was a branch. Do not re-ask about these.
### 2026-10-30
- Main (technical, commit a949aac): short search titles for all 12 EN articles (80–102 → 52–65 chars, via `_SEO_TITLES` in i18n_en.py; on-page H1 and JSON-LD headline unchanged) and 3 TH articles (facial-ligaments 85→52, sculptra-ellanse 80→66, filler-long-term 78→69) in build.py.
- Main (same commit): sitemap.xml now carries hreflang pairs (th/en/x-default `xhtml:link`) for all 50 URLs, generated in `write_sitemap()`; xmllint OK. Backlog item 10 done.
- Audit: 51 pages, 0 duplicate titles/descriptions, all JSON-LD parses, canonical everywhere except /menu/ (noindex, intended). Images: all served as WebP, largest 217 KB — backlog item 8 closed.
- Live: latest production deployment dpl_78wHx26xU8tqirKk1NAwB5H3TnPK (commit 00e50f7) READY; /skin-booster/ renders 200 with valid schema. GA4 ID is now set (G-390ZZ2GPSP).
- Keyword check: web search "Vitaran อุดรธานี คลินิก" shows no clinic page ranking for it (only unrelated directories) → opportunity.
- Branch agent/seo-20261030 (commit 8ffb2c3, needs doctor approval): Vitaran (PN) section on /skin-booster/ TH+EN using only facts already on the site (20 mg/mL, Vitaran I/II, price 9,990 / 8,990 for 4+, Lift & Glow, Foundation programs) + link to PN article.
- Found: skin-booster FAQ "เริ่มต้น 8,900 บาทต่อครั้ง" vs price page Vitaran 9,990/box — not changed (prices are doctor-only); asked in backlog.
### 2026-10-29 (doctor, via main session)
- Approved and merged agent/seo-20261029 (banned-word fixes) to main. Galderma trainer lines on /doctor/ (TH/EN) changed to past tense. Still open: medicalSpecialty "Dermatology" — waiting for the doctor's answer, do not change yet.
### 2026-10-29
- First run: audited 51 built pages. No duplicate titles/descriptions, all canonical + hreflang (th/en/x-default) present and correct, every indexable page in sitemap, all JSON-LD parses, 0 broken internal links, robots.txt OK. /menu/ is noindex on purpose. Alt="" only on decorative logo mark and duplicate before/after slider images (intended).
- Live check: vinfinityclinic.com is blocked from this sandbox (proxy 403); checked production deployment dpl_CdimzPFThsfo1rMgRVEJccdbixGa (READY, commit be3aaa6) via Vercel — /filler/tear-trough/ renders 200 with full JSON-LD.
- Main (technical, commit 1fefdc9): shortened TH home + doctor titles, 13 EN titles (e.g. home 82→62 chars, price 91→58, doctor 89→60); trimmed TH home/price meta descriptions; removed "เห็นผลทันที" from TH chin meta and "visible straight away" from EN chin meta (banned claims). Files: build.py, i18n_en.py + rebuilt HTML.
- Branch agent/seo-20261029 (commit 4c36fd2, needs doctor approval): body/FAQ wording without banned words on filler-chin, sculptra, collagen-stimulator article and 2 FAQ answers in build.py (เห็นผลทันที → เห็นการเปลี่ยนแปลงหลังฉีด, ผลดีที่สุด → ผลดี, ถาวร → อยู่จนกว่าจะผ่าตัดเอาออก).
- Found: analytics IDs empty; sitemap lastmod stale and hand-maintained; medicalSpecialty "Dermatology" in schema unverified; no Vitaran/PN named on skin-booster pages.
- Manual test run (same day): sitemap.xml is now generated by build.py (`write_sitemap()`), from every TH page + EN twin built that run. lastmod = last git commit of the page's body template, priority and article images kept. Result: 50 URLs, same set as before; lastmod now real (home/price 2026-10-06 → 2026-10-25, after the Vitaran price change; articles 10-03 → 10-07…10-10). Validated with xmllint.
- Branch agent/seo-20261029 still waiting for the doctor (preview vinfinityclinic-site-hkc8aojeq-dechowat-9677s-projects.vercel.app).
