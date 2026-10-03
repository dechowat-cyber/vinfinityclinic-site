#!/usr/bin/env python3
"""Builds the static Vinfinity site: python3 build.py  ->  writes index.html, filler/, skin-booster/.
Shared header/footer live here; page bodies live in pages/*.html."""
import json, pathlib

ROOT = pathlib.Path(__file__).parent
SITE = "https://vinfinityclinic.com"
LINE = "https://line.me/R/ti/p/@vinfinityclinic"
MSG = "https://m.me/Vinfinity.Clinic"
TEL = "082-462-2963"

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
    "image": SITE + "/assets/img/reception.jpg",
    "logo": SITE + "/assets/vinfinity-logo-stacked.png",
    "telephone": "+66824622963",
    "priceRange": "฿฿฿",
    "medicalSpecialty": "Dermatology",
    "address": {"@type": "PostalAddress", "addressLocality": "อุดรธานี",
                "addressRegion": "อุดรธานี", "addressCountry": "TH"},
    "areaServed": ["อุดรธานี", "ขอนแก่น", "หนองคาย", "เวียงจันทน์"],
    "sameAs": ["https://www.facebook.com/Vinfinity.Clinic", "https://www.instagram.com/vinfinityclinic/"],
    "founder": {"@id": SITE + "/#dr-dechowat"},
}
DOCTOR_LD = {
    "@context": "https://schema.org", "@type": "Physician", "@id": SITE + "/#dr-dechowat",
    "name": "นพ.เดโชวัต พรมดา", "alternateName": "Dechowat Promda, M.D.",
    "description": "แพทย์ผู้ก่อตั้ง Vinfinity Clinic ผู้ออกแบบแนวคิด The Filler Architect",
    "image": SITE + "/assets/img/dr-bas.jpg",
    "alumniOf": {"@type": "CollegeOrUniversity", "name": "มหาวิทยาลัยขอนแก่น"},
    "worksFor": {"@id": SITE + "/#clinic"},
}


def faq_ld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}


def faq_html(items):
    return "\n".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items)


def head(title, desc, path, keywords, extra_ld=()):
    lds = [CLINIC_LD, DOCTOR_LD, *extra_ld]
    ld = "\n".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in lds)
    url = SITE + path
    return f"""<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="keywords" content="{keywords}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:locale" content="th_TH">
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
<a class="brand lockup" href="/" aria-label="Vinfinity Clinic หน้าแรก"><img class="lk-mark" src="/assets/vinfinity-mark.svg" alt="" width="44" height="46"><span class="lk-text"><img class="lk-word" src="/assets/vinfinity-wordmark.svg" alt="Vinfinity" width="150" height="18"><span class="lk-tag">INFINITE BEAUTY, PRECISELY</span></span></a>
<nav class="nav" aria-label="เมนูหลัก">
<a href="/filler/">ฟิลเลอร์</a>
<a href="/skin-booster/">สกินบูสเตอร์</a>
<a href="/#programs">โปรแกรม</a>
<a href="/articles/">บทความ</a>
<a href="/#doctor">แพทย์</a>
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
<h4>บริการ</h4>
<p><a href="/filler/">ฟิลเลอร์ อุดรธานี</a></p>
<p><a href="/skin-booster/">สกินบูสเตอร์ อุดรธานี</a></p>
<p><a href="/#programs">ยกกระชับ New Doublo 2.0</a></p>
<p><a href="/#programs">The Architect Rebuild</a></p>
<p><a href="/articles/">บทความ Advanced Injection</a></p>
</div>
<div>
<h4>ติดต่อ</h4>
<p><a href="{LINE}">LINE @vinfinityclinic</a></p>
<p><a href="{MSG}">Facebook Messenger</a></p>
<p><a href="tel:{TEL.replace('-', '')}">โทร {TEL}</a></p>
</div>
</div>
<div class="legal">วินฟินิตี้ คลินิกเวชกรรม อุดรธานี · ใบอนุญาตประกอบกิจการสถานพยาบาลเลขที่ [เลขใบอนุญาต] · ฆสพ.อด.[เลขที่ ฆสพ. ของเว็บไซต์] · ผลลัพธ์ของการรักษาขึ้นอยู่กับแต่ละบุคคล การทำหัตถการทุกชนิดอาจมีผลข้างเคียง ควรปรึกษาแพทย์ก่อนตัดสินใจ</div>
</div>
</footer>
</body>
</html>
"""


def build(out, title, desc, path, keywords, body_file, faqs, extra_ld=()):
    body = (ROOT / "pages" / body_file).read_text(encoding="utf-8")
    anat = ROOT / "pages" / "_anatomy.html"
    if "{{ANATOMY}}" in body and anat.exists():
        body = body.replace("{{ANATOMY}}", anat.read_text(encoding="utf-8"))
    body = body.replace("{{LINE}}", LINE).replace("{{MSG}}", MSG).replace("{{FAQ}}", faq_html(faqs))
    lds = ([faq_ld(faqs)] if faqs else []) + list(extra_ld)
    html = head(title, desc, path, keywords, lds) + body + footer()
    p = ROOT / out
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(html, encoding="utf-8")
    print("built", out)


HOME_FAQ = [
    ("ใครเป็นผู้ทำหัตถการ", "แพทย์เป็นผู้ประเมินและทำหัตถการเองทุกเคส โดย นพ.เดโชวัต พรมดา ดูแลการวางแผนการรักษาของคลินิก"),
    ("ฟิลเลอร์กับสกินบูสเตอร์ต่างกันอย่างไร", "ฟิลเลอร์ใช้เติมหรือปรับโครงสร้างในตำแหน่งที่ต้องการ ส่วนสกินบูสเตอร์ใช้ฟื้นฟูคุณภาพผิว เช่น ความชุ่มชื้นและความแน่น ทั้งสองอย่างมักใช้ร่วมกันในแผนการรักษาแบบเป็นชั้น"),
    ("ต้องทำกี่ครั้งถึงจะเห็นผล", "ขึ้นกับหัตถการและสภาพผิวของแต่ละคน แพทย์จะแจ้งจำนวนครั้งและระยะห่างหลังการประเมิน"),
    ("ผลลัพธ์อยู่ได้นานแค่ไหน", "ขึ้นกับชนิดผลิตภัณฑ์ ตำแหน่ง และการเผาผลาญของแต่ละบุคคล แพทย์จะแนะนำช่วงเวลานัดติดตามผลให้เหมาะกับแต่ละคน"),
    ("นัดปรึกษาอย่างไร", "ทัก LINE @vinfinityclinic หรือ Facebook Messenger ส่งรูปหน้าตรงและเรื่องที่กังวล ทีมจะนัดเวลาประเมินกับแพทย์ให้"),
    ("มีสาขาที่ลาวไหม", "มีสาขาเวียงจันทน์ สปป.ลาว และสาขาอุดรธานี ลูกค้าจากลาวสามารถนัดล่วงหน้าเพื่อเดินทางมาทำที่อุดรธานีได้"),
]
FILLER_FAQ = [
    ("ฉีดฟิลเลอร์ อุดรธานี ราคาเท่าไหร่", "ราคาขึ้นกับตำแหน่งและปริมาณที่ใช้ แพทย์จะแจ้งแผนและค่าใช้จ่ายทั้งหมดก่อนเริ่มทุกครั้ง ราคาเริ่มต้น 9,990 บาทต่อ cc"),
    ("ฉีดฟิลเลอร์เจ็บไหม", "ส่วนใหญ่ใช้ยาชาทาก่อนฉีด และผลิตภัณฑ์หลายชนิดมียาชาผสม ความรู้สึกขึ้นกับตำแหน่งและแต่ละบุคคล"),
    ("หลังฉีดฟิลเลอร์ต้องพักฟื้นไหม", "ส่วนใหญ่กลับไปใช้ชีวิตได้ทันที อาจมีบวมหรือช้ำเล็กน้อยได้ 2–7 วัน แพทย์จะให้คำแนะนำหลังทำเป็นรายบุคคล"),
    ("ฟิลเลอร์อยู่ได้นานแค่ไหน", "โดยทั่วไปฟิลเลอร์ไฮยาลูรอนิกแอซิดอยู่ได้ราว 6–18 เดือน ขึ้นกับชนิด ตำแหน่ง และการเผาผลาญของแต่ละบุคคล"),
    ("ถ้าไม่พอใจผลลัพธ์แก้ไขได้ไหม", "ฟิลเลอร์ชนิดไฮยาลูรอนิกแอซิดสามารถสลายได้ด้วยเอนไซม์โดยแพทย์ ควรปรึกษาแพทย์เพื่อประเมินก่อน"),
    ("จะรู้ได้อย่างไรว่าเป็นของแท้", "คลินิกใช้ผลิตภัณฑ์ที่ขึ้นทะเบียนกับ อย. และเปิดกล่องให้ตรวจสอบต่อหน้าก่อนฉีด"),
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
            "headline": headline, "description": desc, "inLanguage": "th",
            "url": SITE + path, "datePublished": "2026-10-03", "dateModified": "2026-10-03",
            "author": {"@id": SITE + "/#dr-dechowat"}, "reviewedBy": {"@id": SITE + "/#dr-dechowat"},
            "publisher": {"@id": SITE + "/#clinic"}, "image": SITE + "/assets/img/og.jpg",
            "citation": cites}


if __name__ == "__main__":
    build("index.html",
          "ฟิลเลอร์ สกินบูสเตอร์ ยกกระชับ อุดรธานี | Vinfinity Clinic โดย นพ.เดโชวัต",
          "คลินิกความงามอุดรธานี ฟิลเลอร์ สกินบูสเตอร์ และยกกระชับ New Doublo 2.0 ออกแบบการรักษาเป็นชั้นเฉพาะใบหน้า ประเมินและทำโดยแพทย์ทุกเคส นัดปรึกษาทาง LINE @vinfinityclinic",
          "/", "ฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, สกินบูสเตอร์ อุดร, สกินบูสเตอร์ อุดรธานี, คลินิกความงาม อุดรธานี, ยกกระชับ อุดร, Doublo อุดร, หมอบาส Vinfinity",
          "home.html", HOME_FAQ)
    build("filler/index.html",
          "ฟิลเลอร์ อุดรธานี ฉีดโดยแพทย์ ออกแบบตามโครงหน้า | Vinfinity Clinic",
          "ฉีดฟิลเลอร์ที่อุดรธานี ใต้ตา ขมับ คาง กรอบหน้า ร่องแก้ม ออกแบบตามโครงสร้างใบหน้าโดย นพ.เดโชวัต พรมดา ใช้ผลิตภัณฑ์ขึ้นทะเบียน อย. เปิดกล่องตรวจสอบต่อหน้า",
          "/filler/", "ฟิลเลอร์ อุดร, ฟิลเลอร์ อุดรธานี, ฉีดฟิลเลอร์ อุดรธานี, ฟิลเลอร์ใต้ตา อุดร, ฟิลเลอร์คาง อุดร, ฟิลเลอร์ขมับ, ฟิลเลอร์ราคา อุดร",
          "filler.html", FILLER_FAQ)
    build("skin-booster/index.html",
          "สกินบูสเตอร์ อุดรธานี ฟื้นฟูคุณภาพผิวจากชั้นลึก | Vinfinity Clinic",
          "สกินบูสเตอร์ที่อุดรธานี ฟื้นฟูความชุ่มชื้น ความแน่น และความกระจ่างใสของผิว วางแผนคอร์สโดยแพทย์ตามสภาพผิว ทำร่วมกับยกกระชับและฟิลเลอร์ได้",
          "/skin-booster/", "สกินบูสเตอร์ อุดร, สกินบูสเตอร์ อุดรธานี, skin booster อุดร, PN อุดร, ฉีดผิว อุดรธานี, ผิวฉ่ำ อุดร",
          "skin-booster.html", BOOSTER_FAQ)
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
    build("articles/index.html", "บทความ Advanced Injection อ้างอิงงานวิจัย | Vinfinity Clinic",
          "บทความเรื่องฟิลเลอร์ สกินบูสเตอร์ และกายวิภาคใบหน้า เขียนจากงานวิจัยล่าสุดพร้อมเอกสารอ้างอิง โดย นพ.เดโชวัต พรมดา",
          "/articles/", "บทความ ฟิลเลอร์, advanced injection, evidence-based, Vinfinity", "articles.html", [])
