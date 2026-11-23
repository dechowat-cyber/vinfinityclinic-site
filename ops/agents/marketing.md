# marketing agent

Plans and prepares organic posts only (FB / IG / TikTok / LINE). Never posts, never sends broadcasts, never touches ads.
Graphic style for every brief: real photo + dark navy gradient (#0B142E → #1A326B) + small text footer credit "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band.
Running promotion from 16 Nov: EM Lift Early Bird (promos.ts key emlift-2611, 15–30 Nov 2026) — 4,500 ฿ per area per session (regular 5,990), 4-session course 18,000 ฿ per area (regular 23,960); promo posts end with the โปรเดือนนี้ CTA (the bot shows EM Lift for it). See the EM Lift brief at the end of this file: no specific results, duration or downtime claims.
Standing price (not a promo): Vitaran (PN skin booster) — 1 box 9,990 ฿ · 4+ boxes 8,990 ฿/box · 2 cc/box (matches /price/).
Promotion 1–15 Nov 2026 (doctor approved 2026-10-31): Sculptra 15,990 ฿/vial (regular 24,995), only 10 places, max 2 vials/person, not combined with other promos/packages; place is held 48 h until the person books. Defined in line-app/lib/promos.ts (key sculptra-2611). Every post about it should end with the call to action "ทักไลน์ @vinfinityclinic พิมพ์ “โปรเดือนนี้” หรือกดเมนู 🎁 โปรเดือนนี้" — the bot answers that for free and shows the live seat counter. HArmonyCa Early Bird ended 31 Oct.
LINE broadcast plan (doctor upgraded the LINE OA plan on 2 Nov, quota no longer the limit): Mon 2 Nov 12:00 — Sculptra text + claim card to all friends (media set "Sculptra 15,990 · ข้อความ + การ์ดกดรับสิทธิ์"). UPDATE 2 Nov 23:47 (doctor): two broadcasts sent, 8 of 10 places taken on day 1. Round 2 moved to Wed 4 Nov ~12:30 (after the 48 h holds from Monday expire, so the live number is true) — only if places are left. Once 10 are taken: no more Sculptra posts at 15,990; collect a waitlist for a later batch. (was: Fri 6 Nov ~12:00 — round 2 "เหลืออีก X สิทธิ์" (media set "Sculptra รอบ 2", the number is filled in live; the system refuses if all 10 are taken). Not on Tuesdays (clinic closed). In the daily report, remind the doctor of the next broadcast slot the day before.

Foreign-patient plan for the Udon Thani Horticultural Expo (1 Nov 2026 – 14 Mar 2027), doctor approved 3 Nov: 12 posts EN + Lao, 4–22 Nov (EN Wed/Sat/Mon/Thu/Mon/Fri, Lao Thu/Sun/Wed/Sat/Wed/Sun), drafts in the doctor's doc "Vinfinity · ชุดคอนเทนต์ต่างชาติช่วงพืชสวนโลก (EN + ລາວ)". EN posts close with Messenger m.me/Vinfinity.Clinic (+ LINE); Lao with Messenger (+ WhatsApp once the clinic gives a number). English pages now show a "Not on LINE? Message us in English" strip. In the daily report, name the next foreign post due and its Thai/English caption status; do not re-draft these 12.

Referral event "ชวนเพื่อนมาสวยด้วยกัน" 3 Nov – 15 Dec 2026 (doctor moved the start to 3 Nov): new friend gets a free consultation + 1,000 THB credit on a first treatment of 5,000+; the inviter gets 1,500 THB credit per such friend; 3 such friends → Vitaran 1 cc free (staff hand it out). Defined in line-app/lib/referral.ts. Call to action for posts: "ทักไลน์ @vinfinityclinic พิมพ์ “ชวนเพื่อน” รับลิงก์ของคุณ". Launch broadcast: Tue 3 Nov 12:00 (doctor decided), media set "ชวนเพื่อนมาสวยด้วยกัน", leaving out the Sculptra seat holders; while Sculptra has places left, invite cards and friend welcomes carry its last places (not on Tuesdays). No lucky draws; check wording against medical-advertising rules before public posts.

## Backlog (top = next)
1. Get LINE OA follower count + segment sizes (past skin-booster / filler patients) from LINE OA Manager — broadcast sizes are "not verified" until then. (Ask doctor/team.)
2. All slots to Fri 18 Dec are DRAFT READY (Draft 26 = ligament-lift myth carousel). Next run: add Sun 20 Dec slot (candidate: /articles/filler-long-term/ — the last unused article; then New Year closing-hours Story once the doctor gives holiday hours — not verified). Check promos.ts for a December promo first; if one appears, add the โปรเดือนนี้ CTA to Draft 16/17-era posts.
2b. Doctor to confirm: may a public feed post name the referral credits and the "3 friends → Vitaran 1 cc" reward under the clinic's advertising approval (ฆสพ.)? Draft 10 has a version without the reward line — not verified.
3. Sculptra promo ended Sun 15 Nov 23:59 — never quote 15,990 again. "โปรเดือนนี้" shows EM Lift to 30 Nov (last-call Story = Draft 21). Check promos.ts for a December promo before 1 Dec; from 1 Dec never quote 4,500 / 18,000 as Early Bird.
3b. EM Lift: ask the doctor for the device name + Thai FDA registration wording so captions/site can say more; until then only the facts in the brief. No /lifting/ or /price/ mention of EM Lift yet — SEO agent to propose a branch once the wording is on file.
4. Loy Krathong 2026 = Tue 24 Nov (verified 2026-11-02, PPTV: "วันอังคารที่ 24 พฤศจิกายน"; clinic closed that day). Draft "เตรียมผิวก่อนลอยกระทง" for Sun 15 Nov + a reminder slot Sun 22 / Mon 23 Nov in the next calendar.
4b. Sculptra waitlist post only if the doctor opens a waitlist (no 15,990 price after 15 Nov or after 10 places). Calendar now runs to 29 Nov; roll again ~22 Nov.
5. Map menu images (assets/img/menu/th-01…16, en-, lo-) to treatments so calendar can point to exact files.
6. Short-form video scripts (TikTok/Reels 20–30 s) from existing articles: PN HMW vs LMW (ligaments done, Draft 11).
7. Lao-language caption variant for Vientiane audience (site has lo menu images).
8. Market watch: Udon Thani-local competitor promos (FB pages) — web search surfaced none on 2026-10-30 and 2026-10-31; needs a human to check FB pages or a different source.

## 2-week content calendar (1 Nov – 18 Dec 2026)
Weekdays corrected 2026-11-01 (1 Nov 2026 = Sunday; earlier labels were one day off — dates unchanged). Clinic closed Tuesdays.
| Date | Channel | Topic | Hook | CTA | Asset |
|---|---|---|---|---|---|
| Sun 1 Nov | FB + IG feed (+ Story) | Sculptra promo launch 15,990 ฿ · 10 places · 1–15 Nov — DRAFT READY (Draft 5) | "Sculptra 15,990 บาท เพียง 10 สิทธิ์" | ทักไลน์ พิมพ์ “โปรเดือนนี้” / เมนู 🎁 | assets/img/treatment.jpg (feed) · LINE card image line-app/public/campaign/sculptra-2611/1-1x1.jpg for Story |
| Mon 2 Nov | IG + FB (EN-first) | Foreign patients: how a consultation works (draft ready, English consult confirmed) | "New to Udon Thani? Here's how your first visit works." | LINE @vinfinityclinic / vinfinityclinic.com/en | assets/img/reception.jpg |
| Wed 4 Nov | FB + IG carousel | Tear-trough: 5 look-alike types + consented cases (PRE/POST, organic only) — DRAFT READY | "ใต้ตาคล้ำ ไม่ใช่ทุกคนต้องเติมฟิลเลอร์" | /articles/tear-trough-filler-candidates + LINE | articles/tear-trough-types-filler-candidate.jpg; ba/case01-b (PRE) + case01-a (POST); ba/case09-b (PRE) + case09-a (POST) |
| Fri 6 Nov | TikTok / Reels + FB | Sculptra vs HA filler — timeline — DRAFT READY (end with promo CTA, see 2026-11-01 log) | "เติมปริมาตร vs กระตุ้นคอลลาเจน ต่างกันยังไง" | /articles/sculptra-ellanse-vs-ha-filler | articles/sculptra-ellanse-ha-filler-timeline.jpg |
| Sun 8 Nov | FB + IG | PN HMW vs LMW education (supports Vitaran promo) — DRAFT READY (Draft 6) | "PN ไม่ได้มีแบบเดียว" | /articles/pn-molecular-weight + LINE | articles/pn-hmw-lmw-polynucleotide.jpg |
| Mon 9 Nov | LINE broadcast (week 2, if approved; moved from Tue 10 = clinic closed) | Vitaran 4-box price for past skin-booster patients — TEXT READY (Draft 12, 2026-11-08) | "ราคา 4 กล่อง 8,990 ฿/กล่อง" | ทักกลับเพื่อจองคิว | treatment.jpg |
| Wed 11 Nov | FB + IG Story | 11.11 reminder (no extra discount — current promo only) — DRAFT READY (Draft 7, version A/B by Sculptra seats) | "11.11 นี้ ดูแลผิวแบบวางแผน" | LINE | clinic-lounge.jpg |
| Fri 13 Nov | IG + FB (EN) | Meet the doctor — conference teaching (no Galderma branding) — DRAFT READY (Draft 8) | "Who is The Filler Architect?" | /en/doctor | doctor/imcas-asia-2023-live-demo.jpg |
| Sun 15 Nov | FB + IG | Pre-Loy Krathong skin plan (PN needs time before photos) — festival Tue 24 Nov (verified) — DRAFT READY (Draft 9) | "อีกไม่กี่สัปดาห์ลอยกระทง ผิวพร้อมถ่ายรูปหรือยัง" | LINE ประเมินผิว | treatment.jpg or clinic-lounge.jpg |
| Mon 16 Nov | (foreign plan) | EN post #5 from the doctor's doc "ชุดคอนเทนต์ต่างชาติช่วงพืชสวนโลก" — not re-drafted here | — | Messenger + LINE | per doc |
| Wed 18 Nov | FB + IG feed | Referral event mid-campaign reminder "ชวนเพื่อนมาสวยด้วยกัน" (Sculptra promo ended 15 Nov — no 15,990 price; waitlist line only if the doctor opens one) — DRAFT READY (Draft 10, A/B) | "มาด้วยกัน ได้ทั้งคู่" | ทักไลน์ พิมพ์ “ชวนเพื่อน” | clinic-lounge.jpg or reception.jpg |
| Thu 19 Nov | FB + IG feed (+ Story) | EM Lift launch — Early Bird to 30 Nov (promos.ts emlift-2611) — DRAFT READY (Draft 20) | "ใหม่ที่ Vinfinity · EM Lift ไม่ใช้เข็ม" | ทักไลน์ พิมพ์ “โปรเดือนนี้” / เมนู 🎁 | client photos (woman + man, consented, vendor technician cropped) · Story: line-app/public/campaign/emlift-2611/1-1x1.jpg |
| Fri 20 Nov | TikTok / Reels | Ligaments & aging — why the face "drops" (backlog 6, 25 s script) — DRAFT READY (Draft 11) | "หน้าย้อย เพราะเอ็นหลวมจริงไหม" | /articles/facial-ligaments-aging + LINE | articles/facial-ligaments-aging-anchor.jpg |
| Sun 22 Nov | FB + IG Story | Loy Krathong reminder: clinic closed Tue 24 Nov; book Mon 23 / Wed 25 — DRAFT READY (Draft 13, no discount invented) | "ลอยกระทงอังคารนี้ คลินิกปิด 1 วัน" | LINE จองคิว | facade.jpg |
| Wed 25 Nov | FB + IG carousel | Skincare before/after injections (what to pause, what to keep) — DRAFT READY (Draft 14) | "ฉีดฟิลเลอร์แล้ว ทาเรตินอลได้เมื่อไหร่" | /articles/skincare-routine-filler-botox | articles/skincare-before-after-injection.jpg |
| Fri 27 Nov | IG + FB | Choosing a filler clinic in Udon Thani — checklist (license check ว.48943 on the Medical Council site) — DRAFT READY (Draft 15) | "ก่อนเลือกคลินิก เช็ก 5 ข้อนี้" | /articles/choosing-filler-clinic-udon | articles/filler-clinic-udon-checklist.jpg |
| Sat 28 Nov | FB + IG Story | EM Lift Early Bird last call (ends Mon 30 Nov; no "last chance" pressure wording, no result claims) — DRAFT READY (Draft 21) | "Early Bird ถึง 30 พ.ย." | ทักไลน์ พิมพ์ “โปรเดือนนี้” | emlift-2611 card image |
| Sun 29 Nov | FB + IG | Vitaran PN cool-season skin (prices from /price/: 9,990 · 4+ boxes 8,990/box) — DRAFT READY (Draft 16) | "ลมหนาวมา ผิวแห้งง่าย" | LINE ประเมินผิว | treatment.jpg |
| Wed 2 Dec | FB + IG carousel | Authority: "The Filler Architect" plans by layer — face has 5 layers (from /articles/layered-injection-anatomy/) — DRAFT READY (Draft 17) | "หน้าเรามี 5 ชั้น หมอวางแผนทีละชั้น" | /articles/layered-injection-anatomy + LINE | articles/facial-anatomy-5-layers.jpg |
| Fri 4 Dec | TikTok / Reels + FB | "หน้านิ่งสวย แต่ยิ้มแล้วแปลก" — gel firmness vs layer (from /articles/layered-injection-anatomy/), 20 s — DRAFT READY (Draft 18) | "หน้านิ่งสวย แต่ยิ้มแล้วแปลก เพราะอะไร" | /articles/layered-injection-anatomy + LINE | doctor talking-head (team films) + articles/facial-anatomy-5-layers.jpg |
| Sun 6 Dec | FB + IG carousel | Filler safety by evidence — 5 questions to ask before filler (from /articles/filler-safety-evidence/; no December promo in promos.ts on 15 Nov) — DRAFT READY (Draft 19) | "ก่อนฉีดฟิลเลอร์ ถามหมอ 5 ข้อนี้" | /articles/filler-safety-evidence + LINE | articles/filler-safety-vascular-midface.jpg |
| Wed 9 Dec | FB + IG (EN-first) | Foreign patients: "Visiting the Expo? See the doctor in English" — 4 steps to book from photos (Expo runs to 14 Mar 2027) — DRAFT READY (Draft 22) | "In Udon Thani for the Expo? See an aesthetic doctor in English." | Messenger + LINE | reception.jpg |
| Fri 11 Dec | FB + IG carousel | Evergreen: same filler, different results — gel, tissue, area, layer (from /articles/same-filler-different-results/) — DRAFT READY (Draft 23) | "ฟิลเลอร์ยี่ห้อเดียวกับเพื่อน ทำไมผลไม่เหมือนกัน" | /articles/same-filler-different-results + LINE | articles/filler-volume-retention-lips-vs-cheek.jpg |
| Sun 13 Dec | FB + IG Story | Referral event last call (ends Tue 15 Dec = clinic closed; last open day Mon 14 Dec) — DRAFT READY (Draft 24, A/B per backlog 2b) | "ชวนเพื่อน ถึง 15 ธ.ค." | ทักไลน์ พิมพ์ “ชวนเพื่อน” | clinic-lounge.jpg |
| Wed 16 Dec | FB + IG carousel | Evergreen: filler dissolving — does hyaluronidase damage your own skin? (from /articles/dissolve-filler-native-tissue/) — DRAFT READY (Draft 25) | "สลายฟิลเลอร์แล้ว ผิวเดิมจะเสียไหม" | /articles/dissolve-filler-native-tissue + LINE ส่งรูป + ประวัติการฉีด | articles/hyaluronidase-native-ha-recovery.jpg |
| Fri 18 Dec | FB + IG carousel | Myth vs evidence: "ฉีดยกเอ็น" — ligaments stiffen with age, they don't loosen; support the deep base instead (from /articles/ligament-lift-injection/) — DRAFT READY (Draft 26) | "ฉีดยกเอ็น ได้ผลจริงไหม" | /articles/ligament-lift-injection + LINE ส่งรูป | articles/ligament-lift-injection-support.jpg |

Notes: before/after only from assets/img/ba (consented, already on site), labelled PRE / POST, organic only, never in ads. File naming on site: caseNN-b = PRE (before), caseNN-a = POST (after) — see pages/_results_eye.html. Do not use galderma-* doctor photos (not a current affiliation).

## LINE broadcast ideas (max 1/week, quota ~300/month)
- Week of 2 Nov: none (save quota).
- Week of 16 Nov: none planned yet; candidate = pre-Loy Krathong skin-booster reminder to past PN/skin-booster patients (size not verified) — decide after week-2 response.
- Week of 9 Nov: Vitaran 4-box offer → target: patients who had skin booster in last 12 months. Expected size: not verified (need LINE OA segment count; keep ≤100 to fit quota).

## Log
### 2026-10-30 (doctor)
- English consultations: yes. medicalSpecialty "Dermatology": keep. Remove these from the backlog.
### 2026-10-30 (doctor, via main session)
- Doctor approved everything from the first runs: all drafts and the 2-week calendar from the first run. Merged to main where it was a branch. Do not re-ask about these.
### 2026-10-30
- First run: audited site offers (filler, toxin, skin booster, Sculptra, lifting/Doublo, price page), assets (19 photos, 14 consented B/A cases in assets/img/ba, 13 article graphics, doctor photos, menu images) and set up backlog + 2-week calendar above.
- Verified Vitaran price on /price/ = 9,990 ฿/box, 4+ boxes 8,990 ฿/box, 2 cc/box (matches brief).
- Market watch insight: Bangkok chain Vincent Clinic advertises Rejuran (PN) at 9,999 ฿ (https://vincent.clinic/en/promotion/detail/rejuran-price) — same price point as our Vitaran box; volume per price not verified, so do not compare publicly. No Udon Thani-local PN promos found by web search.
- Trend: English-language content around "salmon DNA" / polynucleotide injections is growing (e.g. https://acibademinternational.com/blog/rejuran-and-polynucleotides-salmon-dna-injections-what-they-are-and-what-studies-show/) → foreign patients likely search "polynucleotide" / "salmon DNA"; use those words in EN captions/hashtags.
- Drafts ready below for 31 Oct and 2 Nov.

#### Draft 1 — Fri 31 Oct · FB + IG feed · Vitaran promo
TH caption:
หน้าหนาวมาแล้ว ผิวพร้อมหรือยัง? 🍂
อากาศเย็นและแห้งช่วงนี้ ผิวหลายคนเริ่มดูหมอง แห้ง และเห็นริ้วรอยเล็ก ๆ ชัดขึ้น

Vitaran (PN Skin Booster) — สารกลุ่ม Polynucleotide ช่วยบำรุงและเสริมความแข็งแรงของผิว เหมาะกับผิวเสีย รูขุมขนกว้าง ริ้วรอยเล็ก

💙 ราคาโปรโมชั่น
• 1 กล่อง (2 cc) 9,990 บาท
• ซื้อ 4 กล่องขึ้นไป เหลือกล่องละ 8,990 บาท

ฉีดโดย นพ.เดโชวัต พรมดา (ว.48943) ปริมาณและจำนวนครั้งขึ้นกับการประเมินของแพทย์
📍 Vinfinity Clinic อุดรธานี
💬 ทัก LINE @vinfinityclinic เพื่อประเมินผิวก่อนนัดคิว
📞 082-462-2963

ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Cool, dry season is here — is your skin ready?
Vitaran (PN skin booster, polynucleotide) helps nourish and strengthen skin: suited to dull skin, enlarged pores and fine lines.
• 1 box (2 cc): 9,990 THB
• 4+ boxes: 8,990 THB per box
Treated by Dr. Dechowat Promda (license ว.48943). Dose and sessions depend on the doctor's assessment.
📍 Vinfinity Clinic, Udon Thani · LINE @vinfinityclinic · 082-462-2963
Results vary from person to person. All procedures carry possible side effects.

Hashtags: #VinfinityClinic #อุดรธานี #คลินิกอุดร #สกินบูสเตอร์ #PN #Vitaran #ผิวหน้าหนาว #Polynucleotide #SkinBooster #UdonThani
Alt text: แพทย์กำลังเตรียมทำหัตถการในห้องทรีตเมนต์ของ Vinfinity Clinic พร้อมข้อความโปรโมชั่น Vitaran 9,990 บาท / Doctor preparing a treatment in the Vinfinity Clinic treatment room, with Vitaran promotion text.
Graphic brief: 1080×1350. Photo assets/img/treatment.jpg, dark navy gradient from bottom 55%. Headline (silver #EEF2F8): "หน้าหนาวนี้ ให้ผิวพร้อม" / sub: "Vitaran PN 2 cc · 9,990.-  |  4 กล่องขึ้นไป 8,990.-/กล่อง". Footer text credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no product-box claims.

#### Draft 2 — Sun 2 Nov · IG + FB (English-first) · foreign patients
EN caption:
New to Udon Thani? Here's how a first visit at Vinfinity Clinic works.
1️⃣ Send us a message on LINE @vinfinityclinic — in English is fine — with what you'd like to improve.
2️⃣ Face-to-face assessment with Dr. Dechowat Promda (license ว.48943) before any treatment.
3️⃣ A written plan and price before you decide. Prices are listed openly at vinfinityclinic.com/en/price
Filler · skin boosters (incl. polynucleotide / "salmon DNA" PN) · Sculptra · lifting.
Results vary from person to person.

TH caption:
ชาวต่างชาติที่อยู่หรือมาเที่ยวอุดรฯ ทัก LINE @vinfinityclinic เป็นภาษาอังกฤษได้ ✨
ขั้นตอน: ทักแชท → พบแพทย์ประเมินก่อนทุกครั้ง → รับแผนและราคาก่อนตัดสินใจ
ดูราคาทั้งหมดได้ที่ vinfinityclinic.com/price
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล

Hashtags: #UdonThani #UdonThaniExpats #VinfinityClinic #AestheticClinicThailand #Polynucleotide #SkinBooster #DermalFiller #อุดรธานี
Alt text: Reception area of Vinfinity Clinic in Udon Thani with "How your first visit works" text in English.
Graphic brief: 1080×1350. Photo assets/img/reception.jpg, navy gradient; 3 numbered steps in silver text; footer credit line as Draft 1 in English. ✅ Unblocked 2026-10-31 (doctor confirmed English consultations) — see updated wording in 2026-10-31 log.

### 2026-10-31
- Done: rolled calendar to 2–15 Nov (added Sat 15 Nov pre-Loy Krathong slot); removed answered English-consult item from backlog; Draft 2 (Sun 2 Nov) unblocked with English-consultation line added (below).
- Done: drafts 3 (Tue 4 Nov tear-trough carousel) and 4 (Thu 6 Nov Sculptra vs HA reel) — facts taken only from the site's own articles.
- Found: on the site caseNN-b = PRE, caseNN-a = POST (pages/_results_eye.html) — carousel must keep that order.
- Found: Loy Krathong 2026 date — search results did not show the date in text; lunar full moon = Tue 24 Nov 2026 (to confirm).
- Market watch insight: English-language clinic content on under-eye filler is framed as "who suits it, the risks and the alternatives" (e.g. https://acibademinternational.com/blog/under-eye-filler-and-tear-trough-filler-who-suits-it-the-risks-and-the-alternatives/) — same angle as our tear-trough article, so the EN caption of Draft 3 leads with "not everyone is a candidate". Udon Thani competitor promos: still none found by web search.
- LINE: no broadcast this week (save quota); week-2 Vitaran 4-box idea stands.

#### Draft 2 update — Sun 2 Nov · EN-first
Replace step 1 in EN caption with: "1️⃣ Message us on LINE @vinfinityclinic in English — consultations are available in English."
Add to TH caption: "ปรึกษาเป็นภาษาอังกฤษได้"

#### Draft 3 — Tue 4 Nov · FB + IG carousel (5 slides) · tear-trough (organic only)
TH caption:
ใต้ตาคล้ำ ไม่ใช่ทุกคนต้องเติมฟิลเลอร์ 👀
"ใต้ตาคล้ำ" หรือ "ใต้ตาโหล" ที่ดูคล้ายกัน ทางการแพทย์แยกได้หลายแบบ และแต่ละแบบแก้คนละวิธี
✔️ ร่อง / เงาจากโครงสร้าง → ฟิลเลอร์ช่วยได้ดี
➖ ถุงไขมันใต้ตา → ฟิลเลอร์ช่วยได้จำกัด
➖ คล้ำจากเม็ดสี (สีน้ำตาล) → ฟิลเลอร์แทบไม่ช่วย
⚠️ บวมน้ำใต้ตา → ฟิลเลอร์มักทำให้แย่ลง
หลายคนมีมากกว่าหนึ่งแบบในคนเดียวกัน แพทย์จึงต้องประเมินก่อนทุกครั้ง และบางเคสเริ่มจากรองรับที่แก้มส่วนบน ใต้ตาก็ดูตื้นลงโดยไม่ต้องเติมที่ใต้ตามาก

📷 เคสจริงที่ Vinfinity Clinic (PRE / POST) เผยแพร่โดยได้รับความยินยอมจากผู้รับบริการ
📖 วิธีสังเกตใต้ตาตัวเองเบื้องต้น: vinfinityclinic.com/articles/tear-trough-filler-candidates
💬 ทัก LINE @vinfinityclinic เพื่อนัดประเมินกับ นพ.เดโชวัต พรมดา (ว.48943)
📞 082-462-2963

ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Dark circles under the eyes? Not everyone is a candidate for filler.
Under-eye concerns that look alike can have different causes, and each is treated differently:
✔️ Hollow / shadow from structure → filler can help
➖ Fat bags → filler helps only a little
➖ Brown pigment → filler barely helps
⚠️ Fluid puffiness → filler often makes it worse
Many people have more than one type, so a doctor's assessment comes first. Sometimes support from the upper cheek is enough to soften the hollow.
📷 Real cases at Vinfinity Clinic (PRE / POST), shared with the patients' consent.
📖 vinfinityclinic.com/en/articles/tear-trough-filler-candidates
💬 LINE @vinfinityclinic — consultations available in English · Dr. Dechowat Promda (license ว.48943)
Results vary from person to person. All procedures carry possible side effects.

Hashtags: #VinfinityClinic #ฟิลเลอร์ใต้ตา #ใต้ตาคล้ำ #ใต้ตาโหล #คลินิกอุดร #อุดรธานี #TearTroughFiller #UnderEyeFiller #UdonThani
Alt text (per slide): 1) แผนภาพใต้ตา 5 แบบที่ดูคล้ายกัน / Diagram of five look-alike under-eye types. 2–3) ภาพเปรียบเทียบ PRE / POST เคส 01 ฟิลเลอร์ใต้ตา ร่องใต้ตาตื้นลง / PRE and POST photos, case 01 tear-trough filler. 4–5) ภาพเปรียบเทียบ PRE / POST เคส 09 / PRE and POST photos, case 09.
Graphic brief: 1080×1350, 5 slides. S1: article graphic tear-trough-types-filler-candidate.jpg on navy gradient (#0B142E → #1A326B), headline silver "ใต้ตาคล้ำ ไม่ใช่ทุกคนต้องเติมฟิลเลอร์". S2–S5: ba/case01-b.jpg (PRE) → case01-a.jpg (POST), case09-b.jpg (PRE) → case09-a.jpg (POST), photo uncropped as on site, small "PRE" / "POST" tag top-left in silver. Every slide footer: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band. ORGANIC ONLY — never boost or use in ads.

#### Draft 4 — Thu 6 Nov · TikTok / Reels (25 s) + FB · Sculptra vs HA filler
TH caption:
เติมปริมาตร vs กระตุ้นคอลลาเจน ต่างกันยังไง? 🤔
💧 ฟิลเลอร์ HA — เติมปริมาตรด้วยตัวเจล เหมาะกับปรับรูปทรงเฉพาะจุด (ใต้ตา ปาก คาง) และสลายได้ด้วยเอนไซม์ถ้าต้องแก้ไข
🌱 Sculptra (PLLA) — ไม่ได้เติมทันที แต่กระตุ้นให้ผิวสร้างคอลลาเจนเองทีละน้อย มักทำ 2–4 ครั้ง ห่างกัน 4–6 สัปดาห์ เหมาะกับหน้าตอบทั้งหน้าหรือผิวเริ่มขาดความแน่น สลายด้วยเอนไซม์ไม่ได้
เลือกแบบไหน ขึ้นกับโครงหน้า ตำแหน่ง และเป้าหมาย แพทย์จะประเมินก่อนเสมอ
📖 อ่านตารางเทียบเต็ม: vinfinityclinic.com/articles/sculptra-ellanse-vs-ha-filler
💬 LINE @vinfinityclinic
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Filler or collagen stimulator — what's the difference?
💧 HA filler adds volume with the gel itself; good for shaping specific areas (under-eyes, lips, chin) and can be dissolved with an enzyme if needed.
🌱 Sculptra (PLLA) works gradually by stimulating your own collagen; usually 2–4 sessions, 4–6 weeks apart; cannot be dissolved.
Which suits you depends on your face and goals — the doctor assesses first.
📖 vinfinityclinic.com/en/articles/sculptra-ellanse-vs-ha-filler · LINE @vinfinityclinic (English OK)
Results vary from person to person.

Hashtags: #Sculptra #ฟิลเลอร์ #กระตุ้นคอลลาเจน #VinfinityClinic #คลินิกอุดร #อุดรธานี #CollagenStimulator #DermalFiller #UdonThani
Alt text: แผนภาพเปรียบเทียบผลตามเวลาของฟิลเลอร์ HA และ Sculptra / Timeline diagram comparing HA filler and Sculptra results over time.
Video brief (25 s, 9:16): 0–3 s hook text on navy "เติมปริมาตร vs กระตุ้นคอลลาเจน"; 3–12 s HA side (gel icon, "ปรับรูปทรงเฉพาะจุด · สลายได้"); 12–21 s Sculptra side ("ค่อย ๆ สร้างคอลลาเจน · 2–4 ครั้ง · สลายไม่ได้"); 21–25 s timeline graphic sculptra-ellanse-ha-filler-timeline.jpg + "ปรึกษาแพทย์ก่อน · LINE @vinfinityclinic". Footer credit throughout: "Vinfinity Clinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No product box shots, no before/after.

### 2026-11-01
- Found: calendar weekday labels were one day off (1 Nov 2026 is a Sunday). Relabelled all slots, dates unchanged; LINE broadcast moved Tue 10 → Mon 9 Nov because the clinic is closed on Tuesdays.
- Found: the Sculptra promo (1–15 Nov, line-app/lib/promos.ts key sculptra-2611) started today but had no slot in the calendar. Added Sun 1 Nov launch slot with Draft 5 (below); Fri 6 Nov Sculptra vs HA reel now ends with the promo call to action.
- Found: /sculptra/ on the site shows only the regular 24,995 ฿ price (no promo mention); the LINE promo card links there. Not changed (prices = doctor's call) — flagged in report.
- Found: LINE campaign image (line-app/public/campaign/sculptra-2611/1-1x1.jpg) uses an illustrative model photo ("ภาพประกอบ") and its footer has no ว.48943; OK for the LINE card/Story, but the feed post brief uses the real clinic photo per house style.
- Live-site check (Sunday): production deployment dpl_H6GyG4zhc9CB7CvW2F6Pgw7yKeve READY on commit f5028e6; /sculptra/ and /robots.txt return 200 and render fully. vinfinityclinic.com itself could not be fetched from this run (network allowlist), checked via the Vercel deployment instead.

#### Draft 5 — Sun 1 Nov · FB + IG feed (+ Story) · Sculptra promo launch
TH caption:
✨ Sculptra โปรเดือนพฤศจิกายน · เพียง 10 สิทธิ์
Sculptra (PLLA) ไม่ได้เติมเต็มแบบฟิลเลอร์ แต่ช่วยกระตุ้นให้ผิวสร้างคอลลาเจนเองทีละน้อย ผิวค่อย ๆ แน่นและอิ่มขึ้นในช่วง 4–12 สัปดาห์ เหมาะกับผิวที่เริ่มหย่อน หน้าดูตอบหรือแบนทั้งหน้า

💙 15,990 บาท / ขวด (ปกติ 24,995 บาท)
• 1–15 พ.ย. 2569 หรือจนกว่าสิทธิ์จะหมด
• เพียง 10 สิทธิ์ · คนละไม่เกิน 2 ขวด
• รับสิทธิ์แล้วเลือกวันนัดภายใน 48 ชม.
• ใช้ร่วมกับโปรโมชั่นหรือแพ็กเกจอื่นไม่ได้

แพทย์ประเมินก่อนทุกครั้งว่าเหมาะกับ Sculptra หรือฟิลเลอร์ และควรใช้กี่ขวด โดย นพ.เดโชวัต พรมดา (ว.48943)
📖 รายละเอียด: vinfinityclinic.com/sculptra
📍 Vinfinity Clinic อุดรธานี · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

ทักไลน์ @vinfinityclinic พิมพ์ “โปรเดือนนี้” หรือกดเมนู 🎁 โปรเดือนนี้

EN caption:
✨ Sculptra November offer · only 10 places
Sculptra (PLLA) is not a filler: it gradually stimulates your own collagen, so skin looks firmer over 4–12 weeks. Suited to early laxity and a hollow or flat-looking face.
💙 15,990 THB per vial (regular 24,995 THB)
• 1–15 Nov 2026 or until places run out
• 10 places only · max 2 vials per person
• Book within 48 hours of claiming · not combined with other offers or packages
The doctor assesses first — Sculptra or filler, and how many vials. Dr. Dechowat Promda (license ว.48943). Consultations available in English.
📖 vinfinityclinic.com/en/sculptra · 📞 082-462-2963
Results vary from person to person. All procedures carry possible side effects.
Message LINE @vinfinityclinic and type "โปรเดือนนี้" (or tap the 🎁 menu).

Hashtags: #Sculptra #กระตุ้นคอลลาเจน #หน้าหย่อน #VinfinityClinic #คลินิกอุดร #อุดรธานี #CollagenStimulator #PLLA #UdonThani
Alt text: ห้องทรีตเมนต์ของ Vinfinity Clinic พร้อมข้อความโปร Sculptra 15,990 บาทต่อขวด เพียง 10 สิทธิ์ 1–15 พ.ย. / Vinfinity Clinic treatment room with Sculptra offer text: 15,990 THB per vial, 10 places, 1–15 Nov.
Graphic brief (feed): 1080×1350. Real photo assets/img/treatment.jpg, dark navy gradient (#0B142E → #1A326B) over bottom 55%. Silver headline "Sculptra 15,990.- / ขวด"; small strike "ปกติ 24,995.-"; chip "เพียง 10 สิทธิ์ · 1–15 พ.ย."; line "คนละไม่เกิน 2 ขวด · แพทย์ประเมินก่อนทุกครั้ง". Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no product-box shot, no before/after. Story (9:16): may reuse the LINE card image line-app/public/campaign/sculptra-2611/1-1x1.jpg centred on navy, add the ว.48943 footer line.

#### Draft 4 update — Fri 6 Nov reel
Replace the last line of the TH caption ("💬 LINE @vinfinityclinic") with: "Sculptra 15,990.- เพียง 10 สิทธิ์ ถึง 15 พ.ย." and end with "ทักไลน์ @vinfinityclinic พิมพ์ “โปรเดือนนี้” หรือกดเมนู 🎁 โปรเดือนนี้". If all 10 places are gone by 6 Nov, keep the original ending.

### 2026-11-02
- Run fired late (container clock Tue 3 Nov 00:35 Bangkok); treated as the Monday run (SEO + market watch).
- Next slot Wed 4 Nov (tear-trough carousel, Draft 3) is ready — full TH caption copied into today's report. Reminder for the doctor: Sculptra LINE round 2 is Wed 4 Nov ~12:30, only if places are left (8/10 taken on day 1).
- Done: Draft 6 for Sun 8 Nov (PN HMW vs LMW) below — facts only from /articles/pn-molecular-weight/ and Vitaran prices from /price/ (9,990 / 8,990 for 4+). No Sculptra CTA in this post (only 2 places may be left; keep Sculptra posts to the Fri 6 Nov reel ending).
- Found: Loy Krathong 2026 = Tue 24 Nov (https://www.pptvhd36.com/news/%E0%B9%84%E0%B8%A5%E0%B9%8C%E0%B8%AA%E0%B9%84%E0%B8%95%E0%B8%A5%E0%B9%8C/283924) — clinic closed that day, so pre-festival posts go Sun 15 and Sun 22 / Mon 23 Nov.
- Market watch: Bangkok Cosma V Clinic offers Sculptra first bottle 16,500 ฿ via Prudential privilege (https://www.prudential.co.th/en/privileges/prucustomers/privilege-details/cosma-v-clinic-sculptra-the-first-bottle-only-16500-baht/) — our 15,990 is in the same range; do not compare publicly. Udon Thani-local promos: none found by web search again (HDmall Bangkok listings only).

#### Draft 6 — Sun 8 Nov · FB + IG feed · PN HMW vs LMW (supports Vitaran)
TH caption:
PN ไม่ได้มีแบบเดียว 🧬
สกินบูสเตอร์ PN สกัดจาก DNA ของปลาแซลมอน แต่ความยาวของสาย DNA ทำให้ทำงานต่างกัน
🔵 สายยาว (HMW) — อุ้มน้ำได้มาก เนื้อเจลหนืด ค่อย ๆ สลาย ผิวจึงดูฉ่ำและแข็งแรงขึ้นแบบต่อเนื่อง
⚪ สายสั้น (LMW / PDRN) — เนื้อใส กระจายตัวง่าย เน้นช่วยซ่อมแซมผิวระยะสั้น เช่น หลังเลเซอร์
ข้อควรรู้: ยังไม่มีงานวิจัยในคนที่เทียบสองแบบนี้ตัวต่อตัว แพทย์จึงเลือกตามสภาพผิวและตำแหน่ง ไม่ใช่ “ยิ่งเล็กยิ่งดี” หรือ “ยิ่งใหญ่ยิ่งดี”
ผิวหย่อนหรือขาดโครงสร้าง PN อย่างเดียวไม่พอ PN ดูแลคุณภาพผิว ไม่ได้ยกหรือเติมโครงหน้า

💙 Vitaran (PN) ที่คลินิก
• 1 กล่อง (2 cc) 9,990 บาท
• 4 กล่องขึ้นไป กล่องละ 8,990 บาท
ผู้ที่แพ้ปลาหรือผลิตภัณฑ์จากปลา โปรดแจ้งแพทย์ก่อน

📖 อ่านเต็ม: vinfinityclinic.com/articles/pn-molecular-weight
💬 ทัก LINE @vinfinityclinic เพื่อประเมินผิวกับ นพ.เดโชวัต พรมดา (ว.48943)
📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Not all PN is the same 🧬
PN skin boosters come from salmon DNA (polynucleotides), but strand length changes how they work.
🔵 Long strands (HMW): hold more water, thicker gel, break down slowly — skin looks more hydrated and resilient over time.
⚪ Short strands (LMW / PDRN): clear and spread easily — mainly short-term repair, e.g. after laser.
Good to know: no human study has compared the two head-to-head yet, so the doctor chooses by skin condition and area — smaller is not automatically better, nor is bigger.
PN improves skin quality; it does not lift or add structure.
Vitaran (PN) at the clinic: 1 box (2 cc) 9,990 THB · 4+ boxes 8,990 THB/box. Tell the doctor first if you are allergic to fish.
📖 vinfinityclinic.com/en/articles/pn-molecular-weight · LINE @vinfinityclinic (consultations in English) · Dr. Dechowat Promda (license ว.48943)
Results vary from person to person. All procedures carry possible side effects.

Hashtags: #VinfinityClinic #สกินบูสเตอร์ #PN #Vitaran #Polynucleotide #SalmonDNA #PDRN #คลินิกอุดร #อุดรธานี #SkinBooster #UdonThani
Alt text: แผนภาพเปรียบเทียบ PN สายยาว (HMW) ที่อุ้มน้ำและสลายช้า กับสายสั้น (LMW) ที่กระจายตัวง่าย / Diagram comparing long-strand (HMW) PN that holds water and breaks down slowly with short-strand (LMW) PN that spreads easily.
Graphic brief: 1080×1350. Article graphic assets/img/articles/pn-hmw-lmw-polynucleotide.jpg as the main visual (real clinic photo assets/img/treatment.jpg as slide 2 if carousel). Dark navy gradient (#0B142E → #1A326B); silver headline "PN ไม่ได้มีแบบเดียว"; two chips "HMW · อุ้มน้ำ สลายช้า" / "LMW · กระจายเร็ว ซ่อมแซม"; price line "Vitaran 2 cc 9,990.- · 4 กล่องขึ้นไป 8,990.-/กล่อง". Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no product-box claims, no before/after.
### 2026-11-03 00:35 (catch-up run requested by the doctor)
- Mon 2 Nov's scheduled run did not happen (usage limit). This one run covered Monday (Marketing + SEO, see 2026-11-02 entries) and Tuesday's live-site check, with one combined report, subject "[Vinfinity Agent] Growth · 2–3 พ.ย. 2569 (รวม 2 วัน)".
- Live-site check (Tue): production dpl_5srCqKRrU4x2QiBSHBx7xj7Qweie (commit 493780a) READY; /, /sculptra/, /en/filler/tear-trough/ return 200 and render fully (html closed, schema present).
- Found: /sculptra/ still shows only the regular 24,995 ฿ (no 15,990 promo), same as 1 Nov. Not changed, because prices are the doctor's decision.
- NOTE FOR THE 07:30 RUN ON TUE 3 NOV 2026: do no work. Reply and report only "รวมไว้ในรายงานรอบ 00:35 แล้ว". Resume the normal plan on Wed 4 Nov (AEO).
### 2026-11-04
- Today's slot Wed 4 Nov = tear-trough carousel (Draft 3, ready; full TH caption in today's report). Foreign-patient plan: first EN post (Wed 4 Nov) due today — drafts are in the doctor's doc, not re-drafted here.
- Reminder in report: Sculptra LINE round 2 today ~12:30, only if places are left after Monday's 48 h holds expire (8/10 taken on day 1). Next drafted slots: Fri 6 Nov reel (Draft 4 + promo ending), Sun 8 Nov PN (Draft 6).
- Done: Draft 7 for Wed 11 Nov (11.11 Story) below, two versions — A if Sculptra places remain (team checks the LINE seat counter that morning), B if all 10 are gone (referral-event CTA instead; no 15,990 price). No extra 11.11 discount invented. Prices from line-app/lib/promos.ts and line-app/lib/referral.ts terms in this file's header.
- No market watch (Mondays only). No LINE broadcast proposed this week beyond the doctor's plan.

#### Draft 7 — Wed 11 Nov · FB + IG Story (9:16, 2 frames) · 11.11
Version A (Sculptra places still open — check the LINE counter first; never say "almost gone" unless the counter shows it):
TH (frame 1): 11.11 นี้ ไม่ต้องรีบกดตามกระแส ✨ ดูแลผิวแบบวางแผนกับแพทย์
TH (frame 2): Sculptra กระตุ้นคอลลาเจน 15,990 บาท/ขวด (ปกติ 24,995) · ถึง 15 พ.ย. หรือจนกว่าสิทธิ์จะหมด · คนละไม่เกิน 2 ขวด · ใช้ร่วมกับโปรอื่นไม่ได้ · แพทย์ประเมินก่อนทุกครั้ง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
ทักไลน์ @vinfinityclinic พิมพ์ “โปรเดือนนี้” หรือกดเมนู 🎁 โปรเดือนนี้
EN (frame 2 sub-line): 11.11 — plan your skin with a doctor, not a flash sale. Sculptra 15,990 THB/vial until 15 Nov or until places run out. LINE @vinfinityclinic (English OK) · Messenger m.me/Vinfinity.Clinic. Results vary.
Version B (all 10 Sculptra places taken — no 15,990 price anywhere):
TH (frame 2): ชวนเพื่อนมาสวยด้วยกัน 💙 เพื่อนใหม่ปรึกษาแพทย์ฟรี + เครดิต 1,000 บาท เมื่อทำหัตถการครั้งแรก 5,000 บาทขึ้นไป · คนชวนรับเครดิต 1,500 บาทต่อเพื่อน 1 คน · ถึง 15 ธ.ค. · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
ทักไลน์ @vinfinityclinic พิมพ์ “ชวนเพื่อน” รับลิงก์ของคุณ
EN (frame 2 sub-line): Bring a friend: your friend gets a free consultation + 1,000 THB credit on a first treatment of 5,000 THB+; you get 1,500 THB credit per friend. Until 15 Dec. LINE @vinfinityclinic.
Hashtags (if reposted to feed): #VinfinityClinic #1111 #คลินิกอุดร #อุดรธานี #Sculptra #กระตุ้นคอลลาเจน #UdonThani
Alt text: ห้องรับรองของ Vinfinity Clinic โทนสีกรมท่า พร้อมข้อความ 11.11 ดูแลผิวแบบวางแผนกับแพทย์ / Vinfinity Clinic lounge in navy tones with the text "11.11 — plan your skin with a doctor".
Graphic brief: 1080×1920, 2 frames. Real photo assets/img/clinic-lounge.jpg, dark navy gradient (#0B142E → #1A326B) over the lower 60%. Frame 1: large silver "11.11" + headline line. Frame 2: offer lines (A or B) in silver #EEF2F8, LINE keyword in a silver chip, link sticker to LINE. Small text footer credit on both frames: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no product-box shot, no before/after, no countdown or "last chance" wording.
### 2026-11-05
- Thursday: Marketing light + live-site check only. Live check via Vercel production deployment dpl_AJMJVkw85dffvVkxXGZuR4CpkhJL (commit 8a46210, READY): /, /en/doctor/, /price/ return 200 and render fully. vinfinityclinic.com itself not reachable from this run (network allowlist).
- Next slot Fri 6 Nov reel (Draft 4 + promo ending from "Draft 4 update"); full TH caption copied into today's report. Foreign plan: Lao post #1 due today (Thu 5 Nov), EN post #2 Sat 7 Nov — both in the doctor's doc.
- Done: Draft 8 for Fri 13 Nov (Meet the doctor, EN-first + TH) below — facts only from /en/doctor/ (KKU M.D., license 48943, KOL Vivacy · MNB · IMCAS, IMCAS Asia 2023 faculty + live demo, Vivacy Paris 2025, 3D facial scan, doctor injects every patient). No Galderma mention or photo.
- Done: calendar rolled to 29 Nov (7 new slots, all "TO DRAFT"); Sculptra promo ends 15 Nov so no 15,990 slots after that.
- Prices checked on live /price/ today: Vitaran 9,990 / 4+ boxes 8,990 per box; Sculptra regular 24,995 (no promo shown on site, same as before).

#### Draft 8 — Fri 13 Nov · IG + FB feed (EN-first) · Meet the doctor
EN caption:
Who is The Filler Architect? 🏛️
Dr. Dechowat Promda (Dr. Bas) is the founding physician of Vinfinity Clinic in Udon Thani — and he assesses and injects every patient himself.
• Doctor of Medicine, Khon Kaen University · Thai medical license no. 48943 (you can check it on the Medical Council of Thailand website)
• Faculty and Live Demonstration at IMCAS Asia 2023
• KOL for Vivacy · MNB · IMCAS; trained with the manufacturer in France in 2025
His approach: read the face layer by layer (with a 3D facial scan), use only what is needed, and record product, amount and placement every visit.
"Data tells you where to treat. Art tells you where to stop."
Consultations in English. Visiting Udon Thani for the Horticultural Expo? Message us first with a front and side photo.
📖 vinfinityclinic.com/en/doctor · 💬 Messenger m.me/Vinfinity.Clinic · LINE @vinfinityclinic · 📞 +66 82-462-2963
Results vary from person to person. All procedures carry possible side effects.

TH caption:
รู้จัก The Filler Architect 🏛️
นพ.เดโชวัต พรมดา (หมอบาส) แพทย์ผู้ก่อตั้ง Vinfinity Clinic อุดรธานี ประเมินและฉีดเองทุกเคส
• แพทยศาสตรบัณฑิต มหาวิทยาลัยขอนแก่น · ใบอนุญาตประกอบวิชาชีพเวชกรรม ว.48943 (ตรวจสอบได้ที่เว็บไซต์แพทยสภา)
• วิทยากรและ Live Demonstration ในงาน IMCAS Asia 2023
• KOL ของ Vivacy · MNB · IMCAS และอบรมกับผู้ผลิตที่ฝรั่งเศสปี 2025
แนวทางของหมอ: อ่านโครงหน้าทีละชั้นด้วย 3D facial scan ใช้เท่าที่จำเป็น และบันทึกผลิตภัณฑ์ ปริมาณ ตำแหน่งทุกครั้ง
“ข้อมูลบอกว่าควรรักษาตรงไหน ศิลปะบอกว่าควรหยุดตรงไหน”
📖 vinfinityclinic.com/doctor
ทักไลน์ @vinfinityclinic ส่งรูปหน้าตรงและด้านข้างให้แพทย์ประเมินเบื้องต้น · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

Hashtags: #TheFillerArchitect #VinfinityClinic #UdonThani #อุดรธานี #คลินิกอุดร #IMCAS #AestheticMedicine #EnglishSpeakingDoctor #UdonThaniExpo
Alt text: นพ.เดโชวัต พรมดา สาธิตการฉีดบนเวที IMCAS Asia 2023 (เบลอใบหน้าผู้เข้าร่วม) / Dr. Dechowat Promda giving a live demonstration on stage at IMCAS Asia 2023 (participant's face blurred).
Graphic brief: 1080×1350. Real photo assets/img/doctor/imcas-asia-2023-live-demo.jpg (participant face already blurred — keep it blurred), slide 2 optional: assets/img/dr-bas.jpg portrait. Dark navy gradient (#0B142E → #1A326B) over the lower 50%. Silver headline "The Filler Architect"; sub "Dr. Dechowat Promda · License 48943"; chips "IMCAS Asia 2023 Faculty" · "KOL Vivacy · MNB · IMCAS" · "English consultations". Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no Galderma photos or logos, no product boxes, no before/after.
### 2026-11-06
- Friday: Marketing light + Branding deep. Today's slot Fri 6 Nov = Sculptra vs HA reel (Draft 4 + promo ending, caption was in yesterday's report). Next slot Sun 8 Nov = PN HMW vs LMW (Draft 6) — full TH caption copied into today's report.
- Reminder in report: Mon 9 Nov LINE broadcast slot (Vitaran 4-box to past skin-booster patients) is "if approved" — segment size still not verified.
- Done: Draft 9 for Sun 15 Nov (pre-Loy Krathong skin plan) below. Facts only from /skin-booster/ and /articles/pn-molecular-weight/ (course of several sessions, interval set by the doctor; small bumps/redness 1–3 days). No discount invented; Sculptra promo not mentioned (ends 15 Nov). Clinic closed Tue 24 Nov (Tuesday).
- No market watch (Mondays only).

#### Draft 9 — Sun 15 Nov · FB + IG feed · Pre-Loy Krathong skin plan
TH caption:
อีกไม่กี่วันลอยกระทง (อังคาร 24 พ.ย.) ผิวพร้อมถ่ายรูปหรือยัง? 🏮
ถ้าอยากให้ผิวดูฉ่ำในรูป ควรวางแผนล่วงหน้า ไม่ใช่ฉีดวันก่อนงาน
• หลังฉีดสกินบูสเตอร์ อาจมีตุ่มนูนเล็ก ๆ หรือรอยแดงตามจุดฉีดได้ 1–3 วัน จึงควรเว้นระยะก่อนวันถ่ายรูป
• สกินบูสเตอร์มักทำเป็นคอร์สหลายครั้ง แพทย์จะกำหนดจำนวนครั้งและระยะห่างหลังประเมินผิว
• ผิวแห้งช่วงลมหนาว ดูแลด้วยมอยส์เจอไรเซอร์และกันแดดทุกวันควบคู่กัน

💙 Vitaran (PN Skin Booster)
• 1 กล่อง (2 cc) 9,990 บาท
• 4 กล่องขึ้นไป กล่องละ 8,990 บาท
ผู้ที่แพ้ปลาหรือผลิตภัณฑ์จากปลา โปรดแจ้งแพทย์ก่อน

📌 วันลอยกระทง (อังคาร 24 พ.ย.) คลินิกปิดทำการ นัดก่อนงานได้ถึงจันทร์ 23 พ.ย.
💬 ทัก LINE @vinfinityclinic ส่งรูปผิวให้ นพ.เดโชวัต พรมดา (ว.48943) ประเมินก่อนนัดคิว
📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Loy Krathong is on Tuesday 24 Nov — planning photos? 🏮
Skin boosters work best when planned ahead, not the day before.
• Small bumps or redness at injection points can last 1–3 days, so leave a gap before your photo day.
• Skin boosters are usually a course of several sessions; the doctor sets the number and spacing after assessing your skin.
Vitaran (PN, polynucleotide): 1 box (2 cc) 9,990 THB · 4+ boxes 8,990 THB/box. Tell the doctor if you are allergic to fish.
The clinic is closed on Tue 24 Nov; book up to Mon 23 Nov. LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic (consultations in English) · Dr. Dechowat Promda (license ว.48943)
Results vary from person to person. All procedures carry possible side effects.

Hashtags: #VinfinityClinic #ลอยกระทง2569 #สกินบูสเตอร์ #PN #Vitaran #ผิวหน้าหนาว #คลินิกอุดร #อุดรธานี #Polynucleotide #UdonThani
Alt text: ห้องทรีตเมนต์ของ Vinfinity Clinic โทนสีกรมท่า พร้อมข้อความ "ลอยกระทงนี้ ผิวพร้อมถ่ายรูป" / Vinfinity Clinic treatment room in navy tones with the text "Skin ready for Loy Krathong photos".
Graphic brief: 1080×1350. Real photo assets/img/treatment.jpg (alt: clinic-lounge.jpg). Dark navy gradient (#0B142E → #1A326B) over the lower 55%. Silver headline "ลอยกระทงนี้ ผิวพร้อมถ่ายรูป"; sub "วางแผนสกินบูสเตอร์ล่วงหน้า · คลินิกปิด อ. 24 พ.ย."; price line "Vitaran 2 cc 9,990.- · 4 กล่องขึ้นไป 8,990.-/กล่อง". Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no krathong stock image unless labelled "ภาพประกอบ", no before/after, no countdown wording.
### 2026-11-07
- Saturday: Marketing light + live-site check only. Live check via Vercel production dpl_sXvSH5c44PuxmrXwEVRekgtY4P4s (commit 9674417, READY): / (TH) and /en/skin-booster/ return 200, render fully (closing html, title, canonical/hreflang, 4 JSON-LD blocks on EN page). vinfinityclinic.com itself not reachable from this run (network allowlist).
- Next slot Sun 8 Nov = PN HMW vs LMW (Draft 6, ready) — full TH caption copied into today's report. Foreign plan: EN post #2 due today (Sat 7 Nov), Lao #2 Sun 8 Nov — both in the doctor's doc.
- Reminder in report: Mon 9 Nov LINE broadcast slot (Vitaran 4-box to past skin-booster patients) is "if approved"; segment size still not verified.
- Done: Draft 10 for Wed 18 Nov (referral mid-campaign reminder) below. Terms only from line-app/lib/referral.ts (friend: free consultation + 1,000 THB credit on a first treatment of 5,000+, usable on any service; inviter: 1,500 THB per such friend; 3 friends → Vitaran 1 cc, staff hand it out; until 15 Dec). No Sculptra price (promo ends 15 Nov). Version B leaves out the free-reward line in case the advertising approval does not cover it (backlog 2b).
- No market watch (Mondays only).

#### Draft 10 — Wed 18 Nov · FB + IG feed · Referral reminder "ชวนเพื่อนมาสวยด้วยกัน"
TH caption (Version A — full terms):
มาด้วยกัน ได้ทั้งคู่ 💙
มีเพื่อนที่อยากปรึกษาเรื่องผิวหรือโครงหน้าแต่ยังไม่กล้ามาคนเดียวไหม? ชวนมาพบคุณหมอด้วยกันได้ถึง 15 ธ.ค. นี้

👭 เพื่อนใหม่
• ปรึกษาและวิเคราะห์ผิวกับคุณหมอฟรี
• รับเครดิต 1,000 บาท เมื่อทำหัตถการครั้งแรก 5,000 บาทขึ้นไป ใช้ได้ทุกบริการ

🙋 คนชวน
• รับเครดิต 1,500 บาท ต่อเพื่อน 1 คนที่มาทำครั้งแรกตามเงื่อนไข
• ชวนสำเร็จครบ 3 คน รับ Vitaran 1 cc

แพทย์ประเมินก่อนทุกครั้งว่าเหมาะกับหัตถการไหน ไม่จำเป็นต้องทำในวันที่มาปรึกษา
โดย นพ.เดโชวัต พรมดา (ว.48943) · 📍 Vinfinity Clinic อุดรธานี · 📞 082-462-2963
คลินิกปิดทุกวันอังคาร
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

ทักไลน์ @vinfinityclinic พิมพ์ “ชวนเพื่อน” รับลิงก์ของคุณ

TH caption (Version B — if the doctor prefers no free-reward line in public posts): same as A, delete the line "• ชวนสำเร็จครบ 3 คน รับ Vitaran 1 cc" (the LINE bot still shows it to people who ask).

EN caption:
Come together, both of you benefit 💙
Know a friend who'd like a skin or facial consultation but doesn't want to come alone? Bring them along until 15 Dec.
👭 Your friend: free consultation and skin analysis with the doctor, plus a 1,000 THB credit on a first treatment of 5,000 THB or more (any service).
🙋 You: 1,500 THB credit for each friend who has a first treatment on these terms. (Version A only: 3 friends → Vitaran 1 cc.)
The doctor assesses first; no treatment is needed on the consultation day. Dr. Dechowat Promda (license ว.48943) · consultations in English · closed Tuesdays.
Results vary from person to person. All procedures carry possible side effects.
Message LINE @vinfinityclinic and type "ชวนเพื่อน" to get your personal link · Messenger m.me/Vinfinity.Clinic

Hashtags: #VinfinityClinic #ชวนเพื่อนมาสวยด้วยกัน #คลินิกอุดร #อุดรธานี #ปรึกษาแพทย์ #สกินบูสเตอร์ #ฟิลเลอร์ #UdonThani
Alt text: ห้องรับรองโทนสีกรมท่าของ Vinfinity Clinic พร้อมข้อความ "มาด้วยกัน ได้ทั้งคู่" / Vinfinity Clinic lounge in navy tones with the text "Come together, both of you benefit".
Graphic brief: 1080×1350. Real photo assets/img/clinic-lounge.jpg (alt: reception.jpg). Dark navy gradient (#0B142E → #1A326B) over the lower 55%. Silver headline "มาด้วยกัน ได้ทั้งคู่"; two silver chips "เพื่อนใหม่ · ปรึกษาฟรี + เครดิต 1,000.-" / "คนชวน · เครดิต 1,500.- ต่อเพื่อน"; small line "เงื่อนไข: ทำครั้งแรก 5,000.- ขึ้นไป · ถึง 15 ธ.ค. 69"; LINE keyword chip "พิมพ์ “ชวนเพื่อน”". Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no stock models (the LINE card image line-app/public/campaign/friends-2611/1-1x1.jpg may be used for Story only), no before/after, no lucky-draw or "last chance" wording.
### 2026-11-08
- Sunday: Marketing light + live-site check only. Live check via Vercel production dpl_A1SjqS7s9yypNyPs9DupdP1X2C83 (commit 14290cf, READY): /price/ and /articles/facial-ligaments-aging/ return 200 and render fully (closing html, title, canonical/hreflang TH-EN-x-default, 3–4 JSON-LD blocks; Vitaran 9,990 / 4+ boxes 8,990 still on /price/). vinfinityclinic.com itself not reachable from this run (network allowlist).
- Today's slot Sun 8 Nov = PN HMW vs LMW (Draft 6). Next slot Mon 9 Nov = LINE broadcast Vitaran 4-box (if approved; segment size not verified) — reminder in report. Next ready feed post Wed 11 Nov (Draft 7, A/B by Sculptra seats) — full TH caption (version per seats) in report.
- promos.ts unchanged: only sculptra-2611 (until 15 Nov) runs; no promo defined after 15 Nov — calendar after that uses /price/ prices + referral only.
- Done: Draft 11 for Fri 20 Nov (ligaments & aging reel, 25 s) below. Facts only from /articles/facial-ligaments-aging/ (2023 rat study, Aesthetic Surgery Journal; ligament stiffer not looser; animal study, not yet confirmed in humans). No promo, no before/after.
- Done: Draft 12 = text for the Mon 9 Nov LINE broadcast (Vitaran 4-box, past skin-booster patients only, if the doctor approves); it had no ready text. Prices from /price/ (checked live today).
- No market watch (Mondays only).

#### Draft 11 — Fri 20 Nov · TikTok / Reels + FB · Ligaments & aging (25 s)
Script (9:16, doctor to camera in clinic, silver subtitles on navy lower third):
0–3 s HOOK — text "หน้าย้อย เพราะเอ็นหลวมจริงไหม?" · หมอ: "หลายคนคิดว่าหน้าย้อยเพราะเอ็นยึดใบหน้ายืด"
3–9 s — B-roll article graphic facial-ligaments-aging-anchor.jpg · "เอ็นยึดใบหน้าเหมือนหมุดที่ตรึงผิวไว้กับกระดูก"
9–16 s — graphic facial-ligaments-aging-findings.jpg · "งานวิจัยในหนูปี 2023 พบว่าเมื่ออายุมากขึ้น เอ็นไม่ได้หลวม แต่กลับแข็งขึ้น" · small text "งานในสัตว์ทดลอง ยังต้องยืนยันในคน"
16–22 s — หมอชี้บนใบหน้าตัวเอง/โมเดลกายวิภาค · "สิ่งที่หย่อนคือไขมัน ผิว และกระดูกที่ยุบรอบ ๆ หมุด จึงเห็นเป็นร่องและเหนียง"
22–25 s — "หมอจึงอ่านหน้าทีละชั้นก่อนเลือกวิธี · อ่านต่อในบทความ" + end card LINE @vinfinityclinic · ว.48943
TH caption:
หน้าย้อย เพราะเอ็นหลวมจริงไหม? 🤔
เดิมเชื่อกันว่าเอ็นยึดใบหน้ายืดตามอายุ หน้าจึงตก แต่งานวิจัยในหนูปี 2023 (Aesthetic Surgery Journal) พบว่าเอ็นไม่ได้หลวมขึ้น กลับแข็งขึ้น
สิ่งที่เปลี่ยนคือเนื้อเยื่อรอบเอ็น: ไขมันเคลื่อนลง ผิวบางลง กระดูกค่อย ๆ ยุบ จึงเกิดร่องและเหนียงตามแนวเอ็น
ข้อควรรู้: เป็นงานในสัตว์ทดลอง ยังต้องรอการยืนยันในคน
หมอจึงประเมินใบหน้าทีละชั้นก่อน แล้วค่อยเลือกว่าควรดูแลชั้นไหน
📖 อ่านต่อ: vinfinityclinic.com/articles/facial-ligaments-aging
💬 ทัก LINE @vinfinityclinic ส่งรูปหน้าตรงและด้านข้างให้ นพ.เดโชวัต พรมดา (ว.48943) ประเมินเบื้องต้น · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง
EN caption:
Does your face sag because ligaments get loose? 🤔
A 2023 animal study (Aesthetic Surgery Journal) found facial ligaments don't loosen with age — they get stiffer. What moves is the tissue around them: fat descends, skin thins, bone slowly recedes, so folds form along the ligament lines.
Note: this was a study in rats and still needs confirmation in humans.
That's why the doctor reads the face layer by layer before choosing a treatment.
📖 vinfinityclinic.com/en/articles/facial-ligaments-aging · LINE @vinfinityclinic · Messenger m.me/Vinfinity.Clinic (consultations in English) · Dr. Dechowat Promda (license ว.48943)
Results vary from person to person. All procedures carry possible side effects.
Hashtags: #VinfinityClinic #TheFillerArchitect #เอ็นยึดใบหน้า #หน้าย้อย #กายวิภาคใบหน้า #คลินิกอุดร #อุดรธานี #FacialAnatomy #UdonThani
Alt text (cover): ภาพกราฟิกเปรียบเทียบเอ็นยึดใบหน้าเหมือนหมุดที่ยังยึดแน่น ขณะที่เนื้อเยื่อรอบ ๆ หย่อนลง / Graphic comparing facial ligaments to pins that stay anchored while the surrounding tissue descends.
Graphic brief (cover 1080×1920): real photo of the doctor (assets/img/dr-bas.jpg or a fresh clinic clip), dark navy gradient (#0B142E → #1A326B) over the lower 50%; silver headline "หน้าย้อย เพราะเอ็นหลวม?"; sub "งานวิจัย 2023 บอกว่าไม่ใช่"; small text footer credit "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no before/after, no Galderma photos, no product names.

#### Draft 12 — Mon 9 Nov ~12:00 · LINE broadcast (only if the doctor approves; segment = past skin-booster patients, size not verified)
TH text:
สวัสดีค่ะ จาก Vinfinity Clinic 💙
ช่วงลมหนาว ผิวแห้งและหมองง่าย ใครที่เคยทำสกินบูสเตอร์กับเรา ถึงรอบดูแลต่อหรือยังคะ
Vitaran (PN Skin Booster) 2 cc
• 1 กล่อง 9,990 บาท
• 4 กล่องขึ้นไป กล่องละ 8,990 บาท (แบ่งใช้เป็นคอร์สได้ตามที่แพทย์วางแผน)
แพทย์ประเมินผิวก่อนทุกครั้ง ผู้ที่แพ้ปลาโปรดแจ้งแพทย์
ตอบกลับข้อความนี้พร้อมวัน-เวลาที่สะดวก ทีมงานจะจองคิวให้ค่ะ (ปิดทุกวันอังคาร)
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง
Image: assets/img/treatment.jpg with navy gradient + silver price line, footer credit as usual. Not to all friends; not on Tuesday.

## Win-back "คิดถึงนะ กลับมาสวยต่อ" (ส่ง จ. 9 พ.ย. 69 12:00)
- 3 segment campaigns (personal push, uses quota): A ถึงรอบโบทูลินัม (TOX, lapsed 120d) → B ฟิลเลอร์/ยกกระชับ (FIL-HA, FIL-TT, DOUBLO, HIFU, SCULPTRA, lapsed 270d) → C สกินบูสเตอร์ (skin, lapsed 60d). All: no upcoming appt, reachable (marketing consent), quiet 14d (dedups A/B/C and anyone in recent broadcasts).
- Gift: โบทูลินัม Standard 1 จุด (ระหว่างคิ้วหรือหางตา มูลค่า 1,900 บาท) when paying 5,000+ within 30 days of the message. Auto-flagged at receipt → /staff/leads#comeback → staff press "ให้แล้ว".
- Copy says "โบทูลินัม", never brand names. Track: segments page campaign results (booked/paid), leads #comeback board.

### 2026-11-09
- Monday: Marketing light + SEO. Next ready feed post Wed 11 Nov (Draft 7, A/B by Sculptra seats; full TH in report). Foreign plan: EN #3 due today, Lao #3 Wed 11 Nov (doctor's doc, not re-drafted).
- Flagged: Draft 12 (Vitaran broadcast, today, if approved) and the win-back C skin-booster campaign (today 12:00) target the same group — recommend sending only one today.
- promos.ts unchanged: only sculptra-2611 until 15 Nov. No promo defined after 15 Nov.
- Done: Draft 13 for Sun 22 Nov below (Loy Krathong closed day; no offer invented).
- Market watch (web search): no Udon Thani clinic promos surfaced again (only HDmall/WhatClinic listings); needs a human on FB pages (backlog 8). PN/"salmon DNA" remains the visible regenerative theme in EN results; no new price point verified.

#### Draft 13 — Sun 22 Nov · FB + IG Story · Loy Krathong closed day
TH caption:
ลอยกระทงปีนี้ตรงกับวันอังคารที่ 24 พ.ย. 🏮
Vinfinity Clinic ปิดทำการวันอังคารตามปกติ เปิดให้บริการวันจันทร์ที่ 23 และวันพุธที่ 25 พ.ย. เวลา 10:00–19:00 น.
ใครอยากปรึกษาคุณหมอช่วงนี้ ทักมาจองคิวล่วงหน้าได้เลยค่ะ
💬 LINE @vinfinityclinic · 📞 082-462-2963
EN caption:
Loy Krathong falls on Tuesday 24 Nov this year 🏮 We're closed as usual on Tuesdays and open Mon 23 and Wed 25 Nov, 10:00–19:00. To book a consultation, message LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic (English OK).
Hashtags: #VinfinityClinic #ลอยกระทง #คลินิกอุดร #อุดรธานี #UdonThani
Alt text: ด้านหน้าอาคาร Vinfinity Clinic พร้อมข้อความแจ้งวันปิดทำการวันอังคารที่ 24 พฤศจิกายน / Vinfinity Clinic exterior with a notice that the clinic is closed on Tuesday 24 November.
Graphic brief: 1080×1920. Real photo assets/img/facade.jpg, dark navy gradient (#0B142E → #1A326B) over the lower 55%. Silver headline "ลอยกระทงอังคารนี้ คลินิกปิด 1 วัน"; sub "เปิด จ. 23 · พ. 25 พ.ย. 10:00–19:00". Small text footer credit "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band, no offer, no before/after.

### 2026-11-10
- Tuesday (clinic closed): Marketing light + live-site check. Production deployment READY on 2acda1a; /, /en/, /price/ return 200 with correct titles, LINE and phone (fetched via Vercel; direct curl to vinfinityclinic.com is blocked by this sandbox's proxy, not a site fault).
- Next ready feed post: Wed 11 Nov 11.11 Story (Draft 7) — team checks the LINE Sculptra seat counter in the morning and picks version A (places left) or B (full). Full TH in today's report. Foreign plan: Lao #3 due Wed 11 Nov, EN #4 Thu 12 Nov (doctor's doc, not re-drafted).
- promos.ts unchanged (only sculptra-2611, until 15 Nov 23:59). /price/ still shows Vitaran 9,990 · 4+ boxes 8,990 (matches header).
- Done: Draft 14 for Wed 25 Nov skincare carousel below, content taken only from /articles/skincare-routine-filler-botox/ (no new claims). Calendar row updated to DRAFT READY.
- No LINE broadcast planned for tomorrow; no market watch (Mondays only).

#### Draft 14 — Wed 25 Nov · FB + IG carousel (5 slides, 1080×1350) · Skincare before/after injections
TH caption:
ฉีดฟิลเลอร์ โบท็อก หรือสกินบูสเตอร์แล้ว ทาเรตินอลได้เมื่อไหร่? 🧴
การฉีดไม่ได้ลอกผิวทั้งหน้าเหมือนการลอกผิวด้วยกรดหรือเลเซอร์ สกินแคร์ส่วนใหญ่จึงกลับมาใช้ได้เร็ว แต่มีบางตัวที่ควรพักไว้ก่อน

✅ ใช้ต่อได้: คลีนเซอร์อ่อนโยน มอยส์เจอไรเซอร์ กันแดด เซราไมด์ ไฮยาลูรอนิก
⏸️ พักในวันฉีด: เรตินอยด์/เรตินอล AHA BHA เบนโซอิลเปอร์ออกไซด์ — กลับมาใช้เมื่อผิวไม่แดง ไม่แสบ
💄 หลังฉีด งดแต่งหน้าอย่างน้อยหลายชั่วโมง เพื่อลดการปนเปื้อนที่รอยเข็ม
💊 ยาที่แพทย์สั่ง โดยเฉพาะยาละลายลิ่มเลือด ห้ามหยุดเอง — แจ้งแพทย์ผู้ฉีดก่อนทุกครั้ง

ถ้ายังมีรอยช้ำ แดง หรือแสบ ให้รอจนหายก่อนกลับไปใช้ตัวแรง ปวดมากขึ้นเรื่อย ๆ หรือผิวซีด/ม่วงคล้ำ ให้ติดต่อคลินิกทันที
อ่านตารางงด–ใช้ต่อฉบับเต็ม: vinfinityclinic.com/articles/skincare-routine-filler-botox/
เรียบเรียงโดย นพ.เดโชวัต พรมดา (ว.48943) · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล
💬 สงสัยว่าสกินแคร์ที่ใช้อยู่ต้องพักไหม ทัก LINE @vinfinityclinic ส่งรูปฉลากให้ทีมดูก่อนนัดได้ค่ะ

EN caption:
Had filler, toxin or a skin booster — when can you go back to retinol? Most skincare comes back quickly: cleanser, moisturiser and sunscreen carry on as usual. Pause retinoids, AHA/BHA and benzoyl peroxide on treatment day and restart once the skin isn't red or stinging. Skip makeup for at least several hours. Never stop a prescribed medicine (especially blood thinners) on your own — tell your doctor. Full guide (Thai): vinfinityclinic.com/articles/skincare-routine-filler-botox/ · Questions in English: LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic. Results vary.

Hashtags: #VinfinityClinic #สกินแคร์หลังฉีดฟิลเลอร์ #เรตินอล #ฟิลเลอร์อุดร #คลินิกอุดร #อุดรธานี #skincareafterfiller #UdonThani

Slides (silver text on navy, one idea each):
1. "ฉีดฟิลเลอร์แล้ว ทาเรตินอลได้เมื่อไหร่" (cover, photo assets/img/articles/skincare-before-after-injection.jpg)
2. "ใช้ต่อได้" — คลีนเซอร์ · มอยส์เจอไรเซอร์ · กันแดด · เซราไมด์ · ไฮยาลูรอนิก
3. "พักในวันฉีด" — เรตินอยด์ · AHA/BHA · เบนโซอิลเปอร์ออกไซด์ → กลับมาใช้เมื่อผิวไม่แดง ไม่แสบ
4. "ยาที่แพทย์สั่ง ห้ามหยุดเอง" — แจ้งแพทย์ผู้ฉีดเพื่อวางแผนร่วมกัน
5. "อาการที่ต้องติดต่อคลินิกทันที" — ปวดมากขึ้นเรื่อย ๆ · ผิวซีด/ม่วงคล้ำ · ตามัว + CTA LINE @vinfinityclinic
Alt text: ผลิตภัณฑ์สกินแคร์วางบนโต๊ะ พร้อมข้อความว่าตัวไหนใช้ต่อได้และตัวไหนควรพักหลังฉีดฟิลเลอร์ / Skincare products on a table with text on which to keep and which to pause after filler injections.
Graphic brief: 1080×1350, 5 slides. Real photo assets/img/articles/skincare-before-after-injection.jpg on slide 1 (and as a faded background on 2–5), dark navy gradient (#0B142E → #1A326B). Silver #EEF2F8 headlines, simple ✓ / ⏸ icons, no product brand names, no before/after. Small text footer credit on every slide: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band.

### 2026-11-11
- Wednesday: Marketing light + AEO. Today's post = Wed 11 Nov 11.11 Story (Draft 7): team checks the LINE Sculptra seat counter this morning → version A (places left) or B (full); full TH in today's report. Foreign plan: Lao #3 due today, EN #4 Thu 12 Nov (doctor's doc, not re-drafted).
- promos.ts unchanged: only sculptra-2611 (until 15 Nov 23:59); no promo defined after 15 Nov. No LINE broadcast planned for tomorrow (Thu 12 Nov).
- Done: Draft 15 for Fri 27 Nov (clinic checklist) below — content only from /articles/choosing-filler-clinic-udon/ (official check sources: hss.moph, tmc.or.th, oryor.com). Calendar row → DRAFT READY.
- No market watch (Mondays only).

#### Draft 15 — Fri 27 Nov · IG + FB feed (carousel 4 slides, 1080×1350) · Choosing a filler clinic in Udon Thani
TH caption:
ฉีดฟิลเลอร์ อุดร ที่ไหนดี? ก่อนเลือกคลินิก เช็ก 5 ข้อนี้ ✅
ไม่ว่าจะเลือกคลินิกไหน ทุกข้อตรวจสอบเองได้จากแหล่งทางการ

1️⃣ คลินิกมีใบอนุญาตสถานพยาบาล — เช็กได้ที่ระบบตรวจสอบสถานพยาบาลเอกชน กรม สบส.
2️⃣ แพทย์เป็นผู้ฉีดเอง — ถามชื่อแพทย์ แล้วตรวจสอบกับแพทยสภา (tmc.or.th)
3️⃣ ผลิตภัณฑ์ขึ้นทะเบียน อย. — ขอดูกล่อง เลขทะเบียน วันหมดอายุ เปิดกล่องต่อหน้าก่อนฉีด
4️⃣ ประเมินก่อนเสนอราคา — อธิบายว่าควรเติมตรงไหนเพราะอะไร และแจ้งค่าใช้จ่ายทั้งหมดก่อนเริ่ม
5️⃣ บอกความเสี่ยงตรง ๆ และมีแผนรับมือภาวะแทรกซ้อน รวมถึงนัดติดตามผลหลังฉีด

⚠️ สัญญาณที่ควรระวัง: ราคาถูกผิดปกติ ไม่ยอมเปิดกล่อง ไม่บอกชื่อแพทย์ รับประกันผล หรือฉีดนอกสถานพยาบาล

อ่านเช็กลิสต์ฉบับเต็ม 7 ข้อ: vinfinityclinic.com/articles/choosing-filler-clinic-udon/
Vinfinity Clinic อุดรธานี ดูแลโดย นพ.เดโชวัต พรมดา (ว.48943) ตรวจสอบรายชื่อได้ที่แพทยสภา
💬 ทัก LINE @vinfinityclinic เพื่อนัดประเมินกับแพทย์ · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Choosing a filler clinic in Udon Thani? Check these 5 things first: (1) the clinic holds a medical-facility licence; (2) a licensed doctor injects — ask the name and check it with the Medical Council of Thailand (tmc.or.th); (3) the product is Thai FDA-registered and the box is opened in front of you; (4) you get an assessment and the full cost before anything starts; (5) risks are explained honestly, with a complication plan and a follow-up visit. Red flags: unusually low prices, no box, no doctor's name, promised results, injections outside a clinic. Full checklist (Thai): vinfinityclinic.com/articles/choosing-filler-clinic-udon/ · Dr. Dechowat Promda (license ว.48943). Consultations in English: LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic. Results vary.

Hashtags: #VinfinityClinic #ฉีดฟิลเลอร์อุดร #ฟิลเลอร์อุดร #คลินิกอุดร #อุดรธานี #เลือกคลินิก #UdonThani #DermalFiller

Slides (silver text on navy, one idea each):
1. "ก่อนเลือกคลินิกฟิลเลอร์ เช็ก 5 ข้อนี้" (cover, photo assets/img/articles/filler-clinic-udon-checklist.jpg)
2. "ใบอนุญาต + แพทย์ผู้ฉีด" — สถานพยาบาล (สบส.) · ชื่อแพทย์ (แพทยสภา)
3. "ผลิตภัณฑ์ + การประเมิน" — เลข อย. เปิดกล่องต่อหน้า · ประเมินและแจ้งราคาทั้งหมดก่อนเริ่ม
4. "ความเสี่ยง + สัญญาณที่ควรระวัง" — มีแผนรับมือภาวะแทรกซ้อน นัดติดตามผล · ระวังราคาถูกผิดปกติ ไม่เปิดกล่อง รับประกันผล + CTA LINE @vinfinityclinic
Alt text: เช็กลิสต์เลือกคลินิกฉีดฟิลเลอร์ในอุดรธานี ใบอนุญาตสถานพยาบาล แพทย์ผู้ฉีด เลขทะเบียน อย. และการประเมินก่อนฉีด / Checklist for choosing a filler clinic in Udon Thani: facility licence, injecting doctor, Thai FDA registration and assessment before treatment.
Graphic brief: 1080×1350, 4 slides. Real photo assets/img/articles/filler-clinic-udon-checklist.jpg on slide 1 (faded background on 2–4), dark navy gradient (#0B142E → #1A326B), silver #EEF2F8 headlines, simple ✓ / ⚠ icons. No competitor names, no product brand names, no before/after, no price. Small text footer credit on every slide: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band.

## 11.11 one-day offer (doctor's decision 2026-11-11)
- "สวยครบ 2 จุด" 11,111 THB: the doctor picks 2 of 3 (HA filler 1 cc · New Doublo 2.0 หัว Pen ไม่จำกัดช็อต · Vitaran 1 cc). 11 places, 1 per person, claim on 11 Nov only (LINE keyword "11.11" → card → กดรับสิทธิ์), book within 48 h, visit by 30 Nov, not combined with other promos. Defined in line-app/lib/promos.ts (key 1111-2611); broadcast set 1111-2611-card.
- Replaces Draft 7 (11.11 Story) for today. Do not quote 11,111 after 11 Nov.

### 2026-11-12
- Thursday: Marketing light + live-site check. Production deployment dpl_DvP6ithhLys1cQKEaFkusfcBUoUu (commit c400745) READY; /price/ and /en/ return 200 via Vercel fetch, render fully (title, canonical/hreflang, JSON-LD, footer; EN "Not on LINE?" strip present). /price/ still Vitaran 9,990 · 4+ boxes 8,990. Direct curl to vinfinityclinic.com blocked by this sandbox's proxy (not a site fault).
- Next ready feed post: Fri 13 Nov "Meet the doctor" (Draft 8, EN-first) — full TH caption in today's report. Foreign plan: EN #4 due today (Thu 12 Nov), Lao #4 Sat 14 Nov (doctor's doc, not re-drafted).
- promos.ts unchanged: sculptra-2611 runs until 15 Nov 23:59; 1111-2611 ended 11 Nov (do not quote 11,111). No promo defined after 15 Nov. No LINE broadcast planned for tomorrow (Fri 13 Nov). Backlog 3: last Sculptra reminder only if the team sees places left on the LINE counter — promo ends Sun 15 Nov.
- Done: Draft 16 for Sun 29 Nov (Vitaran cool-season) below — facts only from /skin-booster/ and /price/. Uses LINE ประเมินผิว CTA, not "โปรเดือนนี้", because promos.ts has no running promo on 29 Nov (the keyword would show nothing). Every calendar slot to 29 Nov is now DRAFT READY.
- No market watch (Mondays only).

#### Draft 16 — Sun 29 Nov · FB + IG feed · Vitaran PN cool-season skin
TH caption:
ลมหนาวมา ผิวแห้งง่าย ดูหมองกว่าปกติไหมคะ? 🍃
ช่วงอากาศเย็นและแห้ง หลายคนเริ่มเห็นผิวขาดความชุ่มชื้น รูขุมขนกว้าง และริ้วรอยเล็ก ๆ ชัดขึ้น

Vitaran (PN) สกินบูสเตอร์กลุ่มโพลีนิวคลีโอไทด์ ช่วยฟื้นฟูและเสริมความแข็งแรงของผิว
• มี 2 แบบ: Vitaran I สำหรับรอบดวงตา และ Vitaran II สำหรับใบหน้า แพทย์เลือกแบบและตำแหน่งหลังประเมินผิว
• มักทำเป็นคอร์สหลายครั้ง แพทย์กำหนดจำนวนครั้งและระยะห่างให้เหมาะกับแต่ละคน
• หลังฉีดอาจมีตุ่มนูนเล็ก ๆ หรือรอยแดงตามจุดฉีดได้ 1–3 วัน
• ดูแลควบคู่ด้วยมอยส์เจอไรเซอร์และกันแดดทุกวัน

💙 ราคา Vitaran
• 1 กล่อง (2 cc) 9,990 บาท
• 4 กล่องขึ้นไป กล่องละ 8,990 บาท

ประเมินและฉีดโดย นพ.เดโชวัต พรมดา (ว.48943)
📍 Vinfinity Clinic อุดรธานี (ปิดวันอังคาร)
💬 ทัก LINE @vinfinityclinic ส่งรูปผิวให้แพทย์ประเมินก่อนนัดคิว · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Cool, dry season — skin feeling tight and dull? Vitaran (PN, polynucleotide skin booster) helps restore and strengthen the skin. Vitaran I is for the eye area, Vitaran II for the face; the doctor chooses after assessing your skin. It is usually done as a course; number of sessions and spacing are set per person. Small bumps or redness at injection points can last 1–3 days. Keep up moisturiser and daily sunscreen.
• 1 box (2 cc): 9,990 THB · 4+ boxes: 8,990 THB per box
Assessed and treated by Dr. Dechowat Promda (license 48943). Consultations in English: LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic · +66 82-462-2963. Closed Tuesdays.
Results vary from person to person. All procedures carry possible side effects.

Hashtags: #VinfinityClinic #Vitaran #PN #สกินบูสเตอร์ #ผิวหน้าหนาว #คลินิกอุดร #อุดรธานี #Polynucleotide #SkinBooster #UdonThani
Alt text: ห้องทรีตเมนต์ของ Vinfinity Clinic อุดรธานี พร้อมข้อความ "ลมหนาวมา ผิวแห้งง่าย" และราคา Vitaran / Treatment room at Vinfinity Clinic, Udon Thani, with the text "Cool season, dry skin" and Vitaran prices.
Graphic brief: 1080×1350. Real photo assets/img/treatment.jpg, dark navy gradient (#0B142E → #1A326B) over the lower 55%. Silver #EEF2F8 headline "ลมหนาวมา ผิวแห้งง่าย"; sub "Vitaran PN 2 cc · 9,990.- | 4 กล่องขึ้นไป 8,990.-/กล่อง". Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no product boxes, no before/after.

### 2026-11-13
- Friday: Marketing light + Branding deep. Today's slot Fri 13 Nov = "Meet the doctor" (Draft 8, EN-first) — full TH caption in today's report. Next slot Sun 15 Nov = pre-Loy Krathong (Draft 9, ready). Foreign plan: Lao #4 due Sat 14 Nov, EN #5 Mon 16 Nov (doctor's doc, not re-drafted).
- promos.ts unchanged (last change 7cabcba, 11.11): sculptra-2611 ends Sun 15 Nov 23:59; no promo after that. No LINE broadcast planned for tomorrow (Sat 14 Nov).
- Done: calendar rolled to 13 Dec (6 new slots; Sun 13 Dec = referral last call, event ends 15 Dec). Draft 17 for Wed 2 Dec (authority carousel, branding backlog 8 brief) below — facts only from /articles/layered-injection-anatomy/.
- No market watch (Mondays only).

#### Draft 17 — Wed 2 Dec · FB + IG carousel (5 slides, 1080×1350) · Authority: planning by layer
TH caption:
หน้าเรามี 5 ชั้น ทำไมหมอวางแผนทีละชั้น? 🏛️
จากผิวลงไปถึงกระดูก ใบหน้าเรียงเป็นชั้น: ผิวหนัง · ไขมันชั้นตื้น · SMAS (พังผืดกับกล้ามเนื้อ) · ไขมันชั้นลึกกับเอ็นยึด · กระดูก
เมื่ออายุมากขึ้น ทุกชั้นเปลี่ยนไปพร้อมกัน กระดูกบางลง ไขมันชั้นลึกยุบ เอ็นยึดหย่อน ผิวด้านบนจึงตกตาม

• ไขมันชั้นลึกทำหน้าที่ค้ำโครง ไขมันชั้นตื้นขยับตามสีหน้า
• เจลแต่ละชนิดแข็งและยืดหยุ่นต่างกัน เจลที่แข็งเหมาะกับชั้นลึก ถ้าวางในชั้นตื้น หน้าอาจดูเต็มเกินไปเวลายิ้ม
• ชั้นผิวต้องดูแลด้วยวิธีของมันเอง เช่น สกินบูสเตอร์ในชั้นผิว

นี่คือเหตุผลที่บางคนฉีดแล้วหน้านิ่งดูดี แต่พอยิ้มกลับดูแปลก ปัญหาไม่ได้อยู่ที่ปริมาณอย่างเดียว แต่อยู่ที่ชนิดเจลกับชั้นที่วาง
แนวทางของ The Filler Architect: ประเมินทีละชั้น เลือกเจลให้ตรงชั้น ใช้เท่าที่จำเป็น และนัดดูผลก่อนเติมเพิ่ม
📖 อ่านพร้อมเอกสารอ้างอิง: vinfinityclinic.com/articles/layered-injection-anatomy/
💬 ทัก LINE @vinfinityclinic ส่งรูปหน้าตรงและด้านข้างให้ นพ.เดโชวัต พรมดา (ว.48943) ประเมินเบื้องต้น · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Your face has 5 layers — that's why we plan layer by layer. Skin, superficial fat, SMAS, deep fat with ligaments, and bone all change with age. Deep fat supports the structure; superficial fat moves with expression. A firm gel suits deep layers; placed too superficially, the face can look overfilled when you smile. Skin quality is treated in the skin itself, e.g. skin boosters. Our approach: assess each layer, match the gel to the layer, use only what's needed, review before adding more. Read more (Thai, with references): vinfinityclinic.com/articles/layered-injection-anatomy/ · Dr. Dechowat Promda (license 48943). Consultations in English: LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic. Results vary from person to person.

Hashtags: #TheFillerArchitect #VinfinityClinic #ฟิลเลอร์อุดร #คลินิกอุดร #อุดรธานี #FacialAnatomy #DermalFiller #UdonThani
Slides: 1 "หน้าเรามี 5 ชั้น" (cover, illustration) · 2 the 5 layers listed top→bottom · 3 "ลึกค้ำโครง ตื้นขยับตามสีหน้า" · 4 "เจลต้องเข้ากับชั้น — ยิ้มแล้วแปลก เพราะอะไร" · 5 "ประเมินทีละชั้น ใช้เท่าที่จำเป็น" + CTA LINE.
Alt text: ภาพประกอบโครงสร้างใบหน้า 5 ชั้น ผิวหนัง ไขมันชั้นตื้น SMAS ไขมันชั้นลึกและเอ็นยึด กระดูก / Illustration of the 5 facial layers: skin, superficial fat, SMAS, deep fat and ligaments, bone.
Graphic brief: 1080×1350, 5 slides. Image assets/img/articles/facial-anatomy-5-layers.jpg on slide 1 (faded on 2–5) with a small "ภาพประกอบ / Illustration" label (it is a drawing, not a photo). Dark navy gradient (#0B142E → #1A326B), silver #EEF2F8 headlines. No patient faces, no product brands, no before/after, no price. Small text footer credit on every slide: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band.

### 2026-11-14
- Saturday: Marketing light + live-site check. Production deployment dpl_2tbjtx6yo5N6ZBPvVrZFff2khfsL (commit ad23ae9) READY; / (TH) and /en/price/ return 200 via Vercel fetch and render fully (title, canonical/hreflang, JSON-LD, footer, EN "Not on LINE?" strip). /price/ source + live /en/price/: Vitaran 9,990/box · 4+ boxes 8,990/box (matches drafts). Direct curl to vinfinityclinic.com blocked by this sandbox's proxy (403 at proxy, not a site fault).
- Next ready feed post: Sun 15 Nov pre-Loy Krathong (Draft 9) — full TH caption in today's report. Foreign plan: Lao #4 due today (Sat 14 Nov), EN #5 Mon 16 Nov (doctor's doc, not re-drafted).
- promos.ts unchanged (last change 7cabcba): sculptra-2611 ends Sun 15 Nov 23:59; no promo defined after that. No LINE broadcast planned for tomorrow (Sun 15 Nov).
- Done: Draft 18 for Fri 4 Dec (20 s reel "หน้านิ่งสวย แต่ยิ้มแล้วแปลก") below — facts only from /articles/layered-injection-anatomy/ (Rohrich et al., PRS Global Open 2026: firm gel suits deep layer; in the superficial layer the face can look overfilled when moving). No promo, no price, no product brand, no before/after.
- No market watch (Mondays only).

#### Draft 18 — Fri 4 Dec · TikTok / Reels + FB · "หน้านิ่งสวย แต่ยิ้มแล้วแปลก" (20 s)
Script (9:16, doctor to camera in clinic, silver subtitles on navy lower third):
0–3 s HOOK — text "หน้านิ่งสวย แต่ยิ้มแล้วแปลก?" · หมอ: "เคยเห็นไหมคะ ฉีดฟิลเลอร์แล้วหน้านิ่งดูดี แต่พอยิ้มกลับดูแปลก"
3–8 s — B-roll facial-anatomy-5-layers.jpg (label "ภาพประกอบ") · "ใบหน้ามีไขมันสองชั้น ชั้นลึกค้ำโครง ชั้นตื้นขยับตามสีหน้า"
8–14 s — หมอถือเจลสองแบบ (ไม่เห็นยี่ห้อ) หรือกราฟิกง่าย ๆ "แข็ง / ยืดหยุ่น" · "เจลแต่ละชนิดแข็งไม่เท่ากัน เจลที่แข็งเหมาะกับชั้นลึก ถ้าไปอยู่ชั้นตื้น หน้าอาจดูเต็มเกินไปเวลายิ้ม"
14–18 s — "ปัญหาไม่ได้อยู่ที่ปริมาณอย่างเดียว แต่อยู่ที่ชนิดเจลกับชั้นที่วาง"
18–20 s — end card "ประเมินทีละชั้น ใช้เท่าที่จำเป็น" · LINE @vinfinityclinic · ว.48943
TH caption:
หน้านิ่งสวย แต่ยิ้มแล้วแปลก เพราะอะไร? 😊
กลางใบหน้ามีไขมันสองชั้น ชั้นลึกทำหน้าที่ค้ำโครง ส่วนชั้นตื้นขยับตามสีหน้า
เจลแต่ละชนิดแข็งและยืดหยุ่นต่างกัน เจลที่แข็งเหมาะกับชั้นลึก ถ้านำไปวางในชั้นตื้น หน้าอาจดูเต็มเกินไปเวลายิ้มหรือขยับ
ปัญหาจึงไม่ได้อยู่ที่ปริมาณอย่างเดียว แต่อยู่ที่ชนิดเจลกับชั้นที่วาง
แนวทางของ The Filler Architect: ประเมินทีละชั้น เลือกเจลให้ตรงชั้น ใช้เท่าที่จำเป็น และนัดดูผลก่อนเติมเพิ่ม
📖 อ่านพร้อมเอกสารอ้างอิง: vinfinityclinic.com/articles/layered-injection-anatomy/
💬 ทัก LINE @vinfinityclinic ส่งรูปหน้าตรง ด้านข้าง และตอนยิ้ม ให้ นพ.เดโชวัต พรมดา (ว.48943) ประเมินเบื้องต้น · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง
EN caption:
Looks good at rest, odd when smiling — why? The midface has two fat layers: the deep one supports the structure, the superficial one moves with expression. Fillers differ in firmness and stretch. A firm gel suits the deep layer; placed in the superficial layer, the face can look overfilled when you smile. So it's not only about how much — it's which gel, in which layer. Our approach: assess layer by layer, match the gel to the layer, use only what's needed, review before adding more. Read more (Thai, with references): vinfinityclinic.com/articles/layered-injection-anatomy/ · Dr. Dechowat Promda (license 48943). Consultations in English: LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic. Results vary from person to person. All procedures carry possible side effects.
Hashtags: #TheFillerArchitect #VinfinityClinic #ฟิลเลอร์อุดร #ฉีดฟิลเลอร์ #คลินิกอุดร #อุดรธานี #FacialAnatomy #DermalFiller #UdonThani
Alt text (cover): แพทย์อธิบายว่าทำไมบางคนฉีดฟิลเลอร์แล้วหน้านิ่งดูดีแต่ยิ้มแล้วดูแปลก พร้อมภาพประกอบชั้นใบหน้า / Doctor explaining why filler can look fine at rest but odd when smiling, with an illustration of the facial layers.
Graphic brief (cover 1080×1920): real frame of the doctor from the clip (or assets/img/dr-bas.jpg), dark navy gradient (#0B142E → #1A326B) over the lower 50%; silver #EEF2F8 headline "หน้านิ่งสวย แต่ยิ้มแล้วแปลก?"; sub "เจลต้องเข้ากับชั้น"; small text footer credit "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no patient faces, no before/after, no product brands or syringes with labels, no Galderma photos.

### 2026-11-15
- Sunday: Marketing light + live-site check. Production deployment dpl_6xpViiyXLCQioiaK37feFyeR3UXJ (commit b4a79d6) READY; / and /articles/filler-safety-evidence/ return 200 via Vercel fetch and render fully (title, meta description, canonical, hreflang th/en/x-default, 3 JSON-LD blocks, footer with ว./ฆสพ. line). Direct curl to vinfinityclinic.com still refused by this sandbox's proxy (not a site fault).
- Today's slot Sun 15 Nov = pre-Loy Krathong (Draft 9) — full TH caption in today's report. Next: EN #5 Mon 16 Nov (doctor's doc, not re-drafted), Wed 18 Nov referral reminder (Draft 10, version without Sculptra).
- promos.ts unchanged (last change 7cabcba): sculptra-2611 ends tonight 23:59; no promo defined after it, so from 16 Nov the "โปรเดือนนี้" CTA has nothing to show — drafts use LINE ประเมิน / ชวนเพื่อน CTAs. No LINE broadcast planned for tomorrow (Mon 16 Nov).
- Done: Draft 19 for Sun 6 Dec (filler-safety carousel) below — facts only from /articles/filler-safety-evidence/ (JAMA Dermatol 2021 needle 1/6,410 vs cannula 1/40,882; CMAC: negative aspiration ≠ safe; ultrasound useful but not proven to lower complications). Chosen instead of "Sculptra vs HA" because that topic already ran as the 6 Nov reel. No promo, no price, no brand, no before/after.
- No market watch (Mondays only).

#### Draft 19 — Sun 6 Dec · FB + IG carousel (6 slides, 1080×1350) · 5 questions before filler
TH caption:
ก่อนฉีดฟิลเลอร์ ถามหมอ 5 ข้อนี้ 🩺
ฟิลเลอร์เป็นหัตถการทางการแพทย์ ภาวะแทรกซ้อนที่ร้ายแรงคือเจลเข้าไปอุดหลอดเลือด พบน้อย แต่ส่วนใหญ่เกิดบริเวณกลางใบหน้า เช่น ร่องแก้ม ข้างจมูก และรอบปาก

งานวิจัยบอกอะไรเรา
• ข้อมูลราว 1.7 ล้านหลอด (JAMA Dermatology 2021): เข็มพบการอุดหลอดเลือด 1 ใน 6,410 หลอด แคนนูลา 1 ใน 40,882 หลอด ต่ำกว่า แต่ไม่ใช่ศูนย์
• การดูดทดสอบก่อนฉีดช่วยได้ไม่มาก ผลลบไม่ได้แปลว่าปลอดภัย
• อัลตราซาวด์ช่วยเห็นหลอดเลือดในจุดเสี่ยง แต่ยังไม่มีงานวิจัยเปรียบเทียบยืนยันว่าลดภาวะแทรกซ้อนได้
• สิ่งที่ชี้ขาดคือแพทย์รู้กายวิภาคแต่ละชั้น และคลินิกพร้อมรับมือได้เร็วถ้าเกิดเหตุ

5 คำถามที่ควรถามก่อนฉีด
1️⃣ ใครเป็นคนฉีด และฉีดตำแหน่งนี้มาบ่อยแค่ไหน
2️⃣ จะวางเจลชั้นไหน ใช้เข็มหรือแคนนูลา เพราะอะไร
3️⃣ ผลิตภัณฑ์ขึ้นทะเบียน อย. หรือไม่ ขอดูกล่องและเลขล็อตได้ไหม
4️⃣ คลินิกมีเอนไซม์สลายฟิลเลอร์และแผนรับมือภาวะแทรกซ้อนพร้อมหรือไม่
5️⃣ ถ้ามีอาการผิดปกติหลังกลับบ้าน ติดต่อใครได้

📖 อ่านพร้อมเอกสารอ้างอิง: vinfinityclinic.com/articles/filler-safety-evidence/
💬 ทัก LINE @vinfinityclinic ถามคำถามเหล่านี้กับ นพ.เดโชวัต พรมดา (ว.48943) ได้ก่อนตัดสินใจ · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
5 questions to ask before filler. A serious filler complication is gel blocking a blood vessel — rare, but most cases happen in the midface (nasolabial folds, beside the nose, around the mouth). What the research says: in data on about 1.7 million syringes (JAMA Dermatology 2021), needles caused vascular occlusion in 1 in 6,410 syringes and cannulas in 1 in 40,882 — lower, but not zero. A negative aspiration test does not mean an injection is safe. Ultrasound helps see vessels in high-risk areas, but comparative studies have not yet shown it lowers complications. What matters most: an injector who knows each facial layer, and a clinic ready to act quickly. Ask: 1) Who injects, and how often in this area? 2) Which layer, needle or cannula, and why? 3) Is the product registered with the Thai FDA — can I see the box and lot number? 4) Is hyaluronidase and a complication plan on hand? 5) Who do I contact if something feels wrong after I go home? Read more (Thai, with references): vinfinityclinic.com/articles/filler-safety-evidence/ · Dr. Dechowat Promda (license 48943). Consultations in English: LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic. Results vary from person to person. All procedures carry possible side effects.

Hashtags: #TheFillerArchitect #VinfinityClinic #ฟิลเลอร์อุดร #ฉีดฟิลเลอร์ #คลินิกอุดร #อุดรธานี #FillerSafety #DermalFiller #UdonThani
Slides: 1 "ก่อนฉีดฟิลเลอร์ ถามหมอ 5 ข้อนี้" (cover, article illustration) · 2 "ความเสี่ยงหลักอยู่ที่หลอดเลือด กลางใบหน้า" · 3 "เข็ม 1/6,410 · แคนนูลา 1/40,882 — ต่ำกว่า ไม่ใช่ศูนย์" (JAMA Dermatol 2021) · 4 "ดูดทดสอบผลลบ ≠ ปลอดภัย · อัลตราซาวด์ช่วยเห็น แต่ยังรอหลักฐาน" · 5 the 5 questions · 6 CTA LINE + article link.
Alt text: ภาพประกอบหลักการฉีดฟิลเลอร์ให้ปลอดภัยบริเวณกลางใบหน้า พร้อมข้อความ "ก่อนฉีดฟิลเลอร์ ถามหมอ 5 ข้อนี้" / Illustration of filler-safety principles in the midface with the text "5 questions to ask before filler".
Graphic brief: 1080×1350, 6 slides. Image assets/img/articles/filler-safety-vascular-midface.jpg on slide 1 (faded on 2–6) with a small "ภาพประกอบ / Illustration" label. Dark navy gradient (#0B142E → #1A326B), silver #EEF2F8 headlines, numbers in silver #D5DDEE. Cite "JAMA Dermatology 2021" in small text on slide 3. No patient faces, no syringes with labels, no product brands, no before/after, no price, no fear imagery (no necrosis photos). Small text footer credit on every slide: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band.

## EM Lift launch (doctor's brief 2026-11-15)
- New non-needle electromagnetic treatment, name "EM Lift". Early Bird 4,500 THB per area (regular 5,990 after). Areas: forehead, under-eye x2, cheek x2, under-chin, neck, shoulders. Protocol: 4 sessions, 1 week apart. Confirmed by the doctor 15 Nov: 4,500 is per area per session; sell the 4-session course at 18,000 per area (regular 23,960). Early Bird runs to 30 Nov.
- Do not claim specific results, duration or downtime until the device name and Thai FDA registration wording are on file. Client photos/videos (1 woman, 1 man) are cleared by the clients for all channels; crop out the vendor technician.
- LINE: promo key emlift-2611 (keyword "EM Lift"), broadcast set emlift-2611.

### 2026-11-16
- Monday: Marketing light + SEO deep + market watch. promos.ts: sculptra-2611 ended 15 Nov; emlift-2611 runs 15–30 Nov (4,500 ฿/area/session, course 4 sessions 18,000 ฿/area) — now the running promotion at the top of this file; "โปรเดือนนี้" CTA works again.
- Today's slot Mon 16 Nov = EN post #5 from the doctor's foreign-plan doc (not re-drafted). Next Thai feed post: Wed 18 Nov referral reminder (Draft 10, A/B — doctor still to pick, backlog 2b).
- Done: added Thu 19 Nov EM Lift launch post (Draft 20 below) and a Sat 28 Nov last-call Story slot (TO DRAFT) to the calendar. Facts only from the doctor's 15 Nov brief and promos.ts; no results/duration/downtime claims (device name and Thai FDA wording not on file).
- Market watch (web search): electromagnetic face treatments are sold by Bangkok chains (e.g. Emface® listings for The Klinique on WhatClinic https://www.whatclinic.com/beauty-clinics/thailand/emface; Samitivej "Rena Face" package https://www.samitivejhospitals.com/package/detail/Rena-Face). Prices not verified; EM Lift's device is not named, so no public comparison. No Udon Thani-local promo found for November (results were HDmall listings only).
- No LINE broadcast planned for tomorrow (Tue 17 Nov, clinic closed). Broadcast set emlift-2611 exists; send day is the doctor's call (not Tuesday).

#### Draft 20 — Thu 19 Nov · FB + IG feed (+ Story) · EM Lift launch (Early Bird to 30 Nov)
TH caption:
✨ ใหม่ที่ Vinfinity · EM Lift
เทคโนโลยีคลื่นแม่เหล็กไฟฟ้า ไม่ใช้เข็ม แปะแผ่นบนจุดที่ต้องการ ทำได้ทั้งผู้หญิงและผู้ชาย

📍 เลือกจุดได้: หน้าผาก · ใต้ตา · แก้ม · ใต้คาง · คอ · บ่า
(ใต้ตาและแก้มนับข้างละ 1 จุด)
🗓 โปรแกรม 4 ครั้ง สัปดาห์ละครั้ง

💙 Early Bird ถึง 30 พ.ย. นี้
• 4,500.- ต่อจุด ต่อครั้ง (ปกติ 5,990.-)
• คอร์ส 4 ครั้ง 18,000.- ต่อจุด (ปกติ 23,960.-)

แพทย์ประเมินก่อนทุกครั้งว่าจุดไหนเหมาะ หรือควรใช้วิธีอื่นร่วมด้วย
โดย นพ.เดโชวัต พรมดา (ว.48943) · 📍 Vinfinity Clinic อุดรธานี · 📞 082-462-2963 · คลินิกปิดทุกวันอังคาร
ภาพผู้รับบริการจริง เผยแพร่โดยได้รับความยินยอม
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

ทักไลน์ @vinfinityclinic พิมพ์ “โปรเดือนนี้” หรือกดเมนู 🎁 โปรเดือนนี้

EN caption:
New at Vinfinity: EM Lift ✨ A needle-free electromagnetic treatment — pads are placed on the areas you choose; for women and men. Areas: forehead, under-eye, cheeks, under the chin, neck, shoulders (under-eye and cheek count as one area per side). Programme: 4 sessions, one week apart. Early Bird until 30 Nov: 4,500 THB per area per session (regular 5,990), or the 4-session course at 18,000 THB per area (regular 23,960). The doctor assesses first which areas suit you, or whether another approach fits better. Dr. Dechowat Promda (license 48943) · consultations in English · closed Tuesdays. Real clients, shown with their consent. Results vary from person to person. All procedures carry possible side effects. Message LINE @vinfinityclinic and type "โปรเดือนนี้" (or tap 🎁 โปรเดือนนี้ in the menu) · Messenger m.me/Vinfinity.Clinic

Hashtags: #EMLift #VinfinityClinic #ไม่ใช้เข็ม #ยกกระชับอุดร #คลินิกอุดร #อุดรธานี #NeedleFree #UdonThani
Alt text: ผู้รับบริการหญิงและชายนอนพักขณะทำ EM Lift โดยมีแผ่นแปะบริเวณหน้าผากและแก้ม พร้อมข้อความ "EM Lift ใหม่ที่ Vinfinity" / A woman and a man lying back during EM Lift with pads on the forehead and cheeks, with the text "EM Lift, new at Vinfinity".
Graphic brief: 1080×1350 feed. Real client photos side by side (woman left, man right — the same frames as the LINE card; crop out the vendor technician). Dark navy gradient (#0B142E → #1A326B) over the lower 55%. Silver #EEF2F8 headline "EM Lift"; sub "คลื่นแม่เหล็กไฟฟ้า · ไม่ใช้เข็ม"; area chips in silver outline (หน้าผาก · ใต้ตา · แก้ม · ใต้คาง · คอ · บ่า); price line in silver #D5DDEE "Early Bird 4,500.- / จุด / ครั้ง · คอร์ส 4 ครั้ง 18,000.- / จุด · ถึง 30 พ.ย."; small label "ภาพผู้รับบริการจริง · ได้รับความยินยอม". Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no white price box, no device brand, no before/after, no result or "lift" claims beyond the product name. Story: the LINE card line-app/public/campaign/emlift-2611/1-1x1.jpg may be used as is.

### 2026-11-17
- Tuesday (clinic closed): Marketing light + live-site check only. Production dpl_7jdXVsRvevDNTcRvYZemcgFMHFxQ (commit 4f1412d) READY; / (TH) and /en/price/ return 200 via Vercel fetch and render fully (title, canonical, hreflang th/en/x-default, JSON-LD, footer with ฆสพ. + "closed Tuesdays"). Nothing broken.
- promos.ts unchanged since 9efd109: emlift-2611 runs to 30 Nov 23:59 (4,500 ฿/area/session, course 18,000 ฿/area); no December promo defined yet.
- Next slot Wed 18 Nov = referral reminder (Draft 10) — full TH caption (Version A) in today's report; doctor still to pick A or B (backlog 2b). Then Thu 19 Nov EM Lift launch (Draft 20).
- Done: Draft 21 for Sat 28 Nov (EM Lift Early Bird last-call Story, 2 frames) below — facts only from promos.ts emlift-2611 and the doctor's 15 Nov brief; no results/duration/downtime claims, no "last chance"/urgency wording beyond the end date.
- No LINE broadcast tomorrow (Wed 18 Nov) unless the doctor decides to send set emlift-2611 (not Tuesday). No market watch (Mondays only).

#### Draft 21 — Sat 28 Nov · FB + IG Story (9:16, 2 frames) · EM Lift Early Bird ends Mon 30 Nov
Frame 1 text: "EM Lift · Early Bird ถึงจันทร์ 30 พ.ย." / "4,500.- ต่อจุด ต่อครั้ง (ปกติ 5,990.-)" / "คอร์ส 4 ครั้ง 18,000.- ต่อจุด (ปกติ 23,960.-)"
Frame 2 text: "ไม่ใช้เข็ม · ทำได้ทั้งผู้หญิงและผู้ชาย" / "หน้าผาก · ใต้ตา · แก้ม · ใต้คาง · คอ · บ่า" / "แพทย์ประเมินก่อนทุกครั้ง" / link sticker → LINE @vinfinityclinic
TH caption (FB Story / IG caption field):
EM Lift ราคา Early Bird ถึงวันจันทร์ที่ 30 พ.ย. นี้ 💙
• 4,500.- ต่อจุด ต่อครั้ง (ปกติ 5,990.-)
• คอร์ส 4 ครั้ง สัปดาห์ละครั้ง 18,000.- ต่อจุด (ปกติ 23,960.-)
เทคโนโลยีคลื่นแม่เหล็กไฟฟ้า ไม่ใช้เข็ม · เลือกจุดได้: หน้าผาก · ใต้ตา · แก้ม · ใต้คาง · คอ · บ่า (ใต้ตาและแก้มนับข้างละ 1 จุด)
แพทย์ประเมินก่อนทุกครั้งว่าจุดไหนเหมาะ · โดย นพ.เดโชวัต พรมดา (ว.48943) · คลินิกเปิดวันจันทร์ 30 พ.ย. 10:00–19:00
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

ทักไลน์ @vinfinityclinic พิมพ์ “โปรเดือนนี้” หรือกดเมนู 🎁 โปรเดือนนี้

EN caption:
EM Lift Early Bird pricing runs until Monday 30 Nov 💙 4,500 THB per area per session (regular 5,990), or the 4-session course (one week apart) at 18,000 THB per area (regular 23,960). Needle-free electromagnetic treatment; areas: forehead, under-eye, cheeks, under the chin, neck, shoulders (under-eye and cheek count as one area per side). The doctor assesses first. Dr. Dechowat Promda (license 48943) · consultations in English · open Mon 30 Nov 10:00–19:00. Results vary from person to person. All procedures carry possible side effects. LINE @vinfinityclinic — type "โปรเดือนนี้" · Messenger m.me/Vinfinity.Clinic

Hashtags: #EMLift #VinfinityClinic #ไม่ใช้เข็ม #คลินิกอุดร #อุดรธานี #UdonThani
Alt text: ภาพผู้รับบริการขณะทำ EM Lift โดยมีแผ่นแปะบนใบหน้า พร้อมข้อความ "EM Lift Early Bird ถึง 30 พ.ย." / A client during EM Lift with pads on the face, with the text "EM Lift Early Bird until 30 Nov".
Graphic brief: 1080×1920, 2 frames. Frame 1: real client photo (woman, consented; vendor technician cropped) top 50%, dark navy gradient (#0B142E → #1A326B) below; silver #EEF2F8 headline "Early Bird ถึง 30 พ.ย."; price lines in silver #D5DDEE. Frame 2: real client photo (man, consented), same gradient; area chips in silver outline; LINE link sticker + keyword chip "พิมพ์ “โปรเดือนนี้”". Small label "ภาพผู้รับบริการจริง · ได้รับความยินยอม". Small text footer credit on both frames: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no countdown timer, no "โอกาสสุดท้าย"/"last chance", no device brand, no before/after, no result claims.

### 2026-11-18
- Wednesday: Marketing light + AEO deep. promos.ts unchanged since 9efd109: emlift-2611 runs to 30 Nov (4,500 ฿/area/session, course 18,000 ฿/area); no December promo defined yet.
- Today's slot Wed 18 Nov = referral reminder (Draft 10, A/B — doctor's pick, backlog 2b). Next slot Thu 19 Nov = EM Lift launch (Draft 20) — full TH caption in today's report.
- Done: Draft 22 for Wed 9 Dec (EN-first foreign-patient post) below — facts only from the site and README (English consultations doctor-confirmed 30 Oct, Messenger, closed Tuesdays, price confirmed before treatment, box opened, doctor injects). Not one of the 12 Expo-plan posts (those ended 22 Nov).
- No LINE broadcast tomorrow (Thu 19 Nov) unless the doctor sends set emlift-2611 alongside the launch post. No market watch (Mondays only).

#### Draft 22 — Wed 9 Dec · FB + IG feed (EN-first) · See the doctor in English
EN caption:
In Udon Thani for the Horticultural Expo? You can see an aesthetic doctor in English 🌿
How it works at Vinfinity Clinic:
1) Message us on Messenger (m.me/Vinfinity.Clinic) or LINE @vinfinityclinic with front and side photos in natural light.
2) The doctor tells you what may suit you — or if nothing is needed.
3) At the clinic: assessment first, the full cost is confirmed before treatment, and the product box is opened in front of you.
4) Every injection is done by Dr. Dechowat Promda (license 48943).
Open daily except Tuesdays · Udon Thani city · tel 082-462-2963
Results vary from person to person. All procedures carry possible side effects.

TH caption:
มาเที่ยวงานพืชสวนโลกที่อุดรฯ แล้วอยากปรึกษาเรื่องผิวหรือรูปหน้า? ปรึกษาคุณหมอเป็นภาษาอังกฤษได้ 🌿
ขั้นตอนที่ Vinfinity Clinic
1️⃣ ส่งรูปหน้าตรงและด้านข้าง (แสงธรรมชาติ) ทาง LINE @vinfinityclinic หรือ Messenger
2️⃣ คุณหมอแนะนำว่าอะไรอาจเหมาะ หรือยังไม่จำเป็นต้องทำ
3️⃣ ที่คลินิก: ประเมินก่อน แจ้งราคารวมก่อนเริ่มทุกครั้ง และเปิดกล่องผลิตภัณฑ์ให้ดูต่อหน้า
4️⃣ ฉีดโดย นพ.เดโชวัต พรมดา (ว.48943) ทุกเคส
เปิดทุกวัน ยกเว้นวันอังคาร · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

Hashtags: #UdonThani #VinfinityClinic #EnglishSpeakingDoctor #UdonThaniExpo #คลินิกอุดร #อุดรธานี #AestheticClinicThailand
Alt text: Reception area of Vinfinity Clinic in Udon Thani with the text "See an aesthetic doctor in English" / ห้องรับรองของ Vinfinity Clinic อุดรธานี พร้อมข้อความ "ปรึกษาคุณหมอเป็นภาษาอังกฤษได้".
Graphic brief: 1080×1350. Real photo assets/img/reception.jpg top 55%; dark navy gradient (#0B142E → #1A326B) below; silver #EEF2F8 headline "See the doctor in English"; 4 numbered steps in silver #D5DDEE; small chips "Messenger · LINE". No Expo logo (not our brand), no price, no before/after. Small text footer credit: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band.

### 2026-11-19
- Thursday: Marketing light + live-site check only. Production dpl_6z2ZbTw8bVwnQt1oTDm5ijWjEGwn (commit 99bd60b) READY; / (TH) and /en/price/ return 200 via Vercel fetch and render fully (title, canonical, hreflang, JSON-LD, footer with ฆสพ. + "closed Tuesdays"). Nothing broken. (Direct curl to vinfinityclinic.com is blocked by the sandbox proxy — use Vercel fetch.)
- promos.ts unchanged since 9efd109: emlift-2611 runs to 30 Nov 23:59; no December promo defined yet.
- Today's slot Thu 19 Nov = EM Lift launch (Draft 20). Next slot Fri 20 Nov = ligaments reel (Draft 11, ready) — its TH caption is in today's report. Then Sun 22 Nov Loy Krathong closed-day Story (Draft 13).
- Done: Draft 23 for Fri 11 Dec (evergreen carousel "same filler, different results") below — facts only from /articles/same-filler-different-results/ (Khan 2026 numbers as the article states them). No filler brand names, no promo price.
- No LINE broadcast tomorrow (Fri 20 Nov) unless the doctor decides to send set emlift-2611. No market watch (Mondays only).

#### Draft 23 — Fri 11 Dec · FB + IG carousel (5 slides, 1080×1350) · Same filler, different results
Slides: 1) "ฟิลเลอร์ยี่ห้อเดียวกับเพื่อน ทำไมผลไม่เหมือนกัน" · 2) "เจลแต่ละตัวมีนิสัยต่างกัน: ความแข็ง · ความเกาะตัว · การดูดน้ำ" · 3) "เนื้อเยื่อแต่ละคนต่างกัน: ผิวหนา-บาง กล้ามเนื้อ การขยับ" · 4) "ตำแหน่งเปลี่ยนผล: งานวิจัยปี 2026 ที่ 12 สัปดาห์ ปริมาตรที่วัดได้ ปากเหลือราว 10% แก้มราว 60%" · 5) "ที่ Vinfinity: เริ่มจากปัญหาและชั้น ไม่ใช่ยี่ห้อ · ใช้น้อย นัดดูผลราว 2 สัปดาห์"
TH caption:
ฟิลเลอร์ยี่ห้อเดียวกับเพื่อน ทำไมผลไม่เหมือนกัน? 🤔
เพื่อนฉีดแล้วอยู่นาน แต่เราฉีดยี่ห้อเดียวกันกลับยุบเร็ว หรือดูไม่เข้ากับหน้า คำตอบอยู่ที่ 4 เรื่อง

1️⃣ เจลแต่ละตัวมี “นิสัย” ต่างกัน — ความแข็ง ความเกาะตัว และการดูดน้ำ กำหนดว่าเจลจะยก กระจาย หรืออิ่มแค่ไหน
2️⃣ เนื้อเยื่อแต่ละคนต่างกัน — ผิวหนาหรือบาง กล้ามเนื้อแข็งแรง และการขยับของแต่ละบริเวณ กดและเปลี่ยนรูปเจลต่างกัน
3️⃣ ตำแหน่งเปลี่ยนผล — งานวิจัยปี 2026 พบว่าที่ 12 สัปดาห์ ปริมาตรที่วัดได้ที่ปากเหลือราว 10% ขณะที่แก้มเหลือราว 60% เพราะปากขยับตลอดทั้งพูด กิน ยิ้ม
4️⃣ ชั้นที่วางและวิธีฉีด — เจลเดียวกันวางคนละชั้น ให้รูปทรงและความเป็นธรรมชาติต่างกัน

ที่ Vinfinity คุณหมอเริ่มจากปัญหาและชั้นของหน้า ไม่ใช่เริ่มจากยี่ห้อ ใช้น้อย แล้วนัดดูผลหลังบวมยุบราว 2 สัปดาห์ก่อนตัดสินใจเติม
อ่านฉบับเต็มพร้อมเอกสารอ้างอิง: vinfinityclinic.com/articles/same-filler-different-results/

โดย นพ.เดโชวัต พรมดา (ว.48943) · 📍 Vinfinity Clinic อุดรธานี · คลินิกปิดทุกวันอังคาร
💬 ส่งรูปหน้าตรงและด้านข้างทาง LINE @vinfinityclinic ให้คุณหมอประเมินเบื้องต้น
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Same filler as your friend — so why a different result? Four reasons: 1) each gel behaves differently (firmness, cohesivity, how much water it draws); 2) everyone's tissue is different (skin thickness, muscle strength, how much the area moves); 3) the area matters — a 2026 study found that at 12 weeks the measured volume was about 10% in the lips versus about 60% in the cheeks; 4) the layer and technique change shape and how natural it looks. At Vinfinity the doctor starts from the problem and the layer, not the brand, uses a small amount and reviews after about 2 weeks. Full article with references: vinfinityclinic.com/en/articles/ · Dr. Dechowat Promda (license 48943) · consultations in English · closed Tuesdays. Results vary from person to person. All procedures carry possible side effects. LINE @vinfinityclinic · Messenger m.me/Vinfinity.Clinic

Hashtags: #ฟิลเลอร์ #ฟิลเลอร์อุดร #VinfinityClinic #TheFillerArchitect #คลินิกอุดร #อุดรธานี #DermalFiller #UdonThani
Alt text: กราฟิกเปรียบเทียบปริมาตรฟิลเลอร์ที่วัดได้ที่ปากและแก้มหลัง 12 สัปดาห์ พร้อมข้อความ "ฟิลเลอร์ยี่ห้อเดียวกัน ทำไมผลไม่เหมือนกัน" / Graphic comparing measured filler volume in the lips and cheeks at 12 weeks, with the text "Same filler, different results — why?".
Graphic brief: 5 slides 1080×1350. Slide 1: real clinic photo (assets/img/treatment.jpg) with dark navy gradient (#0B142E → #1A326B), silver #EEF2F8 headline. Slides 2–3: navy background, silver icon-free text lists. Slide 4: the article graphic assets/img/articles/filler-volume-retention-lips-vs-cheek.jpg on navy, caption "Khan et al. 2026 · ปริมาตรที่วัดจากภายนอก". Slide 5: doctor photo assets/img/dr-bas.jpg (not a galderma-* photo) + 2 lines. Small text footer credit on every slide: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no filler brand names or product boxes, no before/after, no price.


### 2026-11-20
- Friday: Marketing light + Branding deep. promos.ts unchanged since 9efd109: emlift-2611 runs to 30 Nov 23:59; no December promo defined yet. referral.ts: event 3 Nov – 15 Dec 23:59 (friend's first paid treatment must fall in the window).
- Today's slot Fri 20 Nov = ligaments reel (Draft 11). Next slot Sun 22 Nov = Loy Krathong closed-day Story (Draft 13) — full TH caption in today's report. Then Wed 25 Nov skincare carousel (Draft 14).
- Done: Draft 24 for Sun 13 Dec (referral last-call Story, A/B) below — facts only from referral.ts and Draft 10; 15 Dec is a Tuesday (clinic closed), so the post names Mon 14 Dec as the last open day. No "last chance"/countdown wording (brand book).
- No LINE broadcast tomorrow (Sat 21 Nov) unless the doctor decides to send set emlift-2611. No market watch (Mondays only).

#### Draft 24 — Sun 13 Dec · FB + IG Story (9:16, 2 frames) · Referral event "ชวนเพื่อนมาสวยด้วยกัน" ends Tue 15 Dec
Frame 1 text: "ชวนเพื่อนมาสวยด้วยกัน · ถึง 15 ธ.ค." / "เพื่อนใหม่: ปรึกษาฟรี + เครดิต 1,000.-" / "คนชวน: เครดิต 1,500.- ต่อเพื่อน"
Frame 2 text: "คลินิกเปิดวันสุดท้ายของกิจกรรม จันทร์ 14 ธ.ค. 10:00–19:00" / "อังคาร 15 ธ.ค. ปิดตามปกติ" / keyword chip "พิมพ์ “ชวนเพื่อน”" / link sticker → LINE @vinfinityclinic
TH caption (Version A — full terms):
กิจกรรม “ชวนเพื่อนมาสวยด้วยกัน” ถึงวันอังคารที่ 15 ธ.ค. นี้ 💙
คลินิกปิดทุกวันอังคาร วันสุดท้ายที่เปิดในช่วงกิจกรรมคือ วันจันทร์ที่ 14 ธ.ค. 10:00–19:00 น.

👭 เพื่อนใหม่: ปรึกษาและวิเคราะห์ผิวกับคุณหมอฟรี + เครดิต 1,000 บาท เมื่อทำหัตถการครั้งแรก 5,000 บาทขึ้นไป
🙋 คนชวน: เครดิต 1,500 บาท ต่อเพื่อน 1 คนที่มาทำครั้งแรกตามเงื่อนไข · ชวนสำเร็จครบ 3 คน รับ Vitaran 1 cc

แพทย์ประเมินก่อนทุกครั้ง ไม่จำเป็นต้องทำในวันที่มาปรึกษา
โดย นพ.เดโชวัต พรมดา (ว.48943) · 📍 Vinfinity Clinic อุดรธานี · 📞 082-462-2963
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

ทักไลน์ @vinfinityclinic พิมพ์ “ชวนเพื่อน” รับลิงก์ของคุณ

TH caption (Version B — no free-reward line in public posts): same as A, delete " · ชวนสำเร็จครบ 3 คน รับ Vitaran 1 cc".

EN caption:
Our "Bring a friend" event runs until Tuesday 15 Dec 💙 We're closed on Tuesdays, so the last open day in the event is Monday 14 Dec, 10:00–19:00. Your friend: free consultation and skin analysis with the doctor, plus a 1,000 THB credit on a first treatment of 5,000 THB or more. You: 1,500 THB credit for each friend who has a first treatment on these terms (Version A only: 3 friends → Vitaran 1 cc). The doctor assesses first; no treatment is needed on the consultation day. Dr. Dechowat Promda (license 48943) · consultations in English. Results vary from person to person. All procedures carry possible side effects. Message LINE @vinfinityclinic and type "ชวนเพื่อน" to get your personal link · Messenger m.me/Vinfinity.Clinic

Hashtags: #VinfinityClinic #ชวนเพื่อนมาสวยด้วยกัน #คลินิกอุดร #อุดรธานี #UdonThani
Alt text: ห้องรับรองโทนสีกรมท่าของ Vinfinity Clinic พร้อมข้อความ "ชวนเพื่อนมาสวยด้วยกัน ถึง 15 ธ.ค." / Vinfinity Clinic lounge in navy tones with the text "Bring a friend, until 15 Dec".
Graphic brief: 1080×1920, 2 frames. Frame 1: real photo assets/img/clinic-lounge.jpg top 50%, dark navy gradient (#0B142E → #1A326B) below; silver #EEF2F8 headline "ชวนเพื่อนมาสวยด้วยกัน · ถึง 15 ธ.ค."; two silver-outline chips for friend / inviter credits. Frame 2: real photo assets/img/reception.jpg, same gradient; opening-day line in silver #D5DDEE; LINE link sticker + keyword chip. Small text footer credit on both frames: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no countdown timer, no "โอกาสสุดท้าย"/"last chance", no stock models, no before/after, no lucky draw.

### 2026-11-22
- Sunday: Marketing light + live-site check only. Production dpl_EectUqcevsQDyRuBZoxHs6quouMm (commit 716eeed) READY; / (TH) and /en/price/ return 200 via Vercel fetch and render fully (title, canonical, hreflang, 4 JSON-LD blocks, footer with ฆสพ.อด.100/2568 + "closed Tuesdays"). Nothing broken. (No run is logged for Sat 21 Nov.)
- promos.ts unchanged since 9efd109: emlift-2611 runs to 30 Nov 23:59; no December promo defined yet (8 days left to add one).
- Today's slot Sun 22 Nov = Loy Krathong closed-day Story (Draft 13; clinic closed Tue 24 Nov). Next slot Wed 25 Nov = skincare carousel (Draft 14) — full TH caption in today's report. Then Fri 27 Nov clinic checklist (Draft 15), Sat 28 Nov EM Lift last call (Draft 21).
- Done: Draft 25 for Wed 16 Dec (evergreen carousel on filler dissolving) below — facts only from /articles/dissolve-filler-native-tissue/ (ACE guideline numbers as the article states them). No brand names, no enzyme units, no price, no before/after.
- No LINE broadcast tomorrow (Mon 23 Nov) unless the doctor decides to send set emlift-2611 before the Early Bird ends. Market watch is due tomorrow (Monday run).

#### Draft 25 — Wed 16 Dec · FB + IG carousel (5 slides, 1080×1350) · Filler dissolving and your own skin
Slides: 1) "สลายฟิลเลอร์แล้ว ผิวเดิมจะเสียไหม" · 2) "เอนไซม์ย่อยไฮยาลูรอนิกของผิวได้ชั่วคราว แต่ผิวสร้างใหม่ตลอด (ครึ่งชีวิตราว 24 ชม.)" · 3) "ทำไมบางคนดูโทรมลง: เห็นหน้าจริงที่ถูกบังไว้ · ผิวถูกยืดมานาน · สลายมากเกินจำเป็น" · 4) "บางเคสสลายยากกว่า บางเคสต้องทำมากกว่า 1 ครั้ง — บอกประวัติการฉีดให้หมอ" · 5) "ที่ Vinfinity: สลายเฉพาะจุด ทีละน้อย แล้วประเมินใหม่หลังราว 2 สัปดาห์"
TH caption:
สลายฟิลเลอร์แล้ว ผิวเดิมจะเสียไหม? 🤔
หลายคนอยากเอาฟิลเลอร์ออก แต่กลัวว่าเอนไซม์จะ “กินเนื้อตัวเอง” จนหน้าตอบ งานวิจัยบอกว่าอย่างนี้ค่ะ

1️⃣ เอนไซม์สลายฟิลเลอร์ (hyaluronidase) ย่อยไฮยาลูรอนิกที่ผิวสร้างเองได้ด้วย แต่เป็นแค่ชั่วคราว เพราะผิวสร้างใหม่ตลอดเวลา ครึ่งชีวิตราว 24 ชั่วโมง
2️⃣ ที่บางคนดูโทรมลงหลังสลาย ส่วนใหญ่ไม่ใช่เพราะเนื้อเยื่อถูกทำลาย แต่เพราะเห็นใบหน้าจริงที่ถูกฟิลเลอร์บังไว้ ผิวที่ถูกยืดมานาน หรือสลายมากเกินจุดที่มีปัญหา
3️⃣ ฟิลเลอร์แต่ละชนิดสลายง่ายยากต่างกัน บางเคสต้องทำมากกว่าหนึ่งครั้ง การบอกประวัติการฉีดให้แพทย์ช่วยให้วางแผนได้แม่นขึ้น
4️⃣ แพ้เอนไซม์ได้แต่พบน้อย ควรแจ้งประวัติแพ้ยา แพ้ผึ้งหรือแตนต่อยให้แพทย์ทราบ

ที่ Vinfinity คุณหมอซักประวัติการฉีดทั้งหมด อธิบายผลที่คาดได้ก่อนทำ สลายเฉพาะจุดทีละน้อย แล้วรอราว 2 สัปดาห์ก่อนประเมินใหม่ บางคนพบว่าไม่ต้องเติมอีกเลย
อ่านฉบับเต็มพร้อมเอกสารอ้างอิง: vinfinityclinic.com/articles/dissolve-filler-native-tissue/

โดย นพ.เดโชวัต พรมดา (ว.48943) · 📍 Vinfinity Clinic อุดรธานี · คลินิกปิดทุกวันอังคาร
💬 ส่งรูปหน้าตรง ด้านข้าง และประวัติการฉีดเท่าที่จำได้ ทาง LINE @vinfinityclinic ให้คุณหมอดูก่อนว่าควรสลายตรงไหน หรือยังไม่จำเป็น
หลังฉีดฟิลเลอร์ ถ้าปวดมาก ผิวซีดหรือคล้ำเป็นแถบ ต้องพบแพทย์ทันที
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
Dissolving filler — will it damage your own skin? The enzyme (hyaluronidase) can break down the skin's own hyaluronic acid too, but only for a while: the skin keeps making it, with a half-life of about 24 hours. When people look more tired after dissolving, it is usually because they now see the face the filler was hiding, skin that was stretched for a long time, or more dissolving than needed — not destroyed tissue. Some fillers break down more slowly and may need more than one session, so tell the doctor what you had injected. Allergy is possible but uncommon. At Vinfinity the doctor dissolves only where needed, a little at a time, and reassesses after about 2 weeks. Full article (Thai, with references): vinfinityclinic.com/articles/dissolve-filler-native-tissue/ · Dr. Dechowat Promda (license 48943) · consultations in English · closed Tuesdays. Results vary from person to person. All procedures carry possible side effects. LINE @vinfinityclinic · Messenger m.me/Vinfinity.Clinic

Hashtags: #สลายฟิลเลอร์ #แก้ฟิลเลอร์ #ฟิลเลอร์อุดร #VinfinityClinic #TheFillerArchitect #คลินิกอุดร #อุดรธานี #FillerDissolving #UdonThani
Alt text: แผนภาพแสดงฟิลเลอร์ถูกเอนไซม์สลาย ขณะที่ไฮยาลูรอนิกของผิวสร้างกลับมาใหม่ พร้อมข้อความ "สลายฟิลเลอร์แล้ว ผิวเดิมจะเสียไหม" / Diagram of filler being broken down by the enzyme while the skin's own hyaluronic acid is rebuilt, with the text "Dissolving filler — will it damage your own skin?".
Graphic brief: 5 slides 1080×1350. Slide 1: real clinic photo (assets/img/treatment.jpg) with dark navy gradient (#0B142E → #1A326B), silver #EEF2F8 headline. Slide 2: the article graphic assets/img/articles/hyaluronidase-native-ha-recovery.jpg on navy. Slides 3–4: navy background, silver #D5DDEE text lists. Slide 5: doctor photo assets/img/dr-bas.jpg (not a galderma-* photo) + 2 lines + LINE chip. Small text footer credit on every slide: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no filler or enzyme brand names, no unit numbers, no before/after, no price.


### 2026-11-23
- Monday: Marketing light + SEO deep + market watch. promos.ts unchanged since 9efd109: emlift-2611 runs to 30 Nov 23:59; still no December promo defined (7 days left — doctor to decide). referral.ts event to 15 Dec.
- No calendar slot today. Next slot Wed 25 Nov = skincare carousel (Draft 14, ready) — full TH caption in today's report. Then Fri 27 Nov clinic checklist (Draft 15), Sat 28 Nov EM Lift last call (Draft 21), Sun 29 Nov Vitaran (Draft 16).
- Done: Draft 26 for Fri 18 Dec (myth-vs-evidence carousel "ฉีดยกเอ็น ได้ผลจริงไหม") below — facts only from /articles/ligament-lift-injection/ (2023 ASJ animal study, 1 human case report). No brand names, no price, no before/after, no result claims.
- Market watch (web search, 1 query "คลินิกความงาม อุดรธานี โปรโมชั่น ธันวาคม"): only aggregators (HDmall, Gowabi listings for B.Mee Clinic Udon and The V-Sage Clinic Udon) and LINE pages of an unrelated filler brand; no Udon clinic December promo visible — not verified. Gowabi = booking marketplace where local competitors list; consider a listing (backlog 8, human decision).
- No LINE broadcast tomorrow (Tue 24 Nov = Loy Krathong, clinic closed).

#### Draft 26 — Fri 18 Dec · FB + IG carousel (5 slides, 1080×1350) · "ฉีดยกเอ็น" — myth vs evidence
Slides: 1) "ฉีดยกเอ็น ได้ผลจริงไหม" · 2) "เอ็นยึดใบหน้าเหมือนตะขอแขวนผ้าม่าน — สิ่งที่หย่อนคือผ้าระหว่างตะขอ" · 3) "งานวิจัยปี 2023: เอ็นไม่ได้หลวมตามอายุ แต่แข็งขึ้น (ศึกษาในสัตว์ทดลอง)" · 4) "ฉีดเพื่อกระชับเอ็น: หลักฐานในคนยังมีแค่รายงาน 1 ราย · สิ่งที่สมเหตุสมผลกว่า = เติมฐานรองรับชั้นลึก" · 5) "3 คำถามก่อนฉีด" + LINE chip
TH caption:
“ฉีดยกเอ็น” ได้ผลจริงไหม? 🤔
หลายคนเคยได้ยินว่าหน้าย้อยเพราะเอ็นหย่อน ต้องฉีดเข้าไปให้เอ็นกระชับ งานวิจัยใหม่ทำให้ต้องคิดเรื่องนี้ใหม่ค่ะ

1️⃣ เอ็นยึดใบหน้าเหมือนตะขอที่แขวนผ้าม่านไว้กับกระดูก สิ่งที่หย่อนตามวัยคือ “ผ้า” ระหว่างตะขอ ได้แก่ไขมันและผิว
2️⃣ งานวิจัยปี 2023 (Aesthetic Surgery Journal) พบว่าเอ็นไม่ได้หลวมขึ้นตามอายุ แต่กลับแข็งขึ้น — งานนี้ทำในสัตว์ทดลอง และศึกษาเอ็นโหนกแก้มเป็นหลัก
3️⃣ หลักฐานในคนเรื่องฉีดให้เอ็นหนาขึ้น ตอนนี้ยังเป็นแค่รายงานผู้ป่วย 1 ราย และยังไม่มีงานที่วัดชัดว่าหน้ายกขึ้นในระยะยาว
4️⃣ สิ่งที่ยังสมเหตุสมผลคือ เติมฐานรองรับในชั้นลึกตามจุดที่ยุบ โดยใช้แนวเอ็นเป็นจุดอ้างอิง — ไม่ต้องดึงตะขอ แต่เติมฐานให้ผ้ามีที่วาง

ก่อนฉีด ลองถามแพทย์ 3 ข้อ: หน้าย้อยของเราเกิดจากชั้นไหน · จะฉีดชั้นไหน เพื่ออะไร · ตรงนั้นมีหลอดเลือดสำคัญใกล้ไหม ป้องกันอย่างไร
อ่านฉบับเต็มพร้อมเอกสารอ้างอิง: vinfinityclinic.com/articles/ligament-lift-injection/

เรียบเรียงโดย นพ.เดโชวัต พรมดา (ว.48943) · 📍 Vinfinity Clinic อุดรธานี · คลินิกปิดทุกวันอังคาร
💬 ส่งรูปหน้าตรงและด้านข้างทาง LINE @vinfinityclinic ให้คุณหมอช่วยดูว่าชั้นไหนเปลี่ยนไป ก่อนวางแผน
ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล · การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

EN caption:
"Ligament lift" injections — do they work? Think of facial ligaments as hooks holding a curtain to the bone: what sags with age is the curtain between the hooks (fat and skin). A 2023 study in Aesthetic Surgery Journal found that ligaments don't loosen with age — they stiffen (an animal study, mainly the cheekbone ligament). Human evidence for injecting to "tighten" ligaments is so far a single case report. What still makes sense is rebuilding deep support where tissue has thinned, using the ligament lines as landmarks. Ask your doctor: which layer has changed, which layer will be injected and why, and how major blood vessels nearby are protected. Full article with references (Thai/English): vinfinityclinic.com/en/articles/ligament-lift-injection/ · Dr. Dechowat Promda (license 48943) · consultations in English via LINE @vinfinityclinic or Messenger m.me/Vinfinity.Clinic. Results vary from person to person. All procedures carry possible side effects.

Hashtags: #ฉีดยกเอ็น #หน้าย้อย #ฟิลเลอร์อุดร #VinfinityClinic #TheFillerArchitect #คลินิกอุดร #อุดรธานี #FacialAnatomy #UdonThani
Alt text: ภาพเปรียบเทียบการฉีดเพื่อกระชับเอ็นยึดใบหน้า กับการเติมฐานรองรับชั้นลึกระหว่างเอ็น พร้อมข้อความ "ฉีดยกเอ็น ได้ผลจริงไหม" / Diagram comparing injecting to tighten facial ligaments with rebuilding deep support between them, with the text "Ligament lift injections — do they work?".
Graphic brief: 5 slides 1080×1350. Slide 1: real clinic photo (assets/img/treatment.jpg) with dark navy gradient (#0B142E → #1A326B), silver #EEF2F8 headline. Slide 2: article graphic assets/img/articles/ligament-lift-injection-support.jpg on navy (hook-and-curtain idea). Slides 3–4: navy background, silver #D5DDEE text, small "ศึกษาในสัตว์ทดลอง" / "รายงาน 1 ราย" labels so the evidence level is clear. Slide 5: doctor photo assets/img/dr-bas.jpg (not a galderma-* photo) + 3 questions + LINE chip. Small text footer credit on every slide: "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943 · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". No white logo band, no product brand names, no before/after.
