#!/usr/bin/env python3
"""Builds the static Vinfinity site: python3 build.py  ->  writes index.html, filler/, skin-booster/.
Shared header/footer live here; page bodies live in pages/*.html."""
import json, pathlib

ROOT = pathlib.Path(__file__).parent
SITE = "https://vinfinityclinic.com"
# CDP: the staff/LINE app that records web visits (/r/web) — see assets/track.js
LINE_APP = "https://vinfinity-line.vercel.app"
# Ad pixels: fill the IDs to switch them on. They load only after the visitor accepts the cookie banner.
GA4_ID = ""        # G-XXXXXXXXXX
META_PIXEL_ID = ""  # 15-16 digits
TIKTOK_PIXEL_ID = ""
from urllib.parse import quote as _q
# FR-01: every LINE button opens the chat with a pre-filled message carrying the source tag,
# which the LINE app (line-app/lib/source.ts) reads and stamps on the lead.
LINE = "https://line.me/R/oaMessage/%40230eeqvl/?" + _q("สวัสดีค่ะ สนใจปรึกษาคุณหมอ (จากเว็บไซต์)")
LINE_EN = "https://line.me/R/oaMessage/%40230eeqvl/?" + _q("Hello, I'd like to consult the doctor (from website)")
MSG = "https://m.me/Vinfinity.Clinic"
TEL = "082-462-2963"
# NAP — keep identical everywhere (site, Google Business Profile, Facebook)
ADDR_STREET = "106/27-28 อาคารธนารักษ์"
ADDR_LINE = "106/27-28 อาคารธนารักษ์ ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000"
HOURS_TEXT = "เปิดทุกวัน 10:00–19:00 น. (ปิดวันอังคาร)"
import i18n_en as EN
ADDR_EN = EN.ADDR_EN
HOURS_EN = EN.HOURS_EN
GEO = (17.4037305, 102.7894748)
PLACE_ID = "ChIJ2z9FVIedIzERYDruDs_3xeU"
MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Vinfinity+Clinic+%E0%B8%AD%E0%B8%B8%E0%B8%94%E0%B8%A3%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%B5&query_place_id=" + PLACE_ID
G_REVIEWS = "https://search.google.com/local/reviews?placeid=" + PLACE_ID
G_WRITE = "https://search.google.com/local/writereview?placeid=" + PLACE_ID
FB_REVIEWS = "https://www.facebook.com/Vinfinity.Clinic/reviews"
MAP_EMBED = "https://maps.google.com/maps?q=Vinfinity%20Clinic%20%E0%B8%AD%E0%B8%B8%E0%B8%94%E0%B8%A3%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%B5&ll=17.4037305,102.7894748&z=16&hl=th&output=embed"

LOGO = ('<svg width="34" height="34" viewBox="0 0 46 46" fill="none" stroke="#C9CED6" stroke-width="2.2" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7 L23 39 L40 7"/>'
        '<path d="M14 7 L23 25 L32 7"/></svg>')

CLINIC_LD = {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "MedicalBusiness"],
    "@id": SITE + "/#clinic",
    "name": "Vinfinity Clinic อุดรธานี",
    "alternateName": "วินฟินิตี้ คลินิกเวชกรรม",
    "slogan": "Infinite Beauty, Precisely",
    "url": SITE + "/",
    "image": SITE + "/assets/img/clinic-lounge.jpg",
    "logo": SITE + "/assets/vinfinity-logo-stacked.png",
    "telephone": "+66824622963",
    "priceRange": "฿฿฿",
    "medicalSpecialty": "Dermatology",
    "description": "คลินิกเวชกรรมด้านความงามในตัวเมืองอุดรธานี ให้บริการฟิลเลอร์ สกินบูสเตอร์ และยกกระชับ โดยแพทย์ประเมินและทำหัตถการเองทุกเคส",
    "address": {"@type": "PostalAddress", "streetAddress": ADDR_STREET, "addressLocality": "ตำบลหมากแข้ง อำเภอเมืองอุดรธานี",
                "addressRegion": "อุดรธานี", "postalCode": "41000", "addressCountry": "TH"},
    "geo": {"@type": "GeoCoordinates", "latitude": GEO[0], "longitude": GEO[1]},
    "hasMap": MAPS_URL,
    "openingHoursSpecification": [{"@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00", "closes": "19:00"}],
    "currenciesAccepted": "THB",
    "availableService": [
        {"@type": "MedicalProcedure", "name": "ฉีดฟิลเลอร์ (Hyaluronic acid filler)", "url": SITE + "/filler/"},
        {"@type": "MedicalProcedure", "name": "ฟิลเลอร์ใต้ตา (Tear trough filler)", "url": SITE + "/filler/tear-trough/"},
        {"@type": "MedicalProcedure", "name": "ฟิลเลอร์ปาก (Lip filler)", "url": SITE + "/filler/lips/"},
        {"@type": "MedicalProcedure", "name": "ฟิลเลอร์คาง (Chin filler)", "url": SITE + "/filler/chin/"},
        {"@type": "MedicalProcedure", "name": "Sculptra กระตุ้นคอลลาเจน", "url": SITE + "/sculptra/"},
        {"@type": "MedicalProcedure", "name": "โบทูลินัมท็อกซิน (Botulinum toxin)", "url": SITE + "/toxin/"},
        {"@type": "MedicalProcedure", "name": "สกินบูสเตอร์ (Skin booster)", "url": SITE + "/skin-booster/"},
        {"@type": "MedicalProcedure", "name": "สลายฟิลเลอร์ แก้ฟิลเลอร์ (Filler correction)", "url": SITE + "/filler/dissolve/"},
        {"@type": "MedicalProcedure", "name": "ยกกระชับด้วยอัลตราซาวด์ HIFU (New Doublo 2.0)", "url": SITE + "/lifting/"}],
    "knowsAbout": ["ฟิลเลอร์", "ฟิลเลอร์ใต้ตา", "ฟิลเลอร์ปาก", "ฟิลเลอร์คาง", "ฟิลเลอร์ขมับ", "ฟิลเลอร์ร่องแก้ม", "สลายฟิลเลอร์", "ยกกระชับ HIFU", "dermal filler Udon Thani", "สกินบูสเตอร์", "กายวิภาคใบหน้า", "facial anatomy", "hyaluronic acid filler"],
    "areaServed": [{"@type": "City", "name": n} for n in ["อุดรธานี", "หนองคาย", "หนองบัวลำภู", "สกลนคร", "ขอนแก่น", "เลย", "เวียงจันทน์"]],
    "sameAs": ["https://www.facebook.com/Vinfinity.Clinic", "https://www.instagram.com/vinfinityclinic/", MAPS_URL],
    "founder": {"@id": SITE + "/#dr-dechowat"},
}
DOCTOR_LD = {
    "@context": "https://schema.org", "@type": "Physician", "@id": SITE + "/#dr-dechowat",
    "name": "นพ.เดโชวัต พรมดา", "alternateName": "Dechowat Promda, M.D.",
    "description": "แพทย์ผู้ก่อตั้ง Vinfinity Clinic ผู้ออกแบบแนวคิด The Filler Architect",
    "image": SITE + "/assets/img/dr-bas.jpg",
    "alumniOf": [{"@type": "CollegeOrUniversity", "name": "มหาวิทยาลัยขอนแก่น"},
                 {"@type": "CollegeOrUniversity", "name": "National University of Singapore"}],
    "worksFor": {"@id": SITE + "/#clinic"},
    "url": SITE + "/doctor/",
    "medicalSpecialty": "Dermatology",
    "knowsAbout": ["Aesthetic medicine", "Dermal filler", "Facial anatomy", "Digital health", "Health data interoperability", "AI in healthcare"],
    "award": ["Galderma Thailand — Best Result on Difficult Case (2021)",
              "ODESS Global South E-Health Observatory — Winner (2024)",
              "ASEAN Digital Awards, Public Sector — Silver (2024)",
              "MEDICA — World's Top 12 Medical Start-ups (2023)",
              "APICTA — Winner, Cross Category: Start-up (2022)",
              "TICTA — 1st Runner-up, Cross Category: Blockchain (2022)"],
    "sameAs": ["https://youtu.be/94WBbooeqhc"],
}


def faq_ld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}


def crumb_ld(*trail, lang="th"):
    """trail: (name, path) pairs after the home page."""
    items = [("Home", "/en/") if lang == "en" else ("หน้าแรก", "/")] + list(trail)
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u}
                                for i, (n, u) in enumerate(items)]}


# Curated reviews shown on the site. Add only reviews the reviewer agreed to share,
# copied word-for-word, and approved together with the website advertising (ฆสพ.).
# Prefer service experience (care, explanation, cleanliness) over claims about results.
# (text, first name or initial, source: "Google" | "Facebook")
REVIEWS = []


def reviews_html(lang="th"):
    if lang == "en":
        return reviews_html_en()
    quotes = "".join(
        f'<figure class="rv"><blockquote>“{t}”</blockquote><figcaption>{n} · รีวิวบน {src}</figcaption></figure>'
        for t, n, src in REVIEWS)
    quotes = f'<div class="rv-grid">{quotes}</div>' if quotes else ""
    return f"""<section class="reviews" id="reviews">
<div class="wrap">
<div class="results-head">
<div>
<div class="eyebrow">Reviews</div>
<h2 class="h2">รีวิวจากผู้รับบริการจริง</h2>
</div>
<p class="lead">อ่านรีวิวทั้งหมดได้โดยตรงบน Google Maps และ Facebook ของคลินิก ทุกรีวิวเขียนโดยผู้รับบริการเอง</p>
</div>
{quotes}
<div class="rv-sources">
<a class="rv-src" href="{G_REVIEWS}" target="_blank" rel="noopener"><span class="rv-logo" aria-hidden="true">G</span><span><b>รีวิวบน Google Maps</b><small>Vinfinity Clinic อุดรธานี</small></span><span class="rv-go">อ่านรีวิว →</span></a>
<a class="rv-src" href="{FB_REVIEWS}" target="_blank" rel="noopener"><span class="rv-logo fb" aria-hidden="true">f</span><span><b>รีวิวบน Facebook</b><small>facebook.com/Vinfinity.Clinic</small></span><span class="rv-go">อ่านรีวิว →</span></a>
</div>
<p class="rv-write">เคยมารับบริการแล้ว? <a href="{G_WRITE}" target="_blank" rel="noopener">เขียนรีวิวบน Google</a> ความเห็นของคุณช่วยให้คนอื่นตัดสินใจได้ง่ายขึ้น</p>
</div>
</section>"""


def clinic_info_html(lang="th"):
    if lang == "en":
        return f"""<div><small>Address</small><b>{ADDR_EN}</b></div>
<div><small>Opening hours</small><b>{HOURS_EN}</b></div>
<div><small>Phone</small><a href="tel:+66{TEL.replace('-', '')[1:]}"><b>+66 {TEL[1:]}</b></a></div>
<div><small>LINE</small><a href="{LINE_EN}"><b>@230eeqvl</b></a></div>
<a class="btn btn-navy" style="margin-top:auto" href="{MAPS_URL}" target="_blank" rel="noopener">Open in Google Maps</a>"""
    return f"""<div><small>ที่อยู่</small><b>{ADDR_LINE}</b></div>
<div><small>เวลาทำการ</small><b>{HOURS_TEXT}</b></div>
<div><small>โทร</small><a href="tel:{TEL.replace('-', '')}"><b>{TEL}</b></a></div>
<div><small>LINE</small><a href="{LINE}"><b>@230eeqvl</b></a></div>
<a class="btn btn-navy" style="margin-top:auto" href="{MAPS_URL}" target="_blank" rel="noopener">เปิดแผนที่ Google Maps</a>"""


def map_html(lang="th"):
    return f'<div class="map-embed"><iframe src="{MAP_EMBED}" title="{"Map of Vinfinity Clinic Udon Thani" if lang == "en" else "แผนที่ Vinfinity Clinic อุดรธานี"}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>'


def reviews_html_en():
    return f"""<section class="reviews" id="reviews">
<div class="wrap">
<div class="results-head">
<div>
<div class="eyebrow">Reviews</div>
<h2 class="h2">Reviews from real patients</h2>
</div>
<p class="lead">Read every review directly on the clinic's Google Maps and Facebook pages. Each one is written by the patient.</p>
</div>
<div class="rv-sources">
<a class="rv-src" href="{G_REVIEWS}" target="_blank" rel="noopener"><span class="rv-logo" aria-hidden="true">G</span><span><b>Google Maps reviews</b><small>Vinfinity Clinic Udon Thani</small></span><span class="rv-go">Read →</span></a>
<a class="rv-src" href="{FB_REVIEWS}" target="_blank" rel="noopener"><span class="rv-logo fb" aria-hidden="true">f</span><span><b>Facebook reviews</b><small>facebook.com/Vinfinity.Clinic</small></span><span class="rv-go">Read →</span></a>
</div>
<p class="rv-write">Been to the clinic? <a href="{G_WRITE}" target="_blank" rel="noopener">Write a Google review</a>. Your feedback helps other people decide.</p>
</div>
</section>"""


def en_path(path):
    """Thai URL path -> English counterpart."""
    return "/en" + path


def th_path(path):
    return path[3:] if path.startswith("/en/") else path


def faq_html(items):
    return "\n".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items)


def hreflang(path):
    t = th_path(path)
    if t not in EN.EN_PAGES:
        return ""
    return (f'\n<link rel="alternate" hreflang="th" href="{SITE}{t}">'
            f'\n<link rel="alternate" hreflang="en" href="{SITE}{en_path(t)}">'
            f'\n<link rel="alternate" hreflang="x-default" href="{SITE}{t}">')


PAGE_IMG = {
    "/articles/pn-molecular-weight/": "/assets/img/articles/pn-hmw-lmw-polynucleotide.jpg",
    "/articles/filler-long-term/": "/assets/img/articles/filler-mri-longevity-timeline.jpg",
    "/articles/dissolve-filler-native-tissue/": "/assets/img/articles/hyaluronidase-native-ha-recovery.jpg",
    "/articles/same-filler-different-results/": "/assets/img/articles/filler-volume-retention-lips-vs-cheek.jpg",
    "/articles/filler-safety-evidence/": "/assets/img/articles/filler-safety-vascular-midface.jpg",
    "/articles/layered-injection-anatomy/": "/assets/img/articles/facial-anatomy-5-layers.jpg",
    "/articles/choosing-filler-clinic-udon/": "/assets/img/articles/filler-clinic-udon-checklist.jpg",
    "/articles/tear-trough-filler-candidates/": "/assets/img/articles/tear-trough-types-filler-candidate.jpg",
    "/articles/sculptra-ellanse-vs-ha-filler/": "/assets/img/articles/sculptra-ellanse-ha-filler-timeline.jpg",
    "/articles/skincare-routine-filler-botox/": "/assets/img/articles/skincare-before-after-injection.jpg",
    "/doctor/": "/assets/img/doctor/stage-keynote.jpg",
}


def head(title, desc, path, keywords, extra_ld=(), lang="th"):
    lds = [CLINIC_LD, DOCTOR_LD, *extra_ld]
    ld = "\n".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in lds)
    url = SITE + path
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="keywords" content="{keywords}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:locale" content="{"en_US" if lang == "en" else "th_TH"}">{hreflang(path)}
<meta property="og:site_name" content="Vinfinity Clinic">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}{PAGE_IMG.get(th_path(path), "/assets/img/og.jpg")}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B142E">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/kanit-thai-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/styles.css">
{ld}
</head>
<body>
{header_html(lang, path)}
<main>
"""


NAV = {
    "th": [("/filler/", "ฟิลเลอร์"), ("/skin-booster/", "สกินบูสเตอร์"), ("/price/", "ราคา"), ("/#results", "เคสจริง"),
           ("/#programs", "โปรแกรม"), ("/articles/", "บทความ"), ("/doctor/", "แพทย์"), ("/#reviews", "รีวิว"), ("/#clinic", "ติดต่อ")],
    "en": [("/en/filler/", "Filler"), ("/en/skin-booster/", "Skin boosters"), ("/en/price/", "Prices"), ("/en/#results", "Results"),
           ("/en/#programs", "Programs"), ("/en/articles/", "Articles"), ("/en/doctor/", "Doctor"), ("/en/#reviews", "Reviews"), ("/en/#clinic", "Contact")],
}


def lang_switch(lang, path):
    t = th_path(path)
    if t not in EN.EN_PAGES:
        return ""
    th_cur = ' aria-current="true"' if lang == "th" else ""
    en_cur = ' aria-current="true"' if lang == "en" else ""
    return (f'<div class="lang-sw" role="group" aria-label="Language">'
            f'<a href="{t}" hreflang="th" lang="th"{th_cur}>TH</a>'
            f'<a href="{en_path(t)}" hreflang="en" lang="en"{en_cur}>EN</a></div>')


def header_html(lang, path):
    en = lang == "en"
    nav = "\n".join(f'<a href="{u}">{n}</a>' for u, n in NAV[lang])
    home = "/en/" if en else "/"
    label = "Vinfinity Clinic home" if en else "Vinfinity Clinic หน้าแรก"
    cta = "Book a consult" if en else "นัดปรึกษาแพทย์"
    return f"""<header class="site-header">
<div class="wrap">
<a class="brand lockup" href="{home}" aria-label="{label}"><img class="lk-mark" src="/assets/vinfinity-mark.svg" alt="" width="44" height="46"><span class="lk-text"><img class="lk-word" src="/assets/vinfinity-wordmark.svg" alt="Vinfinity" width="150" height="18"><span class="lk-tag">INFINITE BEAUTY, PRECISELY</span></span></a>
<nav class="nav" aria-label="{"Main menu" if en else "เมนูหลัก"}">
{nav}
</nav>
<div class="hdr-r">{lang_switch(lang, path)}<a class="btn btn-silver header-cta" href="{LINE_EN if en else LINE}"><span class="cta-full">{cta}</span><span class="cta-short">{"Book" if en else "นัดหมอ"}</span></a></div>
</div>
</header>"""


def footer(lang="th"):
    if lang == "en":
        return footer_en()
    return footer_th()


def footer_en():
    return f"""</main>
<footer class="site-footer">
<div class="wrap">
<div class="cols">
<div>
<a class="brand brand-stack" href="/en/"><img src="/assets/vinfinity-logo-stacked.svg" alt="Vinfinity Clinic" width="96" height="114"><span class="brand-tag">INFINITE BEAUTY, PRECISELY</span></a>
<p style="margin-top:18px;max-width:340px">Physician-led aesthetic clinic, under the care of Dr. Dechowat Promda · Udon Thani, Thailand and Vientiane, Laos</p>
</div>
<div>
<h4>Treatments</h4>
<p><a href="/en/filler/">Dermal filler in Udon Thani</a></p>
<p><a href="/en/filler/tear-trough/">Tear trough filler</a></p>
<p><a href="/en/filler/lips/">Lip filler</a></p>
<p><a href="/en/filler/chin/">Chin filler</a></p>
<p><a href="/en/sculptra/">Sculptra</a></p>
<p><a href="/en/toxin/">Anti-wrinkle injections</a></p>
<p><a href="/en/skin-booster/">Skin boosters</a></p>
<p><a href="/en/filler/dissolve/">Filler dissolving and correction</a></p>
<p><a href="/en/lifting/">HIFU lifting</a></p>
<p><a href="/en/#programs">The Architect Rebuild</a></p>
<p><a href="/en/articles/choosing-filler-clinic-udon/">Choosing a filler clinic in Udon Thani</a></p>
<p><a href="/en/articles/">Advanced Injection articles</a></p>
<p><a href="/en/price/">All prices</a></p>
</div>
<div>
<h4>Contact</h4>
<p><a href="{LINE_EN}">LINE @230eeqvl</a></p>
<p><a href="{MSG}">Facebook Messenger</a></p>
<p><a href="tel:+66{TEL.replace('-', '')[1:]}">Phone +66 {TEL[1:]}</a></p>
<p><a href="/" hreflang="th" lang="th">ภาษาไทย</a></p>
</div>
<div>
<h4>Udon Thani clinic</h4>
<p>{ADDR_EN}</p>
<p>{HOURS_EN}</p>
<p><a href="{MAPS_URL}" target="_blank" rel="noopener">Open Google Maps</a> · <a href="{G_REVIEWS}" target="_blank" rel="noopener">Reviews</a></p>
</div>
</div>
<div class="legal">Vinfinity Clinic (วินฟินิตี้ คลินิกเวชกรรม) Udon Thani · Medical facility license no. 41101001567 · Advertising approval ฆสพ.อด.100/2568 · Results vary from person to person. Every procedure can have side effects; please consult a doctor before deciding.</div>
</div>
</footer>
<script>window.VF={{app:{json.dumps(LINE_APP)},ga4:{json.dumps(GA4_ID)},meta:{json.dumps(META_PIXEL_ID)},tiktok:{json.dumps(TIKTOK_PIXEL_ID)}}};</script>
<script src="/assets/track.js" defer></script>
</body>
</html>
"""


def footer_th():
    return f"""</main>
<footer class="site-footer">
<div class="wrap">
<div class="cols">
<div>
<a class="brand brand-stack" href="/"><img src="/assets/vinfinity-logo-stacked.svg" alt="Vinfinity Clinic" width="96" height="114"><span class="brand-tag">INFINITE BEAUTY, PRECISELY</span></a>
<p style="margin-top:18px;max-width:340px">คลินิกเวชกรรมด้านความงาม ดูแลโดย นพ.เดโชวัต พรมดา · สาขาอุดรธานี และเวียงจันทน์ สปป.ลาว</p>
</div>
<div>
<h4>บริการ</h4>
<p><a href="/filler/">ฟิลเลอร์อุดร</a></p>
<p><a href="/filler/tear-trough/">ฟิลเลอร์ใต้ตา อุดรธานี</a></p>
<p><a href="/filler/lips/">ฟิลเลอร์ปาก อุดรธานี</a></p>
<p><a href="/filler/chin/">ฟิลเลอร์คาง อุดรธานี</a></p>
<p><a href="/sculptra/">Sculptra อุดรธานี</a></p>
<p><a href="/toxin/">โบท็อก อุดรธานี</a></p>
<p><a href="/skin-booster/">สกินบูสเตอร์ อุดรธานี</a></p>
<p><a href="/filler/dissolve/">สลายฟิลเลอร์ แก้ฟิลเลอร์</a></p>
<p><a href="/lifting/">ยกกระชับ HIFU อุดรธานี</a></p>
<p><a href="/#programs">The Architect Rebuild</a></p>
<p><a href="/articles/choosing-filler-clinic-udon/">เลือกคลินิกฟิลเลอร์ในอุดร</a></p>
<p><a href="/articles/">บทความ Advanced Injection</a></p>
<p><a href="/price/">ราคาทุกโปรแกรม</a></p>
</div>
<div>
<h4>ติดต่อ</h4>
<p><a href="{LINE}">LINE @230eeqvl</a></p>
<p><a href="{MSG}">Facebook Messenger</a></p>
<p><a href="tel:{TEL.replace('-', '')}">โทร {TEL}</a></p>
<p><a href="/en/" hreflang="en">English</a></p>
</div>
<div>
<h4>สาขาอุดรธานี</h4>
<p>{ADDR_LINE}</p>
<p>{HOURS_TEXT}</p>
<p><a href="{MAPS_URL}" target="_blank" rel="noopener">เปิด Google Maps</a> · <a href="{G_REVIEWS}" target="_blank" rel="noopener">รีวิว</a></p>
</div>
</div>
<div class="legal">วินฟินิตี้ คลินิกเวชกรรม อุดรธานี · ใบอนุญาตประกอบกิจการสถานพยาบาลเลขที่ 41101001567 · ฆสพ.อด.100/2568 · ผลลัพธ์ของการรักษาขึ้นอยู่กับแต่ละบุคคล การทำหัตถการทุกชนิดอาจมีผลข้างเคียง ควรปรึกษาแพทย์ก่อนตัดสินใจ</div>
</div>
</footer>
<script>window.VF={{app:{json.dumps(LINE_APP)},ga4:{json.dumps(GA4_ID)},meta:{json.dumps(META_PIXEL_ID)},tiktok:{json.dumps(TIKTOK_PIXEL_ID)}}};</script>
<script src="/assets/track.js" defer></script>
</body>
</html>
"""


def bust(html):
    """/assets is cached as immutable, so asset links (CSS/JS/images) carry a content hash."""
    import hashlib, re
    def rep(m):
        f = ROOT / m.group(2).lstrip("/")
        h = hashlib.sha1(f.read_bytes()).hexdigest()[:10] if f.exists() else "0"
        return '"%s%s?v=%s"' % (m.group(1) or "", m.group(2), h)
    return re.sub(r'"(https://vinfinityclinic\.com)?(/assets/[^"?\s]+\.(?:css|js|jpg|jpeg|png|webp|svg))"', rep, html)


REGISTRY = []  # Thai builds, replayed in English by build_en_all()


def build(out, title, desc, path, keywords, body_file, faqs, extra_ld=(), lang="th"):
    en = lang == "en"
    src = ROOT / "pages" / ("en" if en else "") / body_file
    body = src.read_text(encoding="utf-8")
    for key, part in (("ANATOMY", "_anatomy.html"), ("RESULTS_EYE", "_results_eye.html"), ("RESULTS_MEN", "_results_men.html"),
                      ("RESULTS_LAYERS", "_results_layers.html"), ("BA_JS", "_ba_script.html")):
        f = ROOT / "pages" / ("en" if en and part != "_ba_script.html" else "") / part
        if "{{%s}}" % key in body and f.exists():
            body = body.replace("{{%s}}" % key, f.read_text(encoding="utf-8"))
    body = (body.replace("{{REVIEWS}}", reviews_html(lang)).replace("{{CLINIC_INFO}}", clinic_info_html(lang))
            .replace("{{MAP}}", map_html(lang)))
    body = body.replace("{{ADDR}}", ADDR_EN if en else ADDR_LINE)
    body = body.replace("{{LINE}}", LINE_EN if en else LINE).replace("{{MSG}}", MSG).replace("{{FAQ}}", faq_html(faqs))
    lds = ([faq_ld(faqs)] if faqs else []) + list(extra_ld)
    html = head(title, desc, path, keywords, lds, lang) + body + footer(lang)
    html = bust(html)
    p = ROOT / out
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(html, encoding="utf-8")
    if not en:
        REGISTRY.append((out, path, body_file, faqs, list(extra_ld)))
    print("built", out)


def build_en_all():
    """Build the English twin of every Thai page from pages/en/* and i18n_en.EN_PAGES."""
    faq_map = {id(HOME_FAQ): EN.EN_HOME_FAQ, id(FILLER_FAQ): EN.EN_FILLER_FAQ, id(LIFT_FAQ): EN.EN_LIFT_FAQ,
               id(DISSOLVE_FAQ): EN.EN_DISSOLVE_FAQ, id(TT_FAQ): EN.EN_TT_FAQ, id(PRICE_FAQ): EN.EN_PRICE_FAQ,
               id(SCULPTRA_FAQ): EN.EN_SCULPTRA_FAQ, id(TOXIN_FAQ): EN.EN_TOXIN_FAQ, id(LIPS_FAQ): EN.EN_LIPS_FAQ,
               id(CHIN_FAQ): EN.EN_CHIN_FAQ, id(BOOSTER_FAQ): EN.EN_BOOSTER_FAQ}
    for out, path, body_file, faqs, extra in REGISTRY:
        meta = EN.EN_PAGES.get(path)
        if not meta or not (ROOT / "pages" / "en" / body_file).exists():
            print("skip en", path)
            continue
        ep = en_path(path)
        lds = []
        for x in extra:
            t = x.get("@type")
            if t == "BreadcrumbList":
                continue
            x = json.loads(json.dumps(x))
            if x.get("url", "").startswith(SITE):
                x["url"] = SITE + ep
            if "inLanguage" in x:
                x["inLanguage"] = "en"
            if isinstance(t, list) and "Article" in t:
                x["headline"] = meta.get("headline", meta["title"].split(" | ")[0])
                x["description"] = meta["desc"]
            elif "name" in x and t in ("MedicalWebPage", "ProfilePage", "WebPage"):
                x["name"] = meta["title"].split(" | ")[0]
            lds.append(x)
        if meta.get("crumbs"):
            lds.append(crumb_ld(*meta["crumbs"], lang="en"))
        build("en/" + out, meta["title"], meta["desc"], ep, meta["keywords"], body_file,
              faq_map.get(id(faqs), []) if faqs else [], lds, lang="en")


HOME_FAQ = [
    ("ใครเป็นผู้ทำหัตถการ", "แพทย์เป็นผู้ประเมินและทำหัตถการเองทุกเคส โดย นพ.เดโชวัต พรมดา ดูแลการวางแผนการรักษาของคลินิก"),
    ("ฟิลเลอร์กับสกินบูสเตอร์ต่างกันอย่างไร", "ฟิลเลอร์ใช้เติมหรือปรับโครงสร้างในตำแหน่งที่ต้องการ ส่วนสกินบูสเตอร์ใช้ฟื้นฟูคุณภาพผิว เช่น ความชุ่มชื้นและความแน่น ทั้งสองอย่างมักใช้ร่วมกันในแผนการรักษาแบบเป็นชั้น"),
    ("ต้องทำกี่ครั้งถึงจะเห็นผล", "ขึ้นกับหัตถการและสภาพผิวของแต่ละคน แพทย์จะแจ้งจำนวนครั้งและระยะห่างหลังการประเมิน"),
    ("ผลลัพธ์อยู่ได้นานแค่ไหน", "ขึ้นกับชนิดผลิตภัณฑ์ ตำแหน่ง และการเผาผลาญของแต่ละบุคคล แพทย์จะแนะนำช่วงเวลานัดติดตามผลให้เหมาะกับแต่ละคน"),
    ("นัดปรึกษาอย่างไร", "ทัก LINE @230eeqvl หรือ Facebook Messenger ส่งรูปหน้าตรงและเรื่องที่กังวล ทีมจะนัดเวลาประเมินกับแพทย์ให้"),
    ("Vinfinity Clinic อุดรธานี อยู่ที่ไหน เปิดกี่โมง", f"คลินิกอยู่ที่ {ADDR_LINE} {HOURS_TEXT} โทร {TEL} หรือนัดทาง LINE @230eeqvl"),
    ("มีสาขาที่ลาวไหม", "มีสาขาเวียงจันทน์ สปป.ลาว และสาขาอุดรธานี ลูกค้าจากลาวสามารถนัดล่วงหน้าเพื่อเดินทางมาทำที่อุดรธานีได้"),
]
FILLER_FAQ = [
    ("ฟิลเลอร์อุดร ราคาเท่าไหร่", "ราคาขึ้นกับตำแหน่งและปริมาณที่ใช้ แพทย์จะแจ้งแผนและค่าใช้จ่ายทั้งหมดก่อนเริ่มทุกครั้ง ราคาเริ่มต้น 9,990 บาทต่อ cc"),
    ("ฉีดฟิลเลอร์เจ็บไหม", "ส่วนใหญ่ใช้ยาชาทาก่อนฉีด และผลิตภัณฑ์หลายชนิดมียาชาผสม ความรู้สึกขึ้นกับตำแหน่งและแต่ละบุคคล"),
    ("หลังฉีดฟิลเลอร์ต้องพักฟื้นไหม", "ส่วนใหญ่กลับไปใช้ชีวิตได้ทันที อาจมีบวมหรือช้ำเล็กน้อยได้ 2–7 วัน แพทย์จะให้คำแนะนำหลังทำเป็นรายบุคคล"),
    ("ฟิลเลอร์อยู่ได้นานแค่ไหน", "โดยทั่วไปฟิลเลอร์ไฮยาลูรอนิกแอซิดอยู่ได้ราว 6–18 เดือน ขึ้นกับชนิด ตำแหน่ง และการเผาผลาญของแต่ละบุคคล"),
    ("ถ้าไม่พอใจผลลัพธ์แก้ไขได้ไหม", "ฟิลเลอร์ชนิดไฮยาลูรอนิกแอซิดสามารถสลายได้ด้วยเอนไซม์โดยแพทย์ ควรปรึกษาแพทย์เพื่อประเมินก่อน"),
    ("จะรู้ได้อย่างไรว่าเป็นของแท้", "คลินิกใช้ผลิตภัณฑ์ที่ขึ้นทะเบียนกับ อย. และเปิดกล่องให้ตรวจสอบต่อหน้าก่อนฉีด"),
    ("ฟิลเลอร์อุดร ที่ไหนดี ควรดูอะไร", "ควรเลือกสถานพยาบาลที่ได้รับอนุญาต ผู้ฉีดเป็นแพทย์ที่ตรวจสอบรายชื่อกับแพทยสภาได้ ใช้ผลิตภัณฑ์ขึ้นทะเบียน อย. และมีการประเมินก่อนเสนอราคา อ่านเช็กลิสต์ฉบับเต็มได้ในบทความ 7 ข้อที่ควรเช็กก่อนเลือกคลินิกฟิลเลอร์ในอุดร"),
    ("Vinfinity Clinic อุดรธานี อยู่ที่ไหน เปิดกี่โมง", f"คลินิกอยู่ที่ {ADDR_LINE} {HOURS_TEXT} นัดล่วงหน้าทาง LINE @230eeqvl หรือโทร {TEL}"),
]
LIFT_FAQ = [
    ("ยกกระชับ อุดรธานี ราคาเท่าไหร่", "New Doublo 2.0 ที่ Vinfinity Clinic ราคาเริ่มต้น 22,222 บาท ราคาจริงขึ้นกับระดับและตำแหน่ง แพทย์แจ้งค่าใช้จ่ายทั้งหมดก่อนเริ่ม"),
    ("HIFU เจ็บไหม", "อาจรู้สึกร้อนหรือตึงเป็นจังหวะ โดยเฉพาะบริเวณใกล้กระดูก ความรู้สึกขึ้นกับระดับพลังงานและแต่ละคน"),
    ("ทำ HIFU แล้วเห็นผลเมื่อไหร่", "บางคนรู้สึกกระชับขึ้นหลังทำ แต่ผลจากการสร้างคอลลาเจนใหม่มักค่อย ๆ ชัดขึ้นในช่วงหลายสัปดาห์ถึงไม่กี่เดือน"),
    ("ยกกระชับแล้วหน้าจะซูบไหม", "แพทย์จะเลือกระดับและหลีกเลี่ยงบริเวณที่ไขมันน้อยหรือแก้มตอบ ถ้าจำเป็นอาจวางแผนเติมโครงด้วยฟิลเลอร์ร่วมด้วย"),
    ("ต้องพักฟื้นไหม", "ส่วนใหญ่กลับไปใช้ชีวิตได้ทันที อาจมีแดงหรือบวมเล็กน้อยระยะสั้น"),
]
DISSOLVE_FAQ = [
    ("สลายฟิลเลอร์ อุดร ทำได้ทุกชนิดไหม", "เอนไซม์สลายได้เฉพาะฟิลเลอร์ชนิดไฮยาลูรอนิกแอซิด ฟิลเลอร์ชนิดอื่นต้องใช้วิธีต่างออกไป ควรบอกแพทย์ว่าเคยฉีดอะไร"),
    ("สลายฟิลเลอร์เจ็บไหม", "รู้สึกคล้ายฉีดฟิลเลอร์ อาจบวมหรือแดงเล็กน้อย 1–3 วัน"),
    ("สลายแล้วฉีดใหม่ได้เมื่อไหร่", "ส่วนใหญ่ควรรอให้บวมยุบและเนื้อเยื่อเข้าที่ประมาณ 2 สัปดาห์ แพทย์จะนัดประเมินก่อนเติมใหม่"),
    ("ฉีดฟิลเลอร์ที่อื่นมา แก้ที่ Vinfinity ได้ไหม", "ได้ แพทย์จะซักประวัติและประเมินก่อน ถ้ามีข้อมูลผลิตภัณฑ์หรือรูปก่อนฉีดให้นำมาด้วย"),
    ("ฟิลเลอร์เป็นก้อนหายเองได้ไหม", "บางกรณีบวมหรือก้อนเล็กยุบเองได้ในช่วงแรก ถ้าเป็นนานหรือแข็งขึ้นควรให้แพทย์ประเมิน ส่วนอาการปวดมาก ผิวซีดหรือคล้ำเป็นแถบ ต้องพบแพทย์ทันที"),
]
EN_FAQ = [
    ("Where is Vinfinity Clinic Udon Thani?", f"{ADDR_LINE}, Thailand. Open daily 10:00–19:00, closed on Tuesdays."),
    ("How much is dermal filler in Udon Thani at Vinfinity?", "Hyaluronic acid filler starts at THB 9,990 per cc. The doctor confirms the full cost after assessment, before treatment."),
    ("Who performs the injections?", "A physician assesses and injects every patient. The clinic is led by Dechowat Promda, M.D."),
    ("Can I come from Vientiane or Nong Khai?", "Yes. Book ahead on LINE @230eeqvl or Messenger so the doctor can plan your treatment for the day you arrive."),
]
TT_FAQ = [
    ("ฟิลเลอร์ใต้ตา อุดรธานี ราคาเท่าไหร่", "ฟิลเลอร์ที่ Vinfinity Clinic ราคาเริ่มต้น 9,990 บาทต่อ cc ปริมาณที่ใช้ใต้ตาขึ้นกับความลึกของร่องแต่ละคน แพทย์จะแจ้งค่าใช้จ่ายทั้งหมดหลังประเมินก่อนเริ่มทำ"),
    ("ฉีดฟิลเลอร์ใต้ตาเจ็บไหม", "ใช้ยาชาทาก่อนฉีด และผลิตภัณฑ์ส่วนใหญ่มียาชาผสม ส่วนใหญ่รู้สึกตึงหรือหน่วงเล็กน้อยระหว่างฉีด"),
    ("ฟิลเลอร์ใต้ตาอยู่ได้นานแค่ไหน", "ขึ้นกับชนิดผลิตภัณฑ์และการเผาผลาญของแต่ละคน ใต้ตาเป็นบริเวณที่ขยับน้อย ผลจึงมักอยู่ได้นานกว่าบางตำแหน่ง แพทย์จะนัดติดตามผลเป็นระยะ"),
    ("ฉีดฟิลเลอร์ใต้ตาแล้วบวมกี่วัน", "ส่วนใหญ่บวมหรือช้ำเล็กน้อย 2–7 วัน บางคนใต้ตาบวมน้ำง่ายกว่าปกติ แพทย์จะประเมินเรื่องนี้ก่อนฉีด"),
    ("ถุงใต้ตาใหญ่ ฉีดฟิลเลอร์ได้ไหม", "บางเคสช่วยให้รอยต่อระหว่างถุงกับแก้มเรียบขึ้นได้ แต่ถ้าถุงไขมันใหญ่มาก การผ่าตัดอาจเหมาะกว่า แพทย์จะบอกตรง ๆ หลังประเมิน"),
    ("ถ้าไม่พอใจฟิลเลอร์ใต้ตา แก้ได้ไหม", "ฟิลเลอร์ไฮยาลูรอนิกแอซิดสลายได้ด้วยเอนไซม์โดยแพทย์ ควรกลับมาให้แพทย์ประเมินก่อน"),
]
PRICE_FAQ = [
    ("ฟิลเลอร์ อุดร ราคาเท่าไหร่", "ฟิลเลอร์ HA จากยุโรปที่ Vinfinity Clinic ราคาเริ่มต้น 9,990 บาทต่อ cc ปริมาณขึ้นกับตำแหน่งและโครงหน้า แพทย์แจ้งค่าใช้จ่ายทั้งหมดหลังประเมินก่อนเริ่ม"),
    ("ปรึกษาแพทย์มีค่าใช้จ่ายไหม", "ครั้งแรกปรึกษาแพทย์และตรวจวิเคราะห์ผิวฟรี และส่งรูปให้แพทย์ประเมินเบื้องต้นทาง LINE @230eeqvl ได้ก่อนมา"),
    ("ราคาบนเว็บรวมทุกอย่างหรือยัง", "ราคาที่แสดงเป็นราคาผลิตภัณฑ์และการทำหัตถการ แพทย์จะสรุปค่าใช้จ่ายทั้งหมดให้ก่อนเริ่มทุกครั้ง ไม่มีค่าใช้จ่ายแอบแฝง"),
    ("ผ่อนชำระได้ไหม", "โปรแกรมตั้งแต่ 30,000 บาท ผ่อน 0% ได้สูงสุด 10 เดือน กับบัตรที่ร่วมรายการ สอบถามเงื่อนไขกับเจ้าหน้าที่"),
    ("ทำไมแต่ละคนจ่ายไม่เท่ากัน", "ปริมาณ จำนวนครั้ง และจุดที่ต้องดูแลต่างกันตามโครงหน้าและสภาพผิว แพทย์ใช้เท่าที่จำเป็นและบอกเหตุผลของแผนก่อนเริ่ม"),
]
SCULPTRA_FAQ = [
    ("Sculptra อุดรธานี ราคาเท่าไหร่", "ที่ Vinfinity Clinic อุดรธานี Sculptra ราคา 24,995 บาทต่อขวด หรือเลือกคอร์ส Foundation Starter 29,900 บาท และ Skin Foundation 3 ราคา 67,900 บาท"),
    ("Sculptra ต้องฉีดกี่ครั้ง", "ส่วนใหญ่วาง 2–3 ครั้ง ห่างกันประมาณ 4 สัปดาห์ จำนวนขวดและจำนวนครั้งขึ้นกับความหย่อนและความหนาผิวของแต่ละคน"),
    ("Sculptra เห็นผลเมื่อไหร่", "หลังฉีดหน้าจะอิ่มจากน้ำที่ผสมแล้วยุบลงในไม่กี่วัน ผลจากคอลลาเจนจะค่อย ๆ ชัดขึ้นใน 4–12 สัปดาห์"),
    ("Sculptra อยู่ได้นานแค่ไหน", "ผลอยู่ได้ถึงประมาณ 2 ปี ขึ้นกับอายุ สภาพผิว และการดูแลของแต่ละคน"),
    ("Sculptra เป็นก้อนไหม", "มีโอกาสเกิดก้อนได้ถ้าผสมหรือฉีดไม่เหมาะสม แพทย์ผสมตามมาตรฐาน ฉีดในชั้นที่เหมาะสม และให้นวดตามหลัก 5-5-5 หลังฉีดเพื่อลดความเสี่ยง"),
    ("Sculptra ต่างจากฟิลเลอร์อย่างไร", "ฟิลเลอร์เติมเจลให้เห็นผลทันทีเฉพาะจุด ส่วน Sculptra กระตุ้นให้ผิวสร้างคอลลาเจนเองทั้งหน้า ผลค่อย ๆ ขึ้นและอยู่นานกว่า หลายคนใช้ร่วมกัน"),
]
TOXIN_FAQ = [
    ("โบท็อก อุดร ราคาเท่าไหร่", "ที่ Vinfinity Clinic ราคาเริ่มต้น 1,500 บาทต่อตำแหน่ง เช่น ระหว่างคิ้ว 1,900 บาท กรามปรับหน้าเรียว 4,900 บาท (Standard) หรือเลือกผลิตภัณฑ์ Premium จากยุโรป/อเมริกา"),
    ("ฉีดโบท็อกกี่วันเห็นผล", "ส่วนใหญ่เริ่มเห็นผลใน 3–14 วัน กรามจะค่อย ๆ เล็กลงชัดขึ้นในหลายสัปดาห์"),
    ("โบท็อกอยู่ได้นานแค่ไหน", "ประมาณ 3–6 เดือน ขึ้นกับตำแหน่ง ขนาดกล้ามเนื้อ และการเผาผลาญของแต่ละคน"),
    ("ฉีดโบท็อกแล้วหน้าแข็งไหม", "ถ้ากำหนดยูนิตและจุดฉีดให้เหมาะกับกล้ามเนื้อของแต่ละคน หน้าจะยังขยับได้เป็นธรรมชาติ แพทย์จะให้คุณขยับหน้าก่อนฉีดทุกครั้ง"),
    ("Standard กับ Premium ต่างกันอย่างไร", "Standard เป็นผลิตภัณฑ์คุณภาพจากเกาหลี Premium เป็นผลิตภัณฑ์จากยุโรป/อเมริกา แพทย์ช่วยแนะนำตามตำแหน่งและความต้องการ"),
]
LIPS_FAQ = [
    ("ฟิลเลอร์ปาก อุดร ราคาเท่าไหร่", "ฟิลเลอร์ HA จากยุโรป ราคาเริ่มต้น 9,990 บาทต่อ cc ปริมาณขึ้นกับรูปปากเดิมและรูปปากที่ต้องการ แพทย์แจ้งค่าใช้จ่ายทั้งหมดก่อนเริ่ม"),
    ("ฉีดฟิลเลอร์ปากเจ็บไหม", "ทายาชาก่อนฉีด และผลิตภัณฑ์ส่วนใหญ่มียาชาผสม ปากเป็นจุดที่ไวกว่าตำแหน่งอื่นเล็กน้อย ส่วนใหญ่ทนได้สบาย"),
    ("ฟิลเลอร์ปากบวมกี่วัน", "บวมมากที่สุด 1–2 วันแรก แล้วค่อย ๆ ยุบใน 3–7 วัน รูปปากจริงเห็นชัดราว 2 สัปดาห์"),
    ("ฟิลเลอร์ปากอยู่ได้นานแค่ไหน", "ประมาณ 6–12 เดือน ปากขยับบ่อยจึงมักสลายเร็วกว่าบางตำแหน่ง"),
    ("ไม่ชอบรูปปากหลังฉีด แก้ได้ไหม", "ฟิลเลอร์ไฮยาลูรอนิกแอซิดสลายได้ด้วยเอนไซม์โดยแพทย์ ควรรอให้บวมยุบก่อนแล้วให้แพทย์ประเมิน"),
]
CHIN_FAQ = [
    ("ฟิลเลอร์คาง อุดร ราคาเท่าไหร่", "ฟิลเลอร์ HA จากยุโรป ราคาเริ่มต้น 9,990 บาทต่อ cc ปริมาณขึ้นกับความยาวและรูปทรงที่ต้องปรับ แพทย์แจ้งค่าใช้จ่ายทั้งหมดก่อนเริ่ม"),
    ("ฟิลเลอร์คางอยู่ได้นานแค่ไหน", "ประมาณ 6–12 เดือน หรือนานกว่าในบางคน เพราะฉีดในชั้นลึกใกล้กระดูกและเป็นจุดที่ขยับน้อย"),
    ("ฉีดฟิลเลอร์คางแล้วคางจะแหลมไหม", "ไม่จำเป็น แพทย์ออกแบบรูปทรงตามโครงหน้า บางคนเหมาะกับคางมน บางคนเหมาะกับคางที่ยาวขึ้นเล็กน้อย"),
    ("ฉีดฟิลเลอร์คางกับเสริมซิลิโคนต่างกันอย่างไร", "ฟิลเลอร์ไม่ต้องผ่าตัด เห็นผลทันทีและปรับแก้ได้ ส่วนซิลิโคนเป็นการผ่าตัดที่ผลถาวรกว่าแต่แก้ไขยากกว่า"),
    ("เคยเสริมคางมาแล้ว ฉีดฟิลเลอร์ได้ไหม", "ต้องแจ้งแพทย์ก่อนว่าเคยทำอะไรมา แพทย์จะประเมินว่าฉีดได้อย่างปลอดภัยหรือไม่"),
]
BOOSTER_FAQ = [
    ("สกินบูสเตอร์ อุดรธานี ราคาเท่าไหร่", "ขึ้นกับชนิดผลิตภัณฑ์และจำนวนครั้งในคอร์ส แพทย์จะแจ้งแผนและค่าใช้จ่ายก่อนเริ่ม ราคาเริ่มต้น 7,900 บาทต่อครั้ง"),
    ("สกินบูสเตอร์ต้องทำกี่ครั้ง", "มักวางเป็นคอร์สหลายครั้งห่างกันตามที่แพทย์กำหนด แล้วทำซ้ำเพื่อคงสภาพผิว จำนวนครั้งขึ้นกับสภาพผิวแต่ละคน"),
    ("ทำสกินบูสเตอร์แล้วหน้าบวมไหม", "หลังทำอาจมีตุ่มนูนเล็ก ๆ หรือรอยแดงตามจุดฉีดได้ 1–3 วัน ส่วนใหญ่ยุบเอง"),
    ("สกินบูสเตอร์ทำร่วมกับฟิลเลอร์หรือยกกระชับได้ไหม", "ได้ และมักทำร่วมกันในแผนแบบเป็นชั้น เช่น ยกกระชับด้วย New Doublo 2.0 แล้วฟื้นฟูคุณภาพผิวด้วยสกินบูสเตอร์"),
    ("ใครไม่ควรทำสกินบูสเตอร์", "ผู้ที่ตั้งครรภ์หรือให้นมบุตร มีการติดเชื้อบริเวณที่จะฉีด หรือแพ้ส่วนประกอบของผลิตภัณฑ์ ควรแจ้งแพทย์ระหว่างการประเมิน"),
]


def article_ld(path, headline, desc, cites, date="2026-10-03"):
    return {"@context": "https://schema.org", "@type": ["MedicalWebPage", "Article"],
            "headline": headline, "description": desc, "inLanguage": "th",
            "url": SITE + path, "datePublished": date, "dateModified": date,
            "author": {"@id": SITE + "/#dr-dechowat"}, "reviewedBy": {"@id": SITE + "/#dr-dechowat"},
            "publisher": {"@id": SITE + "/#clinic"}, "image": {"@type": "ImageObject", "url": SITE + PAGE_IMG.get(path, "/assets/img/og.jpg"), "width": 1600, "height": 900},
            "citation": cites}


if __name__ == "__main__":
    build("index.html",
          "Vinfinity Clinic อุดรธานี คลินิกความงามโดยแพทย์ | ฟิลเลอร์อุดร สกินบูสเตอร์ ยกกระชับ",
          "Vinfinity Clinic อุดรธานี คลินิกฟิลเลอร์ สกินบูสเตอร์ และยกกระชับในตัวเมืองอุดร ออกแบบการรักษาเป็นชั้นเฉพาะใบหน้า แพทย์ประเมินและฉีดเองทุกเคส เปิด 10:00–19:00 (ปิดวันอังคาร) นัดทาง LINE @230eeqvl",
          "/", "ฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, สกินบูสเตอร์ อุดร, สกินบูสเตอร์ อุดรธานี, คลินิกความงาม อุดรธานี, ยกกระชับ อุดร, Doublo อุดร, หมอบาส Vinfinity",
          "home.html", HOME_FAQ)
    build("filler/tear-trough/index.html",
          "ฟิลเลอร์ใต้ตา อุดรธานี ราคา ขั้นตอน ใครเหมาะ | Vinfinity Clinic",
          "ฟิลเลอร์ใต้ตา อุดร ที่ Vinfinity Clinic แพทย์ประเมินสาเหตุร่องใต้ตาก่อนฉีดทุกเคส ราคาเริ่มต้น 9,990 บาท/cc ใช้ผลิตภัณฑ์ขึ้นทะเบียน อย. เปิดกล่องตรวจสอบต่อหน้า",
          "/filler/tear-trough/", "ฟิลเลอร์ใต้ตา อุดร, ฟิลเลอร์ใต้ตา อุดรธานี, ฉีดใต้ตา อุดร, ร่องใต้ตา, ถุงใต้ตา ฟิลเลอร์, ฟิลเลอร์ใต้ตา ราคา",
          "filler-tear-trough.html", TT_FAQ,
          [crumb_ld(("ฟิลเลอร์อุดร", "/filler/"), ("ฟิลเลอร์ใต้ตา", "/filler/tear-trough/")),
           {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": "ฟิลเลอร์ใต้ตา อุดรธานี",
            "url": SITE + "/filler/tear-trough/", "inLanguage": "th", "lastReviewed": "2026-10-03",
            "reviewedBy": {"@id": SITE + "/#dr-dechowat"}, "about": {"@type": "MedicalProcedure", "name": "Tear trough filler",
            "alternateName": "ฟิลเลอร์ใต้ตา", "procedureType": "https://schema.org/NoninvasiveProcedure"}}])
    build("filler/dissolve/index.html",
          "สลายฟิลเลอร์ แก้ฟิลเลอร์ อุดรธานี ฟิลเลอร์เป็นก้อน | Vinfinity Clinic",
          "สลายฟิลเลอร์ แก้ฟิลเลอร์ อุดร ฟิลเลอร์เป็นก้อน เป็นสีฟ้า หรือไหลผิดตำแหน่ง แพทย์ประเมินก่อนวางแผนแก้ไขทุกเคส รับแก้เคสที่ฉีดจากที่อื่น ที่ Vinfinity Clinic อุดรธานี",
          "/filler/dissolve/", "สลายฟิลเลอร์ อุดร, แก้ฟิลเลอร์ อุดร, ฟิลเลอร์เป็นก้อน, ฟิลเลอร์ไหล, ฟิลเลอร์ใต้ตาเป็นสีฟ้า, hyaluronidase อุดรธานี",
          "filler-dissolve.html", DISSOLVE_FAQ, [crumb_ld(("ฟิลเลอร์อุดร", "/filler/"), ("สลายฟิลเลอร์", "/filler/dissolve/"))])
    build("lifting/index.html",
          "ยกกระชับ อุดรธานี HIFU New Doublo 2.0 ราคา | Vinfinity Clinic",
          "ยกกระชับหน้า อุดร ด้วย HIFU New Doublo 2.0 หลายระดับความลึก ไม่ต้องผ่าตัด แพทย์ประเมินความหย่อนคล้อยก่อนเลือกระดับ ราคาเริ่มต้น 22,222 บาท ที่ Vinfinity Clinic อุดรธานี",
          "/lifting/", "ยกกระชับ อุดร, ยกกระชับ อุดรธานี, HIFU อุดร, Doublo อุดร, ไฮฟู่ อุดรธานี, ยกกระชับหน้า ไม่ผ่าตัด, หน้าเรียว อุดร",
          "lifting.html", LIFT_FAQ, [crumb_ld(("ยกกระชับ", "/lifting/"))])
    a3 = "ฉีดฟิลเลอร์ อุดร ที่ไหนดี 7 ข้อที่ควรเช็กก่อนเลือกคลินิก"
    d3 = "วิธีเลือกคลินิกฟิลเลอร์ในอุดรธานี ตรวจสอบใบอนุญาตสถานพยาบาล รายชื่อแพทย์กับแพทยสภา และเลขทะเบียน อย. ด้วยตัวเอง พร้อมคำถามที่ควรถามแพทย์ก่อนฉีด"
    build("articles/choosing-filler-clinic-udon/index.html", a3 + " | Vinfinity Clinic", d3,
          "/articles/choosing-filler-clinic-udon/", "ฉีดฟิลเลอร์ อุดร ที่ไหนดี, คลินิกฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, เช็กคลินิก, ตรวจสอบแพทย์, ฟิลเลอร์แท้",
          "article-choosing-clinic.html", [], [article_ld("/articles/choosing-filler-clinic-udon/", a3, d3, [
              "https://hosp.hss.moph.go.th/", "https://www.tmc.or.th/", "https://oryor.com/check-product-serial"]),
              crumb_ld(("บทความ", "/articles/"), ("เลือกคลินิกฟิลเลอร์", "/articles/choosing-filler-clinic-udon/"))])
    build("filler/index.html",
          "ฟิลเลอร์อุดร ราคาเริ่ม 9,990 บาท ฉีดโดยแพทย์ | Vinfinity Clinic อุดรธานี",
          "ฟิลเลอร์อุดร ฉีดโดยแพทย์ทุกเคส ใต้ตา ขมับ คาง กรอบหน้า ร่องแก้ม ปาก ออกแบบตามโครงหน้าโดย นพ.เดโชวัต พรมดา ฟิลเลอร์ HA ขึ้นทะเบียน อย. ราคาเริ่มต้น 9,990 บาทต่อ cc คลินิกในตัวเมืองอุดรธานี",
          "/filler/", "ฟิลเลอร์อุดร, ฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, ฉีดฟิลเลอร์ อุดร, ฉีดฟิลเลอร์ อุดรธานี, ฟิลเลอร์ ราคา อุดร, ฟิลเลอร์ใต้ตา อุดร, ฟิลเลอร์คาง อุดร, ฟิลเลอร์ปาก อุดร, ฟิลเลอร์ขมับ, ฟิลเลอร์ร่องแก้ม, คลินิกฟิลเลอร์ อุดร",
          "filler.html", FILLER_FAQ, [crumb_ld(("ฟิลเลอร์อุดร", "/filler/"))])
    build("skin-booster/index.html",
          "สกินบูสเตอร์ อุดร ฉีดผิวฉ่ำ ฟื้นฟูคุณภาพผิว | Vinfinity Clinic อุดรธานี",
          "สกินบูสเตอร์ที่อุดรธานี ฟื้นฟูความชุ่มชื้น ความแน่น และความกระจ่างใสของผิว วางแผนคอร์สโดยแพทย์ตามสภาพผิว ทำร่วมกับยกกระชับและฟิลเลอร์ได้",
          "/skin-booster/", "สกินบูสเตอร์ อุดร, สกินบูสเตอร์ อุดรธานี, skin booster อุดร, ฉีดผิว อุดร, ฉีดผิวฉ่ำ อุดรธานี, PN อุดร, PDRN อุดร, ผิวฉ่ำ อุดร, ผิวโกลว์",
          "skin-booster.html", BOOSTER_FAQ, [crumb_ld(("สกินบูสเตอร์", "/skin-booster/"))])
    a1 = "ฉีดฟิลเลอร์ให้ปลอดภัย: งานวิจัยปี 2021–2026 บอกอะไรเรา"
    d1 = "สรุปหลักฐานล่าสุดเรื่องความปลอดภัยของฟิลเลอร์ หลอดเลือดกลางใบหน้า เข็มกับแคนนูลา การดูดทดสอบ อัลตราซาวด์ Doppler และการรับมือภาวะหลอดเลือดอุดตัน เรียบเรียงโดย นพ.เดโชวัต พรมดา"
    build("articles/filler-safety-evidence/index.html", a1 + " | Vinfinity Clinic", d1,
          "/articles/filler-safety-evidence/", "ฟิลเลอร์ ปลอดภัย, ฟิลเลอร์ หลอดเลือดอุดตัน, cannula vs needle, ultrasound filler, hyaluronidase, ฟิลเลอร์ อุดรธานี",
          "article-filler-safety.html", [], [article_ld("/articles/filler-safety-evidence/", a1, d1, [
              "https://doi.org/10.1093/asjof/ojaf064", "https://jamanetwork.com/journals/jamadermatology/fullarticle/2774505",
              "https://academic.oup.com/asj/article/45/12/1285/8217433", "https://jcadonline.com/cmac-guideline-hyaluronic-vascular-occlusion/",
              "https://link.springer.com/article/10.1007/s00266-026-05744-z", "https://doi.org/10.1111/jocd.71046"])])
    a2 = "เติมให้ถูกชั้น: กายวิภาคใบหน้า 5 ชั้น กับการฉีดแบบ Layered"
    d2 = "ไขมันชั้นตื้นกับชั้นลึกทำงานต่างกันอย่างไร ทำไมต้องเลือกเจลให้ตรงชั้น และหลักฐานล่าสุดของสกินบูสเตอร์ PN สรุปจากงานวิจัยปี 2024–2026"
    build("articles/layered-injection-anatomy/index.html", a2 + " | Vinfinity Clinic", d2,
          "/articles/layered-injection-anatomy/", "กายวิภาคใบหน้า, fat compartments, layered filler, ฟิลเลอร์ชั้นลึก, สกินบูสเตอร์ PN, ฟิลเลอร์ อุดร",
          "article-layered.html", [], [article_ld("/articles/layered-injection-anatomy/", a2, d2, [
              "https://pmc.ncbi.nlm.nih.gov/articles/PMC12931948/", "https://doi.org/10.2147/CCID.S437942"])])
    build("price/index.html",
          "ราคาฟิลเลอร์ โบท็อก ยกกระชับ สกินบูสเตอร์ อุดรธานี 2569 | Vinfinity Clinic",
          "ราคาฟิลเลอร์ อุดร เริ่มต้น 9,990 บาท/cc Sculptra 24,995 บาท โบท็อกเริ่ม 1,500 บาท ยกกระชับ New Doublo 2.0 เริ่ม 22,222 บาท สกินบูสเตอร์เริ่ม 7,900 บาท ปรึกษาแพทย์ฟรี ที่ Vinfinity Clinic อุดรธานี",
          "/price/", "ราคาฟิลเลอร์ อุดร, ฟิลเลอร์ อุดร ราคา, โบท็อก อุดร ราคา, Sculptra ราคา อุดร, ยกกระชับ ราคา อุดร, สกินบูสเตอร์ ราคา, คลินิกความงาม อุดรธานี ราคา",
          "price.html", PRICE_FAQ, [crumb_ld(("ราคา", "/price/"))])
    build("sculptra/index.html",
          "Sculptra อุดรธานี ราคา กระตุ้นคอลลาเจน ฉีดโดยแพทย์ | Vinfinity Clinic",
          "Sculptra อุดร กระตุ้นคอลลาเจนให้ผิวกลับมาแน่น ผลค่อย ๆ ขึ้นและอยู่ได้ถึง 2 ปี ราคา 24,995 บาท/ขวด แพทย์ประเมินจำนวนขวดและจำนวนครั้งก่อนทุกเคส ที่ Vinfinity Clinic อุดรธานี",
          "/sculptra/", "Sculptra อุดร, Sculptra อุดรธานี, สกัลป์ตร้า อุดร, ฉีดกระตุ้นคอลลาเจน อุดร, PLLA อุดร, Sculptra ราคา, หน้าหย่อน อุดร",
          "sculptra.html", SCULPTRA_FAQ, [crumb_ld(("Sculptra", "/sculptra/")), {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": 'Sculptra อุดรธานี', "url": SITE + '/sculptra/', "inLanguage": "th", "lastReviewed": "2026-10-06", "reviewedBy": {"@id": SITE + "/#dr-dechowat"}, "about": {"@type": "MedicalProcedure", "name": 'Poly-L-lactic acid injection (Sculptra)', "alternateName": 'Sculptra อุดรธานี', "procedureType": 'https://schema.org/NoninvasiveProcedure'}}])
    build("toxin/index.html",
          "โบท็อก อุดรธานี ราคา ลดริ้วรอย กรามเล็ก หน้าเรียว | Vinfinity Clinic",
          "ฉีดโบท็อก อุดร ลดริ้วรอยหน้าผาก ระหว่างคิ้ว หางตา และปรับกรามให้หน้าเรียว แพทย์กำหนดยูนิตเฉพาะกล้ามเนื้อของแต่ละคน ราคาเริ่มต้น 1,500 บาท/ตำแหน่ง ที่ Vinfinity Clinic อุดรธานี",
          "/toxin/", "โบท็อก อุดร, โบท็อก อุดรธานี, ฉีดโบท็อก อุดร, botox อุดร, โบท็อกกราม อุดร, ลดริ้วรอย อุดร, โบท็อก ราคา อุดร",
          "toxin.html", TOXIN_FAQ, [crumb_ld(("โบท็อก", "/toxin/")), {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": 'โบท็อก อุดรธานี', "url": SITE + '/toxin/', "inLanguage": "th", "lastReviewed": "2026-10-06", "reviewedBy": {"@id": SITE + "/#dr-dechowat"}, "about": {"@type": "MedicalProcedure", "name": 'Botulinum toxin injection', "alternateName": 'โบท็อก อุดรธานี', "procedureType": 'https://schema.org/NoninvasiveProcedure'}}])
    build("filler/lips/index.html",
          "ฟิลเลอร์ปาก อุดรธานี ราคา ปากอิ่มเป็นธรรมชาติ | Vinfinity Clinic",
          "ฟิลเลอร์ปาก อุดร ออกแบบรูปปากตามสัดส่วนใบหน้า ทั้งขอบปาก ความอิ่ม และมุมปาก ฉีดโดยแพทย์ทุกเคส ราคาเริ่มต้น 9,990 บาท/cc ผลิตภัณฑ์ขึ้นทะเบียน อย. ที่ Vinfinity Clinic อุดรธานี",
          "/filler/lips/", "ฟิลเลอร์ปาก อุดร, ฟิลเลอร์ปาก อุดรธานี, ฉีดปาก อุดร, ปากอิ่ม, ปากกระจับ, ฟิลเลอร์ปาก ราคา",
          "filler-lips.html", LIPS_FAQ, [crumb_ld(("ฟิลเลอร์อุดร", "/filler/"), ("ฟิลเลอร์ปาก", "/filler/lips/")), {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": 'ฟิลเลอร์ปาก อุดรธานี', "url": SITE + '/filler/lips/', "inLanguage": "th", "lastReviewed": "2026-10-06", "reviewedBy": {"@id": SITE + "/#dr-dechowat"}, "about": {"@type": "MedicalProcedure", "name": 'Lip filler', "alternateName": 'ฟิลเลอร์ปาก อุดรธานี', "procedureType": 'https://schema.org/NoninvasiveProcedure'}}])
    build("filler/chin/index.html",
          "ฟิลเลอร์คาง อุดรธานี ราคา ปรับสัดส่วนหน้า ไม่ผ่าตัด | Vinfinity Clinic",
          "ฟิลเลอร์คาง อุดร ปรับความยาวและรูปทรงคางให้สมดุลกับโครงหน้า ไม่ต้องผ่าตัด เห็นผลทันที ฉีดโดยแพทย์ทุกเคส ราคาเริ่มต้น 9,990 บาท/cc ที่ Vinfinity Clinic อุดรธานี",
          "/filler/chin/", "ฟิลเลอร์คาง อุดร, ฟิลเลอร์คาง อุดรธานี, ฉีดคาง อุดร, เสริมคาง ไม่ผ่าตัด, คางสั้น, ฟิลเลอร์คาง ราคา",
          "filler-chin.html", CHIN_FAQ, [crumb_ld(("ฟิลเลอร์อุดร", "/filler/"), ("ฟิลเลอร์คาง", "/filler/chin/")), {"@context": "https://schema.org", "@type": "MedicalWebPage", "name": 'ฟิลเลอร์คาง อุดรธานี', "url": SITE + '/filler/chin/', "inLanguage": "th", "lastReviewed": "2026-10-06", "reviewedBy": {"@id": SITE + "/#dr-dechowat"}, "about": {"@type": "MedicalProcedure", "name": 'Chin filler', "alternateName": 'ฟิลเลอร์คาง อุดรธานี', "procedureType": 'https://schema.org/NoninvasiveProcedure'}}])
    a4 = "PN โมเลกุลใหญ่ (HMW) กับโมเลกุลเล็ก (LMW) ต่างกันอย่างไร"
    d4 = "PN กับ PDRN ต่างกันที่ความยาวสาย DNA ขนาดโมเลกุลเปลี่ยนความชุ่มชื้น ความหนืด และเวลาที่อยู่ในผิวอย่างไร หลักฐานที่มีแล้วและที่ยังไม่มี เรียบเรียงจากงานวิจัยปี 2018–2026 โดย นพ.เดโชวัต พรมดา"
    build("articles/pn-molecular-weight/index.html", a4 + " | Vinfinity Clinic", d4,
          "/articles/pn-molecular-weight/", "PN HMW LMW, polynucleotide molecular weight, PN กับ PDRN ต่างกัน, สกินบูสเตอร์ PN, PN โมเลกุลใหญ่, PDRN อุดร, PN อุดรธานี",
          "article-pn-molecular-weight.html", [], [article_ld("/articles/pn-molecular-weight/", a4, d4, [
              "https://doi.org/10.3390/biom15010148", "https://doi.org/10.3892/mmr.2018.9539", "https://doi.org/10.3390/ijms27010220",
              "https://doi.org/10.3390/app151910437", "https://doi.org/10.1111/srt.13667", "https://doi.org/10.2147/CCID.S437942",
              "https://doi.org/10.2147/CCID.S557226", "https://doi.org/10.25259/JCAS_65_2025"], "2026-10-06"),
              crumb_ld(("บทความ", "/articles/"), ("PN โมเลกุลใหญ่กับโมเลกุลเล็ก", "/articles/pn-molecular-weight/"))])
    a5 = "ฟิลเลอร์อยู่นานกว่าที่คิด 5 เรื่องที่ไม่ค่อยมีใครบอกก่อนฉีด"
    d5 = "MRI พบฟิลเลอร์อยู่ในหน้าอย่างน้อย 2 ปีและนานถึง 15 ปี การเติมซ้ำทับของเดิม ฟิลเลอร์ดูดน้ำทำให้ใต้ตาบวม หน้าเต็มเกิน และอาการที่มาทีหลัง สรุปจากงานวิจัยโดย นพ.เดโชวัต พรมดา"
    build("articles/filler-long-term/index.html", a5 + " | Vinfinity Clinic", d5,
          "/articles/filler-long-term/", "ฟิลเลอร์อยู่ได้นานแค่ไหน, ฟิลเลอร์ไม่สลาย, ฟิลเลอร์ MRI, หน้าเต็มเกิน, overfilled face, ฟิลเลอร์ใต้ตาบวม, ฟิลเลอร์เคลื่อน, ฟิลเลอร์ อุดรธานี",
          "article-filler-hidden-truths.html", [], [article_ld("/articles/filler-long-term/", a5, d5, [
              "https://doi.org/10.1097/GOX.0000000000005934", "https://doi.org/10.1111/jocd.70879", "https://eyewiki.org/Complications_of_Hyaluronic_Acid_Fillers",
              "https://doi.org/10.2147/CCID.S539888", "https://doi.org/10.1177/30499240251376908", "https://pubmed.ncbi.nlm.nih.gov/40972126/",
              "https://doi.org/10.1111/jocd.15071"], "2026-10-06"),
              crumb_ld(("บทความ", "/articles/"), ("ฟิลเลอร์อยู่นานกว่าที่คิด", "/articles/filler-long-term/"))])
    a6 = "สลายฟิลเลอร์แล้ว ผิวเดิมจะเสียไหม สิ่งที่งานวิจัยบอก"
    d6 = "เอนไซม์สลายฟิลเลอร์ (hyaluronidase) ทำงานอย่างไร ไฮยาลูรอนิกของร่างกายกลับมาเองไหม ทำไมบางคนดูโทรมหลังสลาย ทำไมบางเคสสลายยาก โอกาสแพ้ และควรรอนานแค่ไหนก่อนฉีดใหม่ โดย นพ.เดโชวัต พรมดา"
    build("articles/dissolve-filler-native-tissue/index.html", a6 + " | Vinfinity Clinic", d6,
          "/articles/dissolve-filler-native-tissue/", "สลายฟิลเลอร์ ผิวเสียไหม, hyaluronidase, สลายฟิลเลอร์ หน้าตอบ, สลายฟิลเลอร์ แพ้, สลายฟิลเลอร์ อุดร, เอนไซม์สลายฟิลเลอร์",
          "article-dissolve-native.html", [], [article_ld("/articles/dissolve-filler-native-tissue/", a6, d6, [
              "https://uk.acegroup.online/wp-content/uploads/2024/01/ACE-Group-Hyaluronidase-v3.1.pdf", "https://doi.org/10.1159/000446699",
              "https://doi.org/10.1111/jocd.70870", "https://doi.org/10.1093/asjof/ojaf108", "https://doi.org/10.1093/asj/sjaf127"], "2026-10-06"),
              crumb_ld(("บทความ", "/articles/"), ("สลายฟิลเลอร์แล้วผิวเดิมเสียไหม", "/articles/dissolve-filler-native-tissue/"))])
    a7 = "ฟิลเลอร์ยี่ห้อเดียวกัน ทำไมให้ผลต่างกันในแต่ละคน"
    d7 = "ความแข็ง G′ ความเกาะตัว และการดูดน้ำของเจล เนื้อเยื่อของแต่ละคน ตำแหน่งที่ฉีด และชั้นที่วาง ทำให้ฟิลเลอร์ตัวเดียวกันให้ผลต่างกัน สรุปจากงานวิจัยโดย นพ.เดโชวัต พรมดา"
    build("articles/same-filler-different-results/index.html", a7 + " | Vinfinity Clinic", d7,
          "/articles/same-filler-different-results/", "ฟิลเลอร์ยี่ห้อไหนดี, ฟิลเลอร์ G prime, rheology filler, ฟิลเลอร์ยุบเร็ว, ฟิลเลอร์ปากอยู่ได้กี่เดือน, เลือกฟิลเลอร์, ฟิลเลอร์ อุดรธานี",
          "article-filler-individual.html", [], [article_ld("/articles/same-filler-different-results/", a7, d7, [
              "https://doi.org/10.3390/ijms231810518", "https://doaj.org/article/26e13299973e41ceaf1f5923a06a24d6", "https://doi.org/10.3390/polym16162386",
              "https://doi.org/10.1093/asjof/ojag030", "https://doi.org/10.1097/GOX.0000000000005934"], "2026-10-06"),
              crumb_ld(("บทความ", "/articles/"), ("ฟิลเลอร์ตัวเดียวกัน ผลไม่เหมือนกัน", "/articles/same-filler-different-results/"))])
    a8 = "ใต้ตาแบบไหนฉีดฟิลเลอร์ได้ แบบไหนไม่ควรฉีด"
    d8 = "ร่องใต้ตา ถุงไขมัน คล้ำจากเม็ดสี คล้ำจากเส้นเลือด และบวมน้ำ ต่างกันอย่างไร ใครเหมาะกับฟิลเลอร์ใต้ตา ใครควรเลือกวิธีอื่น พร้อมตัวเลขจากงานวิจัย 2,048 ราย โดย นพ.เดโชวัต พรมดา"
    build("articles/tear-trough-filler-candidates/index.html", a8 + " | Vinfinity Clinic", d8,
          "/articles/tear-trough-filler-candidates/", "ฟิลเลอร์ใต้ตา, ใต้ตาคล้ำ, ถุงใต้ตา, ร่องใต้ตา, ฟิลเลอร์ใต้ตาบวม, ฟิลเลอร์ใต้ตา ใครไม่ควรฉีด, ฟิลเลอร์ใต้ตา อุดร",
          "article-tear-trough-candidates.html", [], [article_ld("/articles/tear-trough-filler-candidates/", a8, d8, [
              "https://doi.org/10.2147/CCID.S301117", "https://doi.org/10.1055/s-0041-1731348", "https://doi.org/10.3390/jpm14111096",
              "https://jcadonline.com/periorbital-hyperpigmentation-a-comprehensive-review/", "https://doi.org/10.20517/2347-9264.2022.28"], "2026-10-07"),
              crumb_ld(("บทความ", "/articles/"), ("ใต้ตาแบบไหนฉีดฟิลเลอร์ได้", "/articles/tear-trough-filler-candidates/"))])
    a9 = "Sculptra, Ellansé กับฟิลเลอร์ HA ต่างกันอย่างไร เลือกแบบไหนดี"
    d9 = "เทียบ Sculptra (PLLA) Ellansé (PCL) และฟิลเลอร์ HA เรื่องการทำงาน เห็นผลเมื่อไร อยู่ได้นานแค่ไหน สลายได้ไหม และเหมาะกับใคร สรุปจากงานวิจัยโดย นพ.เดโชวัต พรมดา"
    build("articles/sculptra-ellanse-vs-ha-filler/index.html", a9 + " | Vinfinity Clinic", d9,
          "/articles/sculptra-ellanse-vs-ha-filler/", "Sculptra กับฟิลเลอร์ ต่างกันอย่างไร, Ellansé, Sculptra Ellanse, PLLA, PCL, ฟิลเลอร์ HA, สารกระตุ้นคอลลาเจน, Sculptra อุดร",
          "article-collagen-stimulators.html", [], [article_ld("/articles/sculptra-ellanse-vs-ha-filler/", a9, d9, [
              "https://doi.org/10.1093/asj/sjaf121", "https://doi.org/10.1007/s00266-025-05412-8", "https://doi.org/10.2147/CCID.S229054",
              "https://doi.org/10.2147/CCID.S385202", "https://doi.org/10.1097/GOX.0000000000005934"], "2026-10-07"),
              crumb_ld(("บทความ", "/articles/"), ("Sculptra, Ellansé กับฟิลเลอร์ HA", "/articles/sculptra-ellanse-vs-ha-filler/"))])
    a10 = "สกินแคร์ก่อนและหลังฉีดหน้า อะไรต้องงด อะไรใช้ต่อได้"
    d10 = "เรตินอล AHA BHA วิตามินซี กันแดด และอาหารเสริม ควรปรับอย่างไรก่อนและหลังฉีดฟิลเลอร์ โบท็อก สกินบูสเตอร์ สรุปจากฉันทามติและงานวิจัยโดย นพ.เดโชวัต พรมดา"
    build("articles/skincare-routine-filler-botox/index.html", a10 + " | Vinfinity Clinic", d10,
          "/articles/skincare-routine-filler-botox/", "สกินแคร์หลังฉีดฟิลเลอร์, หลังฉีดโบท็อก ทาอะไรได้, เรตินอลก่อนฉีดฟิลเลอร์, งดอะไรก่อนฉีดฟิลเลอร์, สกินแคร์หลังสกินบูสเตอร์, ฉีดฟิลเลอร์ อุดร",
          "article-skincare-injectables.html", [], [article_ld("/articles/skincare-routine-filler-botox/", a10, d10, [
              "https://doi.org/10.1093/asjof/ojaf121", "https://doi.org/10.1111/jocd.70880",
              "https://jcadonline.com/minimizing-bruising-following-fillers-and-other-cosmetic-injectables/"], "2026-10-07"),
              crumb_ld(("บทความ", "/articles/"), ("สกินแคร์กับการฉีดหน้า", "/articles/skincare-routine-filler-botox/"))])
    build("doctor/index.html", "นพ.เดโชวัต พรมดา The Filler Architect | ประวัติแพทย์ Vinfinity Clinic อุดรธานี",
          "ประวัติ นพ.เดโชวัต พรมดา แพทย์ผู้ก่อตั้ง Vinfinity Clinic แนวคิด Data-driven precision, Art-driven result ประวัติการสอนแพทย์และนักศึกษา รางวัลในและต่างประเทศ KOL Galderma Vivacy MNB IMCAS",
          "/doctor/", "หมอบาส, นพ.เดโชวัต พรมดา, Dechowat Promda, The Filler Architect, หมอฉีดฟิลเลอร์ อุดร, แพทย์ความงาม อุดรธานี",
          "doctor.html", [], [crumb_ld(("แพทย์", "/doctor/")), {"@context": "https://schema.org", "@type": "ProfilePage", "name": "นพ.เดโชวัต พรมดา", "url": SITE + "/doctor/", "inLanguage": "th", "dateModified": "2026-10-06", "mainEntity": {"@id": SITE + "/#dr-dechowat"}}])
    build("articles/index.html", "บทความ Advanced Injection อ้างอิงงานวิจัย | Vinfinity Clinic",
          "บทความเรื่องฟิลเลอร์ สกินบูสเตอร์ และกายวิภาคใบหน้า เขียนจากงานวิจัยล่าสุดพร้อมเอกสารอ้างอิง โดย นพ.เดโชวัต พรมดา",
          "/articles/", "บทความ ฟิลเลอร์, advanced injection, evidence-based, Vinfinity", "articles.html", [])
    build_en_all()
