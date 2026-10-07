"""Site facts — the single source of truth (GEO Phase 1 §1).

Everything public about the clinic and the doctor lives here: build.py imports it for the header, footer,
JSON-LD, sitemap and llms.txt, so NAP and credentials never drift between pages.
Never invent values. A location whose `ready` is False is kept out of every public output until it is filled.
"""

SITE = "https://vinfinityclinic.com"

CLINIC = {
    "name": {"th": "วินฟินิตี้ คลินิกเวชกรรม", "en": "Vinfinity Clinic"},  # TH legal name as on the licence line in the footer
    "url": SITE,
    "logo": SITE + "/assets/vinfinity-logo-stacked.png",
    "image": SITE + "/assets/img/clinic-lounge.jpg",
    "lineOA": "@230eeqvl",
    "lineUrl": "https://line.me/R/ti/p/@230eeqvl",
    "slogan": "INFINITE BEAUTY, PRECISELY",
    "philosophy": "Data-driven precision, Art-driven result",
    "sameAs": [
        "https://www.facebook.com/Vinfinity.Clinic",
        "https://www.instagram.com/vinfinityclinic/",
        "https://line.me/R/ti/p/@230eeqvl",
        # TODO(clinic): YouTube / TikTok channel URLs, if the clinic has them
    ],
}

LOCATIONS = [
    {
        "id": "udon",
        "ready": True,
        "name": {"th": "Vinfinity Clinic อุดรธานี", "en": "Vinfinity Clinic Udon Thani"},
        "licence": "41101001567",
        "adApproval": "ฆสพ.อด.100/2568",
        "address": {
            "street": "106/27-28 อาคารธนารักษ์",
            "locality": "ตำบลหมากแข้ง อำเภอเมืองอุดรธานี",
            "region": "อุดรธานี",
            "postalCode": "41000",
            "country": "TH",
            "line": "106/27-28 อาคารธนารักษ์ ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000",
            "en": "106/27-28 Thanarak Building, Mak Khaeng, Mueang Udon Thani, Udon Thani 41000, Thailand",
        },
        "geo": (17.4037305, 102.7894748),
        "phone": "082-462-2963",
        "phoneIntl": "+66824622963",
        # Closed on Tuesdays
        "hours": [{"days": ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "10:00", "closes": "19:00"}],
        "hoursText": {"th": "เปิดทุกวัน 10:00–19:00 น. (ปิดวันอังคาร)", "en": "Open daily 10:00–19:00, closed on Tuesdays"},
        "placeId": "ChIJ2z9FVIedIzERYDruDs_3xeU",
        "areaServed": ["อุดรธานี", "หนองคาย", "หนองบัวลำภู", "สกลนคร", "ขอนแก่น", "เลย", "เวียงจันทน์"],
    },
    {
        # TODO(clinic): fill every value from the Vientiane licence / Google Business Profile, then set ready=True.
        "id": "vientiane",
        "ready": False,
        "name": {"th": "Vinfinity Clinic เวียงจันทน์", "en": "Vinfinity Clinic Vientiane"},
        "address": {"street": None, "locality": "Vientiane", "region": "Vientiane Capital", "postalCode": None, "country": "LA"},
        "geo": None,
        "phone": None,
        "hours": [],
        "placeId": None,
    },
]

DOCTOR = {
    "id": "dr-dechowat",
    "name": {"th": "นพ.เดโชวัต พรมดา", "en": "Dechowat Promda, M.D."},
    "alias": "The Filler Architect",
    "licence": "48943",  # Medical Council of Thailand (ว.48943)
    "image": SITE + "/assets/img/dr-bas.jpg",
    "alumniOf": [{"th": "มหาวิทยาลัยขอนแก่น", "en": "Khon Kaen University"}],
    "credentials": ["M.D., Khon Kaen University", "AI in Healthcare certification, National University of Singapore (NUS)"],
    # Key-opinion-leader roles. Do NOT list Galderma as a current role.
    "kol": ["Vivacy", "MNB", "IMCAS"],
    "awards": ["Galderma Thailand 2021 — Best Result on Difficult Case"],  # TODO(doctor): add ASEAN/APAC/global awards with exact names
    "sameAs": ["https://youtu.be/94WBbooeqhc"],  # TEDx talk. TODO(doctor): ted.com talk URL, LinkedIn
}

# Procedures shown on the site. Text is taken from the approved page copy; `price` only where the page already publishes it.
PROCEDURES = {
    "/filler/": {
        "name": "Hyaluronic acid dermal filler", "th": "ฉีดฟิลเลอร์",
        "bodyLocation": "ใต้ตา ขมับ คาง กรอบหน้า ร่องแก้ม ปาก",
        "howPerformed": "แพทย์ประเมินโครงหน้าแล้วฉีดเจลไฮยาลูรอนิกแอซิด (HA) ที่ขึ้นทะเบียน อย. ในชั้นและตำแหน่งที่วางแผนไว้",
        "preparation": "ปรึกษาและประเมินโดยแพทย์ก่อนทุกครั้ง แจ้งประวัติแพ้ยา โรคประจำตัว และหัตถการที่เคยทำ",
        "followup": "อาจบวมหรือช้ำเล็กน้อย 2–7 วัน แพทย์นัดติดตามผลตามความเหมาะสม",
        "price": 9990, "unit": "ต่อ cc",
    },
    "/filler/tear-trough/": {
        "name": "Tear trough filler", "th": "ฟิลเลอร์ใต้ตา",
        "bodyLocation": "ร่องใต้ตา",
        "howPerformed": "แพทย์แยกสาเหตุของร่องใต้ตาก่อน แล้วจึงเติมเจลไฮยาลูรอนิกแอซิดชนิดนุ่มเมื่อเหมาะสม",
        "preparation": "ประเมินว่าเป็นร่อง ถุงไขมัน สีผิว หรือเส้นเลือด ก่อนตัดสินใจฉีด",
        "followup": "ส่วนใหญ่บวมหรือช้ำเล็กน้อย 2–7 วัน นัดติดตามผลเป็นระยะ",
        "price": 9990, "unit": "ต่อ cc",
    },
    "/filler/dissolve/": {
        "name": "Hyaluronic acid filler correction (hyaluronidase)", "th": "สลายฟิลเลอร์ แก้ฟิลเลอร์",
        "bodyLocation": "ตำแหน่งที่เคยฉีดฟิลเลอร์",
        "howPerformed": "แพทย์ประเมินสาเหตุก่อน แล้วสลายฟิลเลอร์ชนิดไฮยาลูรอนิกแอซิดด้วยเอนไซม์ไฮยาลูโรนิเดส",
        "preparation": "แจ้งแพทย์ว่าเคยฉีดผลิตภัณฑ์อะไร ที่ไหน เมื่อไหร่ ถ้ามีข้อมูลหรือรูปก่อนฉีดให้นำมาด้วย",
        "followup": "อาจบวมหรือแดงเล็กน้อย 1–3 วัน ควรรอประมาณ 2 สัปดาห์ก่อนประเมินเติมใหม่",
    },
    "/skin-booster/": {
        "name": "Skin booster injection", "th": "สกินบูสเตอร์",
        "bodyLocation": "ผิวหน้า",
        "howPerformed": "ฉีดสารบำรุงเข้าสู่ชั้นผิวโดยตรงเป็นคอร์สตามที่แพทย์วางแผน",
        "preparation": "แพทย์ประเมินสภาพผิวและวางแผนจำนวนครั้ง",
        "followup": "อาจมีตุ่มนูนเล็ก ๆ หรือรอยแดงตามจุดฉีด 1–3 วัน",
        "price": 7900, "unit": "ต่อครั้ง",
    },
    "/lifting/": {
        "name": "HIFU lifting (New Doublo 2.0 Multilayer Lifting)", "th": "ยกกระชับ HIFU New Doublo 2.0",
        "bodyLocation": "ใบหน้าและลำคอ",
        "howPerformed": "คลื่นอัลตราซาวด์โฟกัส (HIFU) หลายระดับความลึก ชั้นพังผืด ชั้นไขมัน และชั้นผิว ไม่ต้องผ่าตัด",
        "preparation": "แพทย์ประเมินความหย่อนคล้อยและเลือกระดับความลึกให้เหมาะกับแต่ละคน",
        "followup": "ส่วนใหญ่กลับไปใช้ชีวิตได้ทันที อาจมีแดงหรือบวมเล็กน้อยระยะสั้น",
        "price": 22222, "unit": "ต่อครั้ง",
    },
}

# Date the medical content of each page was last reviewed by the doctor (shown on the page and in JSON-LD).
REVIEWED = {"default": "2026-10-03"}


def location(loc_id="udon"):
    return next(l for l in LOCATIONS if l["id"] == loc_id)
