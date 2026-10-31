# branding agent

## Backlog (top = next)
1. Doctor approves `agent/branding-20261031` (6 descriptive "ที่สุด" softened on /filler/, /filler/lips/, /filler/tear-trough/, /filler/dissolve/ + lips FAQ in build.py). Re-check after merge.
2. Audit rotation next: public social profiles (Facebook, Instagram, TikTok, Google Business Profile, LINE OA) via web search — name/handle consistency "Vinfinity Clinic" + "The Filler Architect", bio says ว.48943, no Galderma as current, no banned words.
3. Proposal (needs doctor's call): /doctor page shows 5 Galderma event/award photos vs 1 IMCAS photo — consider leading the gallery with IMCAS / Vivacy Paris 2025 and keeping Galderma photos lower as history.
4. Menu pages, part 2: check TH↔EN parity of section order/claims on /toxin/, /skin-booster/, /lifting/, /sculptra/; results-section caption "ผลลัพธ์ไม่ดูเหมือนทำมา" (CASE 13) reads as an outcome promise — ask doctor whether to soften (consent-gated area, do not edit without approval).
5. JSON-LD Physician `award` (build.py:88) lists Galderma awards first on every page — consider ordering ODESS 2024 first (needs approval, credential presentation).
6. Lao (LO) pages: none exist on the site yet — brand book has no LO voice sample; ask doctor whether LO is planned (Vientiane patients).
7. Wording check: pages/article-tear-trough-candidates.html:60 "ได้ผลดีที่สุด" (cited study subgroup) — soften to "ได้ผลดีกว่า" if ฆสพ. reviewer prefers zero "ที่สุด". home.html:29 doctor quote "ไม่ได้มาจากยาที่แพงที่สุด" is a negation — leave unless reviewer objects.
8. Authority piece (weekly, next due week of 2026-11-09): "The Filler Architect case-planning" explainer (how a face is mapped before injecting: ligaments, layers, order of support), using only content already in our articles.

## Brand book (keep short)
**Names.** Vinfinity Clinic (Udon Thani; Vientiane) · นพ.เดโชวัต พรมดา / Dechowat Promda, M.D. · "The Filler Architect" · ว.48943 always next to the doctor's name on profile pages. Tagline in use: "Data-driven precision, Art-driven result".
**Voice.** Warm, precise, never pushy. Explain the why (anatomy, layers, safety) before the what. Short sentences. Talk to the patient as "คุณ"; doctor = "คุณหมอ". English: calm clinical British/US neutral, no hype. One clear CTA (LINE @vinfinityclinic), never countdowns or "limited slots".
**Do say.** ประเมินเฉพาะบุคคล · วางแผนตามโครงสร้างใบหน้า · ฉีดโดยแพทย์ทุกเคส · เปิดกล่องตรวจสอบต่อหน้า · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · ธรรมชาติ / natural, individual, planned, doctor-injected, results vary.
**Don't say.** ดีที่สุด, อันดับ 1, 100%, การันตี, หายขาด, เห็นผลทันที, ถาวร, ไม่เจ็บ, เชี่ยวชาญ, ชำนาญ, any "ที่สุด"; best, guaranteed, permanent, instant, painless, expert, specialist, risk-free; toxin brand names; Galderma as a current role (OK only as dated history: awards 2021/2024, GAIN 2021/2024, Kysse 2022, "former/เคยเป็น" trainer).
**Current authority (verifiable).** IMCAS Asia 2023 faculty + Live Demonstration · KOL Vivacy · MNB · IMCAS · Vivacy training, Paris 2025 · ODESS Winner 2024 (France) · lecturer, Digital Health (KMITL, Chulalongkorn, KKU) · AI in Healthcare (NUS).
**CI tokens** (assets/styles.css :root): navy #0B142E · navy-2 #1A326B · royal #1E3470 · sapphire #3A5496 · peri #8698B5 · silver #D5DDEE · mist/pearl #EEF2F8 · muted #5A6480. Gradient 135° navy→navy-2→sapphire. Fonts: Montserrat (Latin) + Kanit (Thai), self-hosted. Radius 18px. No gold, no pink, no pure black.
**Photo rules.** Written patient consent before any face is shown; eye bars unless consent covers the full face; labels PRE / POST (never before/after, ก่อน/หลัง); same angle, light and crop (tools/align_ba.py, no retouching); ฆสพ. approval before publishing. AI or stock images carry "ภาพประกอบ" (EN "Illustration"). No product boxes of toxin brands. Doctor photos: real events only, captioned with event + year.
**Descriptive superlatives.** Avoid "ที่สุด" even in anatomy/aftercare facts (ฆสพ. reviewers flag the word itself): use "มากเมื่อเทียบกับ…", "เป็นพิเศษ", "โดยเร็ว", "ชัดในช่วง…".
**Logo.** assets/vinfinity-logo-h.svg (horizontal, web header), -stacked (square/social), vinfinity-mark.svg (favicon/avatar). White or silver on navy, navy on white/mist. Clear space ≥ height of the mark; never stretch, recolour, shadow or place on busy photos.

## Authority brief → marketing agent (week of 2026-11-02)
"IMCAS Asia 2023 Live Demonstration — what a live demo teaches about planning": 1 carousel (5 slides) + 1 short article section. Facts allowed: faculty + live demo at IMCAS Asia 2023 (photo /assets/img/doctor/imcas-asia-2023-live-demo.jpg), the doctor's layered/ligament approach as already written in /articles/layered-injection-anatomy/ and /articles/facial-ligaments-aging/. No patient faces, no product brands, no outcome claims; end with "ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล" + LINE CTA. Draft only, doctor approves.

## Log
### 2026-10-31
- Audit area: menu pages (/price/, /filler/ + chin/lips/tear-trough/dissolve, /toxin/, /skin-booster/, /lifting/, /sculptra/), TH + EN.
- OK: footer legal line on every page carries "ผลลัพธ์ของการรักษาขึ้นอยู่กับแต่ละบุคคล" / "Results vary from person to person" + ฆสพ.อด.100/2568; 0 broken images; 0 off-palette inline colours; no Galderma; no toxin brand names; results cards use PRE/POST (7 cases) with consent note TH/EN. Only images on menu pages are the consented tear-trough cases (no AI images → no "ภาพประกอบ" needed).
- Found: 6 descriptive "ที่สุด" (anatomy/aftercare, not clinic claims) on filler pages → branch `agent/branding-20261031` (bc4917d) softens wording, no meaning change. Waiting for doctor.
- Not changed: CASE 13 caption "ผลลัพธ์ไม่ดูเหมือนทำมา" (consent-gated, flagged in backlog); "Sculptra" product name is fine (not a toxin brand; not an affiliation claim).
- Authority brief for week of 2026-11-02 already handed to marketing (below); next due week of 2026-11-09.
### 2026-10-30 (doctor, via main session)
- Doctor approved everything from the first runs: agent/branding-20261030 (doctor credentials lead with IMCAS Asia 2023 + current KOL roles; Galderma as past). Merged to main where it was a branch. Do not re-ask about these.
### 2026-10-30
- First run. Audit area: website (TH/EN; no LO pages exist). CI tokens in assets/styles.css match the Royal Blue & Silver spec; fonts Montserrat + Kanit only. README CI line was outdated (old navy #041738, Anuphan/Cormorant) → corrected on main.
- Found: "Galderma" appears in 24 TH + EN generated pages (Physician JSON-LD awards), and on /doctor (5 photos, timeline, awards). Highest-visibility spots presented Galderma as the lead credential: the /doctor hero badge and the /filler trust bullet; TH FAQ "คุณหมอสอนที่ไหน" read the Galderma trainer role in present tense (compliance/reputation risk).
- Branch `agent/branding-20261030` (44531ba): hero badge + /filler bullet → "IMCAS Asia 2023 · Faculty · Live Demonstration"; FAQ TH/EN now leads with IMCAS + KOL Vivacy·MNB·IMCAS and says Galderma training was past. Awards history untouched. Waiting for doctor.
- Banned-word scan of pages/: no clinic-claim hits (only cited science context: "ผู้เชี่ยวชาญ" groups, "permanent damage", "Expert Perspectives" paper title).
- Wrote brand book (above) and first weekly authority brief for the marketing agent.
