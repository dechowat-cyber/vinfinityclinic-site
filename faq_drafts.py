"""Starter FAQ list from the GEO Phase 1 brief (§8). DRAFTS ONLY — nothing here is published.

Answers are written and approved separately (doctor + ฆสพ.), then moved into the FAQ lists in build.py,
which renders them on the page and in FAQPage markup. Keep answers 40–80 words with a direct first sentence.
"""

FAQ_DRAFTS = [
    # (lang, topic, related page, question)
    ("th", "filler", "/filler/", "ฟิลเลอร์อยู่ได้นานแค่ไหน"),
    ("th", "filler", "/filler/", "ฉีดฟิลเลอร์เจ็บไหม พักฟื้นกี่วัน"),
    ("th", "filler", "/filler/", "The Filler Architect 12 สัปดาห์ต่างจากฉีดครั้งเดียวอย่างไร"),
    ("th", "doublo", "/lifting/", "New Doublo 2.0 ต่างจาก HIFU ทั่วไปอย่างไร"),
    ("th", "general", "/faq/", "ใครเป็นแพทย์ผู้ทำหัตถการ"),
    ("th", "booking", "/faq/", "จองคิวอย่างไร"),
    ("th", "foreigner", "/faq/", "มีบริการสำหรับลูกค้าจากลาวไหม"),
    ("en", "filler", "/en/faq/", "How long do fillers last?"),
    ("en", "filler", "/en/faq/", "Is there downtime after filler?"),
    ("en", "general", "/en/faq/", "Who performs the treatments?"),
    ("en", "foreigner", "/en/faq/", "Do you speak English / serve foreign clients?"),
    ("en", "booking", "/en/faq/", "How do I book from Laos or abroad?"),
    ("en", "general", "/en/faq/", "What is the Face Architecture Report?"),
]
REVIEWED_BY = "dr-dechowat"
STATUS = "draft"  # never rendered while draft
