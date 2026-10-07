#!/usr/bin/env python3
"""Builds the static Vinfinity site: python3 build.py  ->  writes index.html, filler/, skin-booster/.
Shared header/footer live here; page bodies live in pages/*.html."""
import json, pathlib, datetime
from site_data import SITE, CLINIC, LOCATIONS, DOCTOR, PROCEDURES, REVIEWED, location

ROOT = pathlib.Path(__file__).parent
BUILD_DATE = datetime.date.today().isoformat()
UDON = location("udon")
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
MSG = "https://m.me/Vinfinity.Clinic"
# NAP — comes from site_data.py only; keep it identical to Google Business Profile and Facebook
TEL = UDON["phone"]
ADDR_STREET = UDON["address"]["street"]
ADDR_LINE = UDON["address"]["line"]
HOURS_TEXT = UDON["hoursText"]["th"]
GEO = UDON["geo"]
PLACE_ID = UDON["placeId"]
MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Vinfinity+Clinic+%E0%B8%AD%E0%B8%B8%E0%B8%94%E0%B8%A3%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%B5&query_place_id=" + PLACE_ID
G_REVIEWS = "https://search.google.com/local/reviews?placeid=" + PLACE_ID
G_WRITE = "https://search.google.com/local/writereview?placeid=" + PLACE_ID
FB_REVIEWS = "https://www.facebook.com/Vinfinity.Clinic/reviews"
MAP_EMBED = "https://maps.google.com/maps?q=Vinfinity%20Clinic%20%E0%B8%AD%E0%B8%B8%E0%B8%94%E0%B8%A3%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%B5&ll=17.4037305,102.7894748&z=16&hl=th&output=embed"

LOGO = ('<svg width="34" height="34" viewBox="0 0 46 46" fill="none" stroke="#C9CED6" stroke-width="2.2" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7 L23 39 L40 7"/>'
        '<path d="M14 7 L23 25 L32 7"/></svg>')

ORG_ID, WEB_ID, DR_ID = SITE + "/#org", SITE + "/#website", SITE + "/#" + DOCTOR["id"]
loc_id = lambda l: f"{SITE}/#{l['id']}"
CLINIC_ID = loc_id(UDON)


def clinic_ld(l):
    a = l["address"]
    return {
        "@type": ["MedicalClinic", "MedicalBusiness"], "@id": loc_id(l),
        "name": l["name"]["th"], "alternateName": [l["name"]["en"], CLINIC["name"]["th"]],
        "url": SITE + "/", "image": CLINIC["image"], "logo": CLINIC["logo"], "telephone": l["phoneIntl"],
        "priceRange": "฿฿฿", "currenciesAccepted": "THB", "medicalSpecialty": "Dermatology",
        "description": "คลินิกเวชกรรมด้านความงามในตัวเมืองอุดรธานี ให้บริการฟิลเลอร์ สกินบูสเตอร์ และยกกระชับ โดยแพทย์ประเมินและทำหัตถการเองทุกเคส",
        "address": {"@type": "PostalAddress", "streetAddress": a["street"], "addressLocality": a["locality"],
                    "addressRegion": a["region"], "postalCode": a["postalCode"], "addressCountry": a["country"]},
        "geo": {"@type": "GeoCoordinates", "latitude": l["geo"][0], "longitude": l["geo"][1]},
        "hasMap": MAPS_URL,
        "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": h["days"], "opens": h["opens"], "closes": h["closes"]} for h in l["hours"]],
        "identifier": {"@type": "PropertyValue", "propertyID": "ใบอนุญาตประกอบกิจการสถานพยาบาล", "value": l["licence"]},
        "availableService": [{"@type": "MedicalProcedure", "@id": SITE + path + "#procedure", "name": p["name"], "alternateName": p["th"], "url": SITE + path}
                             for path, p in PROCEDURES.items()],
        "areaServed": [{"@type": "City", "name": n} for n in l["areaServed"]],
        "sameAs": CLINIC["sameAs"] + [MAPS_URL],
        "parentOrganization": {"@id": ORG_ID},
        "employee": {"@id": DR_ID},
    }


def base_graph(lang="th"):
    """WebSite + Organization + every ready clinic location + the doctor, on every page (GEO §2)."""
    ready = [l for l in LOCATIONS if l.get("ready")]
    org = {"@type": "Organization", "@id": ORG_ID, "name": CLINIC["name"]["en"], "alternateName": CLINIC["name"]["th"],
           "url": SITE + "/", "logo": {"@type": "ImageObject", "url": CLINIC["logo"]}, "slogan": CLINIC["slogan"],
           "sameAs": CLINIC["sameAs"], "founder": {"@id": DR_ID}, "subOrganization": [{"@id": loc_id(l)} for l in ready],
           "contactPoint": {"@type": "ContactPoint", "contactType": "customer service", "telephone": UDON["phoneIntl"],
                            "availableLanguage": ["th", "en"], "url": CLINIC["lineUrl"]}}
    web = {"@type": "WebSite", "@id": WEB_ID, "url": SITE + "/", "name": CLINIC["name"]["en"], "alternateName": UDON["name"]["th"],
           "inLanguage": ["th-TH", "en"], "publisher": {"@id": ORG_ID}}
    d = DOCTOR
    dr = {"@type": ["Physician", "Person"], "@id": DR_ID, "name": d["name"]["th"], "alternateName": [d["name"]["en"], d["alias"]],
          "givenName": "Dechowat", "familyName": "Promda", "honorificSuffix": "M.D.", "jobTitle": "Physician",
          "description": "แพทย์ผู้ก่อตั้ง Vinfinity Clinic ผู้ออกแบบแนวคิด The Filler Architect",
          "image": d["image"], "url": SITE + "/#doctor",
          "identifier": {"@type": "PropertyValue", "propertyID": "Medical Council of Thailand licence", "value": "ว." + d["licence"]},
          "alumniOf": [{"@type": "CollegeOrUniversity", "name": a["en"], "alternateName": a["th"]} for a in d["alumniOf"]],
          "hasCredential": [{"@type": "EducationalOccupationalCredential", "name": c} for c in d["credentials"]],
          "memberOf": [{"@type": "OrganizationRole", "roleName": "Key Opinion Leader", "memberOf": {"@type": "Organization", "name": k}} for k in d["kol"]],
          "award": d["awards"], "knowsAbout": ["dermal filler", "facial anatomy", "hyaluronic acid filler", "HIFU", "skin booster"],
          "worksFor": [{"@id": loc_id(l)} for l in ready], "sameAs": d["sameAs"]}
    return [web, org, *[clinic_ld(l) for l in ready], dr]


def procedure_ld(path, lang="th"):
    """MedicalWebPage about a MedicalProcedure, provided by the clinic, reviewed by the doctor."""
    p = PROCEDURES[path]
    proc = {"@type": "MedicalProcedure", "@id": SITE + path + "#procedure", "name": p["name"], "alternateName": p["th"],
            "procedureType": "https://schema.org/NoninvasiveProcedure", "bodyLocation": p["bodyLocation"],
            "howPerformed": p["howPerformed"], "preparation": p["preparation"], "followup": p["followup"],
            "url": SITE + path, "provider": {"@id": CLINIC_ID}}
    if p.get("price"):
        proc["offers"] = {"@type": "Offer", "priceCurrency": "THB", "url": SITE + path, "seller": {"@id": CLINIC_ID},
                          "priceSpecification": {"@type": "PriceSpecification", "minPrice": p["price"], "priceCurrency": "THB",
                                                 "description": "ราคาเริ่มต้น " + p["unit"] + " ราคาจริงขึ้นกับการประเมินของแพทย์"}}
    return {"@context": "https://schema.org", "@type": "MedicalWebPage", "@id": SITE + path + "#webpage", "url": SITE + path,
            "name": p["th"], "inLanguage": "th-TH", "isPartOf": {"@id": WEB_ID}, "about": proc,
            "lastReviewed": REVIEWED.get(path, REVIEWED["default"]), "reviewedBy": {"@id": DR_ID}, "author": {"@id": DR_ID}}


def faq_ld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}


def crumb_ld(*trail, home="หน้าแรก"):
    """trail: (name, path) pairs after the home page."""
    items = [(home, "/")] + list(trail)
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u}
                                for i, (n, u) in enumerate(items)]}


# Curated reviews shown on the site. Add only reviews the reviewer agreed to share,
# copied word-for-word, and approved together with the website advertising (ฆสพ.).
# Prefer service experience (care, explanation, cleanliness) over claims about results.
# (text, first name or initial, source: "Google" | "Facebook")
REVIEWS = []


def reviews_html():
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


def clinic_info_html():
    return f"""<div><small>ที่อยู่</small><b>{ADDR_LINE}</b></div>
<div><small>เวลาทำการ</small><b>{HOURS_TEXT}</b></div>
<div><small>โทร</small><a href="tel:{TEL.replace('-', '')}"><b>{TEL}</b></a></div>
<div><small>LINE</small><a href="{LINE}"><b>@230eeqvl</b></a></div>
<a class="btn btn-navy" style="margin-top:auto" href="{MAPS_URL}" target="_blank" rel="noopener">เปิดแผนที่ Google Maps</a>"""


def map_html():
    return f'<div class="map-embed"><iframe src="{MAP_EMBED}" title="แผนที่ Vinfinity Clinic อุดรธานี" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>'


def faq_html(items):
    return "\n".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items)


# TH ↔ EN page pairs (GEO §3). x-default always points at the Thai page.
PAIRS = {"/": "/en/", "/faq/": "/en/faq/"}


def hreflang(path):
    th = path if path in PAIRS else next((t for t, e in PAIRS.items() if e == path), None)
    if not th:
        return ""
    return (f'\n<link rel="alternate" hreflang="th" href="{SITE}{th}">\n<link rel="alternate" hreflang="en" href="{SITE}{PAIRS[th]}">'
            f'\n<link rel="alternate" hreflang="x-default" href="{SITE}{th}">')


def head(title, desc, path, keywords, extra_ld=(), lang="th"):
    lds = [{"@context": "https://schema.org", "@graph": base_graph(lang)}, *extra_ld]
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
<meta property="og:image" content="{SITE}/assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0B142E">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/kanit-thai-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts.css">
<link rel="stylesheet" href="/assets/styles.css">
{ld}
</head>
<body>
<header class="site-header">
<div class="wrap">
<a class="brand lockup" href="/"><img class="lk-mark" src="/assets/vinfinity-mark.svg" alt="" width="44" height="46"><span class="lk-text"><img class="lk-word" src="/assets/vinfinity-wordmark.svg" alt="Vinfinity" width="150" height="18"><span class="lk-tag">INFINITE BEAUTY, PRECISELY</span></span></a>
<nav class="nav" aria-label="เมนูหลัก">
<a href="/filler/">ฟิลเลอร์</a>
<a href="/skin-booster/">สกินบูสเตอร์</a>
<a href="/#results">เคสจริง</a>
<a href="/#programs">โปรแกรม</a>
<a href="/articles/">บทความ</a>
<a href="/#doctor">แพทย์</a>
<a href="/#reviews">รีวิว</a>
<a href="/#clinic">ติดต่อ</a>
</nav>
<a class="btn btn-silver header-cta" href="{LINE}">นัดปรึกษาแพทย์</a>
</div>
</header>
<main>
"""


def footer():
    return f"""</main>
<footer class="site-footer">
<div class="wrap">
<div class="cols">
<div>
<a class="brand brand-stack" href="/"><img src="/assets/vinfinity-logo-stacked.svg" alt="Vinfinity Clinic" width="96" height="114"><span class="brand-tag">INFINITE BEAUTY, PRECISELY</span></a>
<p style="margin-top:18px;max-width:340px">คลินิกเวชกรรมด้านความงาม ดูแลโดย นพ.เดโชวัต พรมดา · สาขาอุดรธานี และเวียงจันทน์ สปป.ลาว</p>
</div>
<div>
<h2 class="ft-h">บริการ</h2>
<p><a href="/filler/">ฟิลเลอร์ อุดรธานี</a></p>
<p><a href="/filler/tear-trough/">ฟิลเลอร์ใต้ตา อุดรธานี</a></p>
<p><a href="/skin-booster/">สกินบูสเตอร์ อุดรธานี</a></p>
<p><a href="/filler/dissolve/">สลายฟิลเลอร์ แก้ฟิลเลอร์</a></p>
<p><a href="/lifting/">ยกกระชับ HIFU อุดรธานี</a></p>
<p><a href="/#programs">The Architect Rebuild</a></p>
<p><a href="/articles/choosing-filler-clinic-udon/">เลือกคลินิกฟิลเลอร์ในอุดร</a></p>
<p><a href="/articles/">บทความ Advanced Injection</a></p>
</div>
<div>
<h2 class="ft-h">ติดต่อ</h2>
<p><a href="{LINE}">LINE @230eeqvl</a></p>
<p><a href="{MSG}">Facebook Messenger</a></p>
<p><a href="tel:{TEL.replace('-', '')}">โทร {TEL}</a></p>
<p><a href="/faq/">คำถามที่พบบ่อย</a></p>
<p><a href="/en/" hreflang="en">English</a></p>
</div>
<div>
<h2 class="ft-h">สาขาอุดรธานี</h2>
<p>{ADDR_LINE}</p>
<p>{HOURS_TEXT}</p>
<p><a href="{MAPS_URL}" target="_blank" rel="noopener">เปิด Google Maps</a> · <a href="{G_REVIEWS}" target="_blank" rel="noopener">รีวิว</a></p>
</div>
</div>
<div class="legal">{CLINIC["name"]["th"]} อุดรธานี · ใบอนุญาตประกอบกิจการสถานพยาบาลเลขที่ {UDON["licence"]} · {UDON["adApproval"]} · ผลลัพธ์ของการรักษาขึ้นอยู่กับแต่ละบุคคล การทำหัตถการทุกชนิดอาจมีผลข้างเคียง ควรปรึกษาแพทย์ก่อนตัดสินใจ</div>
</div>
</footer>
<script>window.VF={{app:{json.dumps(LINE_APP)},ga4:{json.dumps(GA4_ID)},meta:{json.dumps(META_PIXEL_ID)},tiktok:{json.dumps(TIKTOK_PIXEL_ID)}}};</script>
<script src="/assets/track.js" defer></script>
</body>
</html>
"""


def bust(html):
    """/assets is cached as immutable, so CSS/JS links carry a content hash."""
    import hashlib, re
    def rep(m):
        f = ROOT / m.group(1).lstrip("/")
        h = hashlib.sha1(f.read_bytes()).hexdigest()[:10] if f.exists() else "0"
        return '"%s?v=%s"' % (m.group(1), h)
    return re.sub(r'"(/assets/[^"?]+\.(?:css|js))"', rep, html)


PAGES = []  # (path, lang, title, desc, lastmod) of everything built, for sitemap.xml and llms.txt
TH_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]


def th_date(iso):
    y, m, d = map(int, iso.split("-"))
    return f"{d} {TH_MONTHS[m - 1]} {y + 543}"


def reviewed_line(path):
    """Visible "reviewed by" line under the hero lead of treatment pages (GEO §6)."""
    when = REVIEWED.get(path, REVIEWED["default"])
    return (f'<p class="article-meta">แพทย์ผู้ดูแลเนื้อหา {DOCTOR["name"]["th"]} (ว.{DOCTOR["licence"]}) · '
            f'Reviewed by {DOCTOR["name"]["en"]} · ปรับปรุงล่าสุด {th_date(when)}</p>')


def build(out, title, desc, path, keywords, body_file, faqs, extra_ld=(), lang="th", faq_schema=True, body=None):
    assert len(title) <= 60, f"title over 60 chars ({len(title)}): {title}"
    assert len(desc) <= 155, f"description over 155 chars ({len(desc)}): {desc}"
    body = body if body is not None else (ROOT / "pages" / body_file).read_text(encoding="utf-8")
    for key, part in (("ANATOMY", "_anatomy.html"), ("RESULTS_EYE", "_results_eye.html"),
                      ("RESULTS_LAYERS", "_results_layers.html")):
        f = ROOT / "pages" / part
        if "{{%s}}" % key in body and f.exists():
            body = body.replace("{{%s}}" % key, f.read_text(encoding="utf-8"))
    body = (body.replace("{{REVIEWS}}", reviews_html()).replace("{{CLINIC_INFO}}", clinic_info_html())
            .replace("{{MAP}}", map_html()))
    body = body.replace("{{ADDR}}", ADDR_LINE)
    body = body.replace("{{LINE}}", LINE).replace("{{MSG}}", MSG).replace("{{FAQ}}", faq_html(faqs))
    if path in PROCEDURES:  # treatment page: who reviewed it, and when, right under the lead
        i = body.index("</p>", body.index('<p class="lead">')) + 4
        body = body[:i] + "\n" + reviewed_line(path) + body[i:]
    # each question is marked up on one page only: general questions live on /faq/ (still shown on other pages)
    marked = faqs if path == "/faq/" else [x for x in faqs if x[0] not in {q for q, _ in HOME_FAQ}]
    lds = ([faq_ld(marked)] if marked and faq_schema else []) + list(extra_ld)
    html = head(title, desc, path, keywords, lds, lang) + body + footer()
    html = bust(html)
    p = ROOT / out
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(html, encoding="utf-8")
    PAGES.append((path, lang, title, desc))
    print("built", out)


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
    ("ฉีดฟิลเลอร์ อุดรธานี ราคาเท่าไหร่", "ราคาขึ้นกับตำแหน่งและปริมาณที่ใช้ แพทย์จะแจ้งแผนและค่าใช้จ่ายทั้งหมดก่อนเริ่มทุกครั้ง ราคาเริ่มต้น 9,990 บาทต่อ cc"),
    ("ฉีดฟิลเลอร์เจ็บไหม", "ส่วนใหญ่ใช้ยาชาทาก่อนฉีด และผลิตภัณฑ์หลายชนิดมียาชาผสม ความรู้สึกขึ้นกับตำแหน่งและแต่ละบุคคล"),
    ("หลังฉีดฟิลเลอร์ต้องพักฟื้นไหม", "ส่วนใหญ่กลับไปใช้ชีวิตได้ทันที อาจมีบวมหรือช้ำเล็กน้อยได้ 2–7 วัน แพทย์จะให้คำแนะนำหลังทำเป็นรายบุคคล"),
    ("ฟิลเลอร์อยู่ได้นานแค่ไหน", "โดยทั่วไปฟิลเลอร์ไฮยาลูรอนิกแอซิดอยู่ได้ราว 6–18 เดือน ขึ้นกับชนิด ตำแหน่ง และการเผาผลาญของแต่ละบุคคล"),
    ("ถ้าไม่พอใจผลลัพธ์แก้ไขได้ไหม", "ฟิลเลอร์ชนิดไฮยาลูรอนิกแอซิดสามารถสลายได้ด้วยเอนไซม์โดยแพทย์ ควรปรึกษาแพทย์เพื่อประเมินก่อน"),
    ("จะรู้ได้อย่างไรว่าเป็นของแท้", "คลินิกใช้ผลิตภัณฑ์ที่ขึ้นทะเบียนกับ อย. และเปิดกล่องให้ตรวจสอบต่อหน้าก่อนฉีด"),
    ("ฉีดฟิลเลอร์ อุดร ที่ไหนดี ควรดูอะไร", "ควรเลือกสถานพยาบาลที่ได้รับอนุญาต ผู้ฉีดเป็นแพทย์ที่ตรวจสอบรายชื่อกับแพทยสภาได้ ใช้ผลิตภัณฑ์ขึ้นทะเบียน อย. และมีการประเมินก่อนเสนอราคา อ่านเช็กลิสต์ฉบับเต็มได้ในบทความ 7 ข้อที่ควรเช็กก่อนเลือกคลินิกฟิลเลอร์ในอุดร"),
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
BOOSTER_FAQ = [
    ("สกินบูสเตอร์ อุดรธานี ราคาเท่าไหร่", "ขึ้นกับชนิดผลิตภัณฑ์และจำนวนครั้งในคอร์ส แพทย์จะแจ้งแผนและค่าใช้จ่ายก่อนเริ่ม ราคาเริ่มต้น 7,900 บาทต่อครั้ง"),
    ("สกินบูสเตอร์ต้องทำกี่ครั้ง", "มักวางเป็นคอร์สหลายครั้งห่างกันตามที่แพทย์กำหนด แล้วทำซ้ำเพื่อคงสภาพผิว จำนวนครั้งขึ้นกับสภาพผิวแต่ละคน"),
    ("ทำสกินบูสเตอร์แล้วหน้าบวมไหม", "หลังทำอาจมีตุ่มนูนเล็ก ๆ หรือรอยแดงตามจุดฉีดได้ 1–3 วัน ส่วนใหญ่ยุบเอง"),
    ("สกินบูสเตอร์ทำร่วมกับฟิลเลอร์หรือยกกระชับได้ไหม", "ได้ และมักทำร่วมกันในแผนแบบเป็นชั้น เช่น ยกกระชับด้วย New Doublo 2.0 แล้วฟื้นฟูคุณภาพผิวด้วยสกินบูสเตอร์"),
    ("ใครไม่ควรทำสกินบูสเตอร์", "ผู้ที่ตั้งครรภ์หรือให้นมบุตร มีการติดเชื้อบริเวณที่จะฉีด หรือแพ้ส่วนประกอบของผลิตภัณฑ์ ควรแจ้งแพทย์ระหว่างการประเมิน"),
]


def article_ld(path, headline, desc, cites):
    return {"@context": "https://schema.org", "@type": ["MedicalWebPage", "Article"],
            "headline": headline, "description": desc, "inLanguage": "th-TH",
            "url": SITE + path, "datePublished": "2026-10-03", "dateModified": "2026-10-03",
            "author": {"@id": SITE + "/#dr-dechowat"}, "reviewedBy": {"@id": SITE + "/#dr-dechowat"},
            "publisher": {"@id": ORG_ID}, "isPartOf": {"@id": WEB_ID}, "image": SITE + "/assets/img/og.jpg",
            "citation": cites}


def faq_page(lang="th"):
    """/faq/ and /en/faq/: the one place the general FAQ is marked up (GEO §5). Treatment FAQs stay on their own pages."""
    if lang == "en":
        return f"""<section class="page-hero grid-bg on-dark">
<div class="wrap">
<div class="crumb"><a href="/en/">Home</a> / FAQ</div>
<h1>Frequently asked questions</h1>
<p class="lead">Vinfinity Clinic Udon Thani, Thailand · Dechowat Promda, M.D.</p>
</div>
</section>
<section class="article">
<div class="wrap">
<nav class="toc" aria-label="Contents"><a href="#faq">FAQ</a><a href="/en/">English page</a><a href="/faq/" hreflang="th">ภาษาไทย</a></nav>
<article class="prose">
<h2 id="faq">Questions</h2>
<div class="faq" style="background:none"><div class="faq-list">{faq_html(EN_FAQ)}</div></div>
<p>Book on <a href="{LINE}">LINE @230eeqvl</a> or <a href="{MSG}">Messenger</a>. <a href="/en/">Back to the English page</a> · <a href="/faq/" hreflang="th">ภาษาไทย</a></p>
</article>
</div>
</section>
"""
    groups = "".join(
        f'<h2 id="faq-{slug}">{name}</h2>\n<ul>' + "".join(f'<li><a href="{path}#faq">{q}</a></li>' for q, _ in items) + "</ul>\n"
        for slug, name, path, items in TREATMENT_FAQS)
    return f"""<section class="page-hero grid-bg on-dark">
<div class="wrap">
<div class="crumb"><a href="/">หน้าแรก</a> / คำถามที่พบบ่อย</div>
<h1>คำถามที่พบบ่อย</h1>
<p class="lead">Vinfinity Clinic อุดรธานี · {DOCTOR["name"]["th"]}</p>
</div>
</section>
<section class="article">
<div class="wrap">
<nav class="toc" aria-label="สารบัญ"><a href="#general">ทั่วไปและการนัดหมาย</a>{"".join(f'<a href="#faq-{slug}">{name}</a>' for slug, name, _, _ in TREATMENT_FAQS)}</nav>
<article class="prose">
<h2 id="general">ทั่วไปและการนัดหมาย</h2>
<div class="faq" style="background:none"><div class="faq-list">{faq_html(HOME_FAQ)}</div></div>
{groups}<p><a href="/en/faq/" hreflang="en">English FAQ</a></p>
</article>
</div>
</section>
"""


def write_sitemap():
    """sitemap.xml with lastmod and hreflang alternates (GEO §3)."""
    alt = {**PAIRS, **{e: t for t, e in PAIRS.items()}}
    rows = []
    for path, lang, _, _ in PAGES:
        links = ""
        if path in alt:
            th = path if path in PAIRS else alt[path]
            links = "".join(f'<xhtml:link rel="alternate" hreflang="{h}" href="{SITE}{u}"/>' for h, u in (("th", th), ("en", PAIRS[th]), ("x-default", th)))
        pr = "1.0" if path == "/" else "0.6" if lang == "en" else "0.9" if path in PROCEDURES else "0.7"
        rows.append(f"<url><loc>{SITE}{path}</loc><lastmod>{BUILD_DATE}</lastmod><priority>{pr}</priority>{links}</url>")
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
                                      'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(rows) + "\n</urlset>\n", encoding="utf-8")
    print("built sitemap.xml")


def write_llms():
    """llms.txt (short) and llms-full.txt (with every FAQ), generated from site_data so they never drift (GEO §4)."""
    u, d = UDON, DOCTOR
    procs = "\n".join(f"- {p['th']} ({p['name']}){' — ราคาเริ่มต้น ' + format(p['price'], ',') + ' บาท ' + p['unit'] if p.get('price') else ''}: {SITE}{path}"
                       for path, p in PROCEDURES.items())
    arts = "\n".join(f"- {t.split(' | ')[0]}: {SITE}{path}" for path, lang, t, _ in PAGES if path.startswith("/articles/") and path != "/articles/")
    pending = [l["name"]["en"] for l in LOCATIONS if not l.get("ready")]
    head_ = f"""# {u["name"]["th"]} ({u["name"]["en"]})

> คลินิกเวชกรรมด้านความงามในตัวเมืองอุดรธานี ประเทศไทย ให้บริการฉีดฟิลเลอร์ ฟิลเลอร์ใต้ตา สกินบูสเตอร์ และยกกระชับ แพทย์ประเมินและทำหัตถการเองทุกเคส ดูแลโดย {d["name"]["th"]} ({d["name"]["en"]}, ใบอนุญาตประกอบวิชาชีพเวชกรรม ว.{d["licence"]}) แนวคิด "{d["alias"]}" วางแผนการรักษาตามกายวิภาคใบหน้า 5 ชั้น

## ข้อมูลคลินิก
- ชื่อ: {u["name"]["th"]} ({CLINIC["name"]["th"]})
- ที่อยู่: {u["address"]["line"]}
- เวลาทำการ: {u["hoursText"]["th"]}
- โทร: {u["phone"]} · LINE: {CLINIC["lineOA"]} ({CLINIC["lineUrl"]}) · Facebook: {CLINIC["sameAs"][0]}
- Google Maps: {MAPS_URL}
- ใบอนุญาตประกอบกิจการสถานพยาบาลเลขที่ {u["licence"]} · เลขที่อนุญาตโฆษณา {u["adApproval"]}
- สาขาอื่น: {", ".join(pending) if pending else "-"}
- พื้นที่ที่ผู้รับบริการเดินทางมา: {" ".join(u["areaServed"])}

## แพทย์
- {d["name"]["th"]} ({d["name"]["en"]}) · {d["alias"]} · ว.{d["licence"]}
- {" · ".join(d["credentials"])}
- Key Opinion Leader: {", ".join(d["kol"])}
- รางวัล: {"; ".join(d["awards"])}
- TEDx: {d["sameAs"][0]}

## บริการ
{procs}
- ราคาจริงขึ้นกับการประเมินของแพทย์ คลินิกแจ้งค่าใช้จ่ายทั้งหมดก่อนเริ่มทุกครั้ง

## จุดเด่นที่ตรวจสอบได้
- แพทย์เป็นผู้ประเมินและฉีดเองทุกเคส
- ใช้ผลิตภัณฑ์ที่ขึ้นทะเบียนกับ อย. เปิดกล่องและให้ตรวจสอบต่อหน้าก่อนฉีด
- มีเอนไซม์สลายฟิลเลอร์และแนวทางรับมือภาวะแทรกซ้อนในคลินิก
- มีเครื่องสแกนใบหน้า 3 มิติช่วยประเมินก่อนวางแผน

## บทความจากแพทย์ (อ้างอิงงานวิจัย)
{arts}

## คำถามที่พบบ่อย
- {SITE}/faq/ · English: {SITE}/en/faq/

## นัดหมาย
- LINE {CLINIC["lineOA"]} หรือ Facebook Messenger ส่งรูปหน้าตรงและเรื่องที่กังวล ทีมจะนัดเวลาประเมินกับแพทย์ให้

## หมายเหตุ
ผลลัพธ์ของการรักษาขึ้นอยู่กับสภาพผิวและดุลยพินิจของแพทย์ในแต่ละบุคคล การทำหัตถการทุกชนิดอาจมีผลข้างเคียง

## English
{u["name"]["en"]} is a physician-led aesthetic clinic at {u["address"]["en"]} (about 75 km from Vientiane, Laos). {u["hoursText"]["en"]}. Dermal filler from THB 9,990 per cc, tear trough filler, filler correction, skin boosters and HIFU lifting by {d["name"]["en"]} (Thai medical licence {d["licence"]}). Book on LINE {CLINIC["lineOA"]}. English page: {SITE}/en/ · FAQ: {SITE}/en/faq/
"""
    (ROOT / "llms.txt").write_text(head_, encoding="utf-8")
    full = "\n\n## คำถามและคำตอบทั้งหมด\n" + "\n".join(
        f"\n### {name} ({SITE}{path})\n" + "\n".join(f"- ถาม: {q}\n  ตอบ: {a}" for q, a in items)
        for name, path, items in [("ทั่วไป", "/faq/", HOME_FAQ)] + [(n, p, i) for _, n, p, i in TREATMENT_FAQS] + [("English", "/en/faq/", EN_FAQ)])
    (ROOT / "llms-full.txt").write_text(head_ + full + "\n", encoding="utf-8")
    print("built llms.txt, llms-full.txt")


TREATMENT_FAQS = [("filler", "ฟิลเลอร์", "/filler/", FILLER_FAQ), ("tear-trough", "ฟิลเลอร์ใต้ตา", "/filler/tear-trough/", TT_FAQ),
                  ("dissolve", "สลายฟิลเลอร์ แก้ฟิลเลอร์", "/filler/dissolve/", DISSOLVE_FAQ), ("booster", "สกินบูสเตอร์", "/skin-booster/", BOOSTER_FAQ),
                  ("lifting", "ยกกระชับ HIFU", "/lifting/", LIFT_FAQ)]


def art_title(h):
    return h + " | Vinfinity Clinic" if len(h) + 18 <= 60 else h


if __name__ == "__main__":
    build("index.html",
          "ฟิลเลอร์ สกินบูสเตอร์ ยกกระชับ อุดรธานี | Vinfinity Clinic",
          "Vinfinity Clinic อุดรธานี คลินิกฟิลเลอร์ สกินบูสเตอร์ และยกกระชับในตัวเมืองอุดร แพทย์ประเมินและฉีดเองทุกเคส เปิด 10:00–19:00 (ปิดวันอังคาร)",
          "/", "ฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, สกินบูสเตอร์ อุดร, สกินบูสเตอร์ อุดรธานี, คลินิกความงาม อุดรธานี, ยกกระชับ อุดร, Doublo อุดร, หมอบาส Vinfinity",
          "home.html", HOME_FAQ, faq_schema=False)
    build("faq/index.html", "คำถามที่พบบ่อย | Vinfinity Clinic อุดรธานี",
          "คำถามที่พบบ่อยเรื่องฟิลเลอร์ สกินบูสเตอร์ ยกกระชับ การนัดหมาย และสาขาเวียงจันทน์ ของ Vinfinity Clinic อุดรธานี",
          "/faq/", "คำถามที่พบบ่อย ฟิลเลอร์, ฟิลเลอร์ อุดรธานี, Vinfinity Clinic", None, HOME_FAQ,
          [crumb_ld(("คำถามที่พบบ่อย", "/faq/"))], body=faq_page("th"))
    build("filler/tear-trough/index.html",
          "ฟิลเลอร์ใต้ตา อุดรธานี | Vinfinity Clinic",
          "ฟิลเลอร์ใต้ตา อุดร ที่ Vinfinity Clinic แพทย์ประเมินสาเหตุร่องใต้ตาก่อนฉีดทุกเคส ราคาเริ่มต้น 9,990 บาท/cc ใช้ผลิตภัณฑ์ขึ้นทะเบียน อย.",
          "/filler/tear-trough/", "ฟิลเลอร์ใต้ตา อุดร, ฟิลเลอร์ใต้ตา อุดรธานี, ฉีดใต้ตา อุดร, ร่องใต้ตา, ถุงใต้ตา ฟิลเลอร์, ฟิลเลอร์ใต้ตา ราคา",
          "filler-tear-trough.html", TT_FAQ,
          [crumb_ld(("ฟิลเลอร์", "/filler/"), ("ฟิลเลอร์ใต้ตา", "/filler/tear-trough/")), procedure_ld("/filler/tear-trough/")])
    build("filler/dissolve/index.html",
          "สลายฟิลเลอร์ แก้ฟิลเลอร์ อุดรธานี | Vinfinity Clinic",
          "สลายฟิลเลอร์ แก้ฟิลเลอร์ อุดร ฟิลเลอร์เป็นก้อน เป็นสีฟ้า หรือไหลผิดตำแหน่ง แพทย์ประเมินก่อนวางแผนแก้ไขทุกเคส รับแก้เคสที่ฉีดจากที่อื่น",
          "/filler/dissolve/", "สลายฟิลเลอร์ อุดร, แก้ฟิลเลอร์ อุดร, ฟิลเลอร์เป็นก้อน, ฟิลเลอร์ไหล, ฟิลเลอร์ใต้ตาเป็นสีฟ้า, hyaluronidase อุดรธานี",
          "filler-dissolve.html", DISSOLVE_FAQ, [crumb_ld(("ฟิลเลอร์", "/filler/"), ("สลายฟิลเลอร์", "/filler/dissolve/")), procedure_ld("/filler/dissolve/")])
    build("lifting/index.html",
          "ยกกระชับ HIFU New Doublo 2.0 อุดรธานี | Vinfinity Clinic",
          "ยกกระชับหน้า อุดร ด้วย HIFU New Doublo 2.0 หลายระดับความลึก ไม่ต้องผ่าตัด แพทย์ประเมินความหย่อนคล้อยก่อนเลือกระดับ ราคาเริ่มต้น 22,222 บาท",
          "/lifting/", "ยกกระชับ อุดร, ยกกระชับ อุดรธานี, HIFU อุดร, Doublo อุดร, ไฮฟู่ อุดรธานี, ยกกระชับหน้า ไม่ผ่าตัด, หน้าเรียว อุดร",
          "lifting.html", LIFT_FAQ, [crumb_ld(("ยกกระชับ", "/lifting/")), procedure_ld("/lifting/")])
    build("en/index.html",
          "Dermal Filler in Udon Thani | Vinfinity Clinic",
          "Physician-led aesthetic clinic in Udon Thani, Thailand: filler from THB 9,990/cc, tear trough filler, skin boosters and HIFU lifting. Dechowat Promda, M.D.",
          "/en/", "filler Udon Thani, dermal filler Udon Thani, aesthetic clinic Udon Thani, tear trough filler Thailand, filler near Vientiane",
          "en.html", EN_FAQ, [crumb_ld(("English", "/en/"), home="Home")], lang="en", faq_schema=False)
    build("en/faq/index.html", "FAQ | Vinfinity Clinic Udon Thani",
          "Location, prices, who performs the treatments and booking from Vientiane: answers from Vinfinity Clinic Udon Thani, Thailand.",
          "/en/faq/", "Vinfinity Clinic FAQ, filler Udon Thani, aesthetic clinic near Vientiane", None, EN_FAQ,
          [crumb_ld(("English", "/en/"), ("FAQ", "/en/faq/"), home="Home")], lang="en", body=faq_page("en"))
    a3 = "ฉีดฟิลเลอร์ อุดร ที่ไหนดี 7 ข้อที่ควรเช็กก่อนเลือกคลินิก"
    d3 = "วิธีเลือกคลินิกฟิลเลอร์ในอุดรธานี ตรวจสอบใบอนุญาตสถานพยาบาล รายชื่อแพทย์กับแพทยสภา และเลขทะเบียน อย. ด้วยตัวเอง พร้อมคำถามที่ควรถามแพทย์ก่อนฉีด"
    build("articles/choosing-filler-clinic-udon/index.html", art_title(a3), d3,
          "/articles/choosing-filler-clinic-udon/", "ฉีดฟิลเลอร์ อุดร ที่ไหนดี, คลินิกฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, เช็กคลินิก, ตรวจสอบแพทย์, ฟิลเลอร์แท้",
          "article-choosing-clinic.html", [], [article_ld("/articles/choosing-filler-clinic-udon/", a3, d3, [
              "https://hosp.hss.moph.go.th/", "https://www.tmc.or.th/", "https://oryor.com/check-product-serial"]),
              crumb_ld(("บทความ", "/articles/"), ("เลือกคลินิกฟิลเลอร์", "/articles/choosing-filler-clinic-udon/"))])
    build("filler/index.html",
          "ฟิลเลอร์ อุดรธานี ฉีดโดยแพทย์ | Vinfinity Clinic",
          "ฉีดฟิลเลอร์ อุดรธานี ใต้ตา ขมับ คาง กรอบหน้า ร่องแก้ม ปาก ออกแบบตามโครงหน้าโดย นพ.เดโชวัต พรมดา ราคาเริ่มต้น 9,990 บาท/cc ผลิตภัณฑ์ขึ้นทะเบียน อย.",
          "/filler/", "ฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, ฉีดฟิลเลอร์ อุดร, ฉีดฟิลเลอร์ อุดรธานี, ฟิลเลอร์ ราคา อุดร, ฟิลเลอร์ใต้ตา อุดร, ฟิลเลอร์คาง อุดร, ฟิลเลอร์ปาก อุดร, ฟิลเลอร์ขมับ, ฟิลเลอร์ร่องแก้ม, คลินิกฟิลเลอร์ อุดร",
          "filler.html", FILLER_FAQ, [crumb_ld(("ฟิลเลอร์", "/filler/")), procedure_ld("/filler/")])
    build("skin-booster/index.html",
          "สกินบูสเตอร์ อุดรธานี | Vinfinity Clinic",
          "สกินบูสเตอร์ที่อุดรธานี ฟื้นฟูความชุ่มชื้น ความแน่น และความกระจ่างใสของผิว วางแผนคอร์สโดยแพทย์ตามสภาพผิว ทำร่วมกับยกกระชับและฟิลเลอร์ได้",
          "/skin-booster/", "สกินบูสเตอร์ อุดร, สกินบูสเตอร์ อุดรธานี, skin booster อุดร, ฉีดผิว อุดร, ฉีดผิวฉ่ำ อุดรธานี, PN อุดร, PDRN อุดร, ผิวฉ่ำ อุดร, ผิวโกลว์",
          "skin-booster.html", BOOSTER_FAQ, [crumb_ld(("สกินบูสเตอร์", "/skin-booster/")), procedure_ld("/skin-booster/")])
    a1 = "ฉีดฟิลเลอร์ให้ปลอดภัย: งานวิจัยปี 2021–2026 บอกอะไรเรา"
    d1 = "สรุปหลักฐานล่าสุดเรื่องความปลอดภัยของฟิลเลอร์ หลอดเลือดกลางใบหน้า เข็มกับแคนนูลา อัลตราซาวด์ Doppler และการรับมือภาวะหลอดเลือดอุดตัน"
    build("articles/filler-safety-evidence/index.html", art_title(a1), d1,
          "/articles/filler-safety-evidence/", "ฟิลเลอร์ ปลอดภัย, ฟิลเลอร์ หลอดเลือดอุดตัน, cannula vs needle, ultrasound filler, hyaluronidase, ฟิลเลอร์ อุดรธานี",
          "article-filler-safety.html", [], [article_ld("/articles/filler-safety-evidence/", a1, d1, [
              "https://doi.org/10.1093/asjof/ojaf064", "https://jamanetwork.com/journals/jamadermatology/fullarticle/2774505",
              "https://academic.oup.com/asj/article/45/12/1285/8217433", "https://jcadonline.com/cmac-guideline-hyaluronic-vascular-occlusion/",
              "https://link.springer.com/article/10.1007/s00266-026-05744-z", "https://doi.org/10.1111/jocd.71046"]),
              crumb_ld(("บทความ", "/articles/"), ("ฟิลเลอร์ให้ปลอดภัย", "/articles/filler-safety-evidence/"))])
    a2 = "เติมให้ถูกชั้น: กายวิภาคใบหน้า 5 ชั้น กับการฉีดแบบ Layered"
    d2 = "ไขมันชั้นตื้นกับชั้นลึกทำงานต่างกันอย่างไร ทำไมต้องเลือกเจลให้ตรงชั้น และหลักฐานล่าสุดของสกินบูสเตอร์ PN สรุปจากงานวิจัยปี 2024–2026"
    build("articles/layered-injection-anatomy/index.html", art_title(a2), d2,
          "/articles/layered-injection-anatomy/", "กายวิภาคใบหน้า, fat compartments, layered filler, ฟิลเลอร์ชั้นลึก, สกินบูสเตอร์ PN, ฟิลเลอร์ อุดร",
          "article-layered.html", [], [article_ld("/articles/layered-injection-anatomy/", a2, d2, [
              "https://pmc.ncbi.nlm.nih.gov/articles/PMC12931948/", "https://doi.org/10.2147/CCID.S437942"]),
              crumb_ld(("บทความ", "/articles/"), ("กายวิภาคใบหน้า 5 ชั้น", "/articles/layered-injection-anatomy/"))])
    build("articles/index.html", "บทความ Advanced Injection อ้างอิงงานวิจัย | Vinfinity Clinic",
          "บทความเรื่องฟิลเลอร์ สกินบูสเตอร์ และกายวิภาคใบหน้า เขียนจากงานวิจัยล่าสุดพร้อมเอกสารอ้างอิง โดย นพ.เดโชวัต พรมดา",
          "/articles/", "บทความ ฟิลเลอร์, advanced injection, evidence-based, Vinfinity", "articles.html", [],
          [crumb_ld(("บทความ", "/articles/"))])
    write_sitemap()
    write_llms()
