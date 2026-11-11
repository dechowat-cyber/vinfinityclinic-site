# marketing agent

Plans and prepares organic posts only (FB / IG / TikTok / LINE). Never posts, never sends broadcasts, never touches ads.
Graphic style for every brief: real photo + dark navy gradient (#0B142E → #1A326B) + small text footer credit "Vinfinity Clinic · LINE @vinfinityclinic · ว.48943". No white logo band.
Current promotion: Vitaran (PN skin booster) — 1 box 9,990 ฿ · 4+ boxes 8,990 ฿/box · 2 cc/box (matches /price/).
Promotion 1–15 Nov 2026 (doctor approved 2026-10-31): Sculptra 15,990 ฿/vial (regular 24,995), only 10 places, max 2 vials/person, not combined with other promos/packages; place is held 48 h until the person books. Defined in line-app/lib/promos.ts (key sculptra-2611). Every post about it should end with the call to action "ทักไลน์ @vinfinityclinic พิมพ์ “โปรเดือนนี้” หรือกดเมนู 🎁 โปรเดือนนี้" — the bot answers that for free and shows the live seat counter. HArmonyCa Early Bird ended 31 Oct.
LINE broadcast plan (doctor upgraded the LINE OA plan on 2 Nov, quota no longer the limit): Mon 2 Nov 12:00 — Sculptra text + claim card to all friends (media set "Sculptra 15,990 · ข้อความ + การ์ดกดรับสิทธิ์"). UPDATE 2 Nov 23:47 (doctor): two broadcasts sent, 8 of 10 places taken on day 1. Round 2 moved to Wed 4 Nov ~12:30 (after the 48 h holds from Monday expire, so the live number is true) — only if places are left. Once 10 are taken: no more Sculptra posts at 15,990; collect a waitlist for a later batch. (was: Fri 6 Nov ~12:00 — round 2 "เหลืออีก X สิทธิ์" (media set "Sculptra รอบ 2", the number is filled in live; the system refuses if all 10 are taken). Not on Tuesdays (clinic closed). In the daily report, remind the doctor of the next broadcast slot the day before.

Foreign-patient plan for the Udon Thani Horticultural Expo (1 Nov 2026 – 14 Mar 2027), doctor approved 3 Nov: 12 posts EN + Lao, 4–22 Nov (EN Wed/Sat/Mon/Thu/Mon/Fri, Lao Thu/Sun/Wed/Sat/Wed/Sun), drafts in the doctor's doc "Vinfinity · ชุดคอนเทนต์ต่างชาติช่วงพืชสวนโลก (EN + ລາວ)". EN posts close with Messenger m.me/Vinfinity.Clinic (+ LINE); Lao with Messenger (+ WhatsApp once the clinic gives a number). English pages now show a "Not on LINE? Message us in English" strip. In the daily report, name the next foreign post due and its Thai/English caption status; do not re-draft these 12.

Referral event "ชวนเพื่อนมาสวยด้วยกัน" 3 Nov – 15 Dec 2026 (doctor moved the start to 3 Nov): new friend gets a free consultation + 1,000 THB credit on a first treatment of 5,000+; the inviter gets 1,500 THB credit per such friend; 3 such friends → Vitaran 1 cc free (staff hand it out). Defined in line-app/lib/referral.ts. Call to action for posts: "ทักไลน์ @vinfinityclinic พิมพ์ “ชวนเพื่อน” รับลิงก์ของคุณ". Launch broadcast: Tue 3 Nov 12:00 (doctor decided), media set "ชวนเพื่อนมาสวยด้วยกัน", leaving out the Sculptra seat holders; while Sculptra has places left, invite cards and friend welcomes carry its last places (not on Tuesdays). No lucky draws; check wording against medical-advertising rules before public posts.

## Backlog (top = next)
1. Get LINE OA follower count + segment sizes (past skin-booster / filler patients) from LINE OA Manager — broadcast sizes are "not verified" until then. (Ask doctor/team.)
2. Draft slot Sun 29 Nov Vitaran cool-season (Fri 27 Nov done, Draft 15) — check promos.ts for any promo after 15 Nov first. Then roll the calendar to 30 Nov – 13 Dec (~22 Nov at the latest; referral event ends 15 Dec).
2b. Doctor to confirm: may a public feed post name the referral credits and the "3 friends → Vitaran 1 cc" reward under the clinic's advertising approval (ฆสพ.)? Draft 10 has a version without the reward line — not verified.
3. Sculptra promo reminder post ~Mon 9 / Thu 12 Nov only if places remain (team checks the LINE seat counter) — never claim "almost gone" unless verified.
4. Loy Krathong 2026 = Tue 24 Nov (verified 2026-11-02, PPTV: "วันอังคารที่ 24 พฤศจิกายน"; clinic closed that day). Draft "เตรียมผิวก่อนลอยกระทง" for Sun 15 Nov + a reminder slot Sun 22 / Mon 23 Nov in the next calendar.
4b. Sculptra waitlist post only if the doctor opens a waitlist (no 15,990 price after 15 Nov or after 10 places). Calendar now runs to 29 Nov; roll again ~22 Nov.
5. Map menu images (assets/img/menu/th-01…16, en-, lo-) to treatments so calendar can point to exact files.
6. Short-form video scripts (TikTok/Reels 20–30 s) from existing articles: PN HMW vs LMW (ligaments done, Draft 11).
7. Lao-language caption variant for Vientiane audience (site has lo menu images).
8. Market watch: Udon Thani-local competitor promos (FB pages) — web search surfaced none on 2026-10-30 and 2026-10-31; needs a human to check FB pages or a different source.

## 2-week content calendar (1 – 29 Nov 2026)
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
| Fri 20 Nov | TikTok / Reels | Ligaments & aging — why the face "drops" (backlog 6, 25 s script) — DRAFT READY (Draft 11) | "หน้าย้อย เพราะเอ็นหลวมจริงไหม" | /articles/facial-ligaments-aging + LINE | articles/facial-ligaments-aging-anchor.jpg |
| Sun 22 Nov | FB + IG Story | Loy Krathong reminder: clinic closed Tue 24 Nov; book Mon 23 / Wed 25 — DRAFT READY (Draft 13, no discount invented) | "ลอยกระทงอังคารนี้ คลินิกปิด 1 วัน" | LINE จองคิว | facade.jpg |
| Wed 25 Nov | FB + IG carousel | Skincare before/after injections (what to pause, what to keep) — DRAFT READY (Draft 14) | "ฉีดฟิลเลอร์แล้ว ทาเรตินอลได้เมื่อไหร่" | /articles/skincare-routine-filler-botox | articles/skincare-before-after-injection.jpg |
| Fri 27 Nov | IG + FB | Choosing a filler clinic in Udon Thani — checklist (license check ว.48943 on the Medical Council site) — DRAFT READY (Draft 15) | "ก่อนเลือกคลินิก เช็ก 5 ข้อนี้" | /articles/choosing-filler-clinic-udon | articles/filler-clinic-udon-checklist.jpg |
| Sun 29 Nov | FB + IG | Vitaran PN cool-season skin (prices from /price/: 9,990 · 4+ boxes 8,990/box) — TO DRAFT | "ลมหนาวมา ผิวแห้งง่าย" | LINE ประเมินผิว | treatment.jpg |

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
- New Doublo 2.0 ไม่จำกัดช็อต + Vitaran 1 cc = 11,111 THB. 11 places, 1 per person, claim on 11 Nov only (LINE keyword "11.11" → card → กดรับสิทธิ์), book within 48 h, visit by 30 Nov, not combined with other promos. Defined in line-app/lib/promos.ts (key 1111-2611); broadcast set 1111-2611-card.
- Replaces Draft 7 (11.11 Story) for today. Do not quote 11,111 after 11 Nov.
