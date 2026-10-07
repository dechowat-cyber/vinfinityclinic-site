# vinfinityclinic.com — static site

- แก้เนื้อหาใน `pages/*.html` แล้วรัน `python3 build.py` เพื่อสร้าง `index.html`, `filler/`, `skin-booster/`
- header/footer, SEO meta, Open Graph และ JSON-LD (MedicalClinic, Physician, FAQPage) อยู่ใน `build.py`
- CI: navy #041738 · silver #C9CED6 · mist #E6E9EE · pearl #F4F6F9 · ฟอนต์ Anuphan + Cormorant Garamond (self-host ใน `assets/fonts`)
- Deploy: Vercel แบบ static ไม่ต้อง build — `vercel --prod` จากโฟลเดอร์นี้ แล้วผูกโดเมน vinfinityclinic.com และ www

## ต้องเติมก่อนขึ้นจริง (ค้นหา `[` ในไฟล์ pages/ และ build.py)
- ราคาเริ่มต้น Doublo 2.0 / ฟิลเลอร์ต่อ cc / สกินบูสเตอร์
- ที่อยู่ เวลาทำการ ลิงก์ Google Maps เลขใบอนุญาตสถานพยาบาล
- ยืนยันข้อความ: เปิดกล่องตรวจสอบต่อหน้า, สแกนหน้า 3D, ฆสพ. ครอบคลุมเนื้อหาเว็บไซต์

## Before / After (branch `before-after`)
- Source: tools/make_results.py → pages/_results_eye.html, pages/_results_layers.html. Edit the cases, captions and layer tags there, then run `python3 tools/make_results.py && python3 build.py`.
- Layer tags per case are a draft — the treating doctor must confirm them.
- Before going to main: get ฆสพ. approval for the before/after content, and confirm written consent from every patient shown.
- Alignment: `tools/align_ba.py SRC OUT` registers each AFTER photo onto its BEFORE photo (scale, position, tilt only — no retouching) and crops both to the same 450x574 frame. Needs `opencv-python-headless<5`.
## Local SEO / AI search (branch `seo`)
- NAP constants live at the top of build.py (address, hours, Google place id). Keep them identical to Google Business Profile and Facebook.
- New pages: /filler/tear-trough/ and /articles/choosing-filler-clinic-udon/. robots.txt allows search and AI crawlers; llms.txt summarises the clinic for AI assistants.
- Reviews: the site links to Google and Facebook reviews. To show quotes, add them to REVIEWS in build.py only with the reviewer's consent and after ฆสพ. approval.

## GEO / AI search (Phase 1)
- **Single source of truth:** `site_data.py` holds clinic, locations, doctor and procedure facts. `build.py` reads it for header/footer NAP, JSON-LD, `sitemap.xml`, `llms.txt` and `llms-full.txt` (all generated — do not hand-edit them). A location with `ready: False` (Vientiane, until its data is filled) is kept out of every public output.
- **JSON-LD:** every page carries one `@graph` (WebSite `/#website`, Organization `/#org`, MedicalClinic `/#udon`, Physician+Person `/#dr-dechowat`); non-home pages add BreadcrumbList; treatment pages add MedicalWebPage → MedicalProcedure (`…#procedure`, provider `/#udon`, Offer only where the price is already published); articles are MedicalWebPage+Article with author/reviewedBy. No Review/AggregateRating markup.
- **FAQ:** general questions are marked up once, on `/faq/` (and `/en/faq/`); each treatment page marks up its own questions. Starter questions from the brief are in `faq_drafts.py` and are **not** published until answers are approved.
- **Checks:** `python3 build.py && python3 tools/check_seo.py` — titles ≤60, descriptions ≤155, one h1, lang, self-canonical, no noindex, JSON-LD parses and every `@id` reference resolves, no duplicate FAQ markup, hreflang reciprocal, sitemap/robots/llms coverage. `build.py` refuses to build an over-length title or description.
