"""Render the illustrations for /articles/facial-ligaments-aging/ (TH + EN).

Usage: python3 tools/make_ligament_figs.py
Writes assets/img/articles/[en/]facial-ligaments-aging-{anchor,findings}.{jpg,webp} at 1600x900.
Needs Playwright (Chromium) and Pillow.
"""
import io
import math
import random
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "assets" / "fonts"
LOGO = (ROOT / "assets" / "vinfinity-logo-h.svg").read_text(encoding="utf-8")

NAVY = "#041738"
SILVER = "#C9CED6"

T = {
    "th": {
        "eyebrow": "THE ARCHITECTURE OF A FACE",
        "a_title": "เอ็นไม่ได้ยืด<br>เนื้อเยื่อรอบเอ็น<br>ต่างหากที่หย่อน",
        "a_sub": "เอ็นยึดใบหน้าเปรียบเหมือนหมุดที่ตรึงผิวไว้กับกระดูก งานวิจัยใหม่พบว่าหมุดยังแน่น แต่ผ้าที่ขึงระหว่างหมุดหย่อนลง",
        "old": "ความเชื่อเดิม", "old_d": "เอ็นยืด ทั้งหน้าเลื่อนลง",
        "new": "แนวคิดใหม่", "new_d": "เอ็นยึดแน่น เนื้อเยื่อระหว่างเอ็นหย่อน",
        "skin": "ผิวและไขมัน", "lig": "เอ็นยึด", "bone": "กระดูก",
        "note": "ภาพประกอบเชิงแนวคิด ไม่ได้แสดงสัดส่วนจริง",
        "src": "อ้างอิงตามบทความ: Zhang et al., Aesthet Surg J 2023 · Cotofana",
        "f_title": "อายุมากขึ้น<br>เอ็นแข็งขึ้น ไม่ได้หลวม",
        "f_sub": "เอ็นโหนกแก้มของหนู 3 ช่วงวัย ตรวจด้วยพยาธิวิทยา การย้อม<span style=\"white-space:nowrap\">คอลลาเจน</span> และกล้องจุลทรรศน์อิเล็กตรอน",
        "ages": ["อายุน้อย", "วัยกลางคน", "สูงวัย"],
        "rows": [("ความหลวม", "ไม่เพิ่ม", "="), ("ความแข็ง", "เพิ่มขึ้น", "up"), ("มัดคอลลาเจน", "หนาขึ้น", "up"),
                 ("การเรียงตัวของเส้นใย", "เป็นระเบียบขึ้น", "up"), ("หลอดเลือด", "ลดลง", "down")],
        "f_note": "ภาพประกอบเชิงแนวคิด · งานในสัตว์ทดลอง ยังต้องยืนยันในคน",
        "f_src": "Zhang et al. Aesthetic Surgery Journal 2023 · doi:10.1093/asj/sjad235",
        "by": "นพ.เดโชวัต พรมดา",
    },
    "en": {
        "eyebrow": "THE ARCHITECTURE OF A FACE",
        "a_title": "Ligaments hold.<br>The tissue around<br>them descends.",
        "a_sub": "Facial ligaments work like pins holding skin to bone. New research suggests the pins stay firm, while the fabric between them sags.",
        "old": "Old belief", "old_d": "Ligaments stretch; face slides down",
        "new": "Newer view", "new_d": "Ligaments hold; tissue between sags",
        "skin": "Skin and fat", "lig": "Ligament", "bone": "Bone",
        "note": "Conceptual illustration, not to scale",
        "src": "Based on: Zhang et al., Aesthet Surg J 2023 · Cotofana",
        "f_title": "With age, ligaments<br>stiffen, not loosen",
        "f_sub": "Rat zygomatic ligament at three ages, studied with histology, collagen staining and electron microscopy",
        "ages": ["Young", "Middle-aged", "Older"],
        "rows": [("Laxity", "No increase", "="), ("Stiffness", "Higher", "up"), ("Collagen bundles", "Thicker", "up"),
                 ("Fibre alignment", "More ordered", "up"), ("Blood vessels", "Fewer", "down")],
        "f_note": "Conceptual illustration · Animal study, not yet confirmed in people",
        "f_src": "Zhang et al. Aesthetic Surgery Journal 2023 · doi:10.1093/asj/sjad235",
        "by": "Dechowat Promda, M.D.",
    },
}


def css():
    faces = []
    for w in (300, 400, 500, 600):
        faces.append(f"@font-face{{font-family:Kanit;font-weight:{w};src:url('{(FONTS / f'kanit-thai-{w}-normal.woff2').as_uri()}')}}")
    for w in (400, 500, 600, 700):
        faces.append(f"@font-face{{font-family:Montserrat;font-weight:{w};src:url('{(FONTS / f'montserrat-latin-{w}-normal.woff2').as_uri()}')}}")
    return "\n".join(faces) + f"""
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:1600px;height:900px;overflow:hidden;font-family:Montserrat,Kanit,sans-serif;color:#fff;
  background:radial-gradient(1200px 700px at 78% 30%,#1d3a7a 0%,#11275a 45%,{NAVY} 100%)}}
.eyebrow{{font:500 17px Montserrat;letter-spacing:.38em;color:{SILVER}}}
h1{{font-family:Kanit,Montserrat;font-weight:600;font-size:60px;line-height:1.12;margin-top:22px}}
.sub{{font:400 22px/1.6 Kanit,Montserrat;color:#c7d0e3;margin-top:24px}}
.foot{{position:absolute;left:0;right:0;bottom:0;height:78px;border-top:1px solid rgba(255,255,255,.12);
  display:flex;align-items:center;justify-content:space-between;padding:0 84px;background:rgba(2,10,28,.35)}}
.foot svg{{height:36px;width:auto}}
.foot .r{{font:400 19px Montserrat,Kanit;color:#c7d0e3;letter-spacing:.02em}}
.foot .r b{{font-family:Kanit,Montserrat;font-weight:600;color:#fff}}
.small{{font:400 15px/1.5 Kanit,Montserrat;color:#93a0bd}}
"""


def foot(t):
    return f'<div class="foot">{LOGO}<div class="r">vinfinityclinic.com · <b>{t["by"]}</b></div></div>'


def panel(x, title, desc, mode, t):
    """One schematic: bone at bottom, 3 ligaments, skin/fat surface hanging between them."""
    w, top, boneY = 330, 150, 470
    pins = [x + 40, x + 165, x + 290]
    g = [f'<text x="{x + w / 2}" y="40" text-anchor="middle" font-family="Kanit,Montserrat" font-weight="600" font-size="26" fill="#fff">{title}</text>',
         f'<text x="{x + w / 2}" y="74" text-anchor="middle" font-family="Kanit,Montserrat" font-size="17" fill="#c7d0e3">{desc}</text>',
         f'<rect x="{x}" y="{boneY}" width="{w}" height="70" rx="10" fill="#e7eaf0" opacity=".92"/>']
    if mode == "old":
        # whole surface drops uniformly; ligaments drawn as stretched springs
        skinY = top + 95
        g.append(f'<path d="M{x} {top} L{x + w} {top}" stroke="#fff" stroke-opacity=".28" stroke-dasharray="6 7" stroke-width="2"/>')
        g.append(f'<rect x="{x}" y="{skinY}" width="{w}" height="74" rx="14" fill="#b9c4dc" opacity=".88"/>')
        for px in pins:
            pts = []
            n = 14
            for i in range(n + 1):
                yy = skinY + 74 + (boneY - skinY - 74) * i / n
                xx = px + (14 if i % 2 else -14) * (0 if i in (0, n) else 1)
                pts.append(f"{xx:.1f},{yy:.1f}")
            g.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{SILVER}" stroke-width="5" stroke-linejoin="round"/>')
        for px in pins:
            g.append(f'<path d="M{px} {top + 14} L{px} {skinY - 10}" stroke="#ffb27a" stroke-width="3" marker-end="url(#ar)"/>')
    else:
        # pins fixed at original height; tissue between pins hangs in arcs
        g.append(f'<path d="M{x} {top} L{x + w} {top}" stroke="#fff" stroke-opacity=".28" stroke-dasharray="6 7" stroke-width="2"/>')
        d = f"M{pins[0]} {top - 30} L{pins[0]} {top + 40}"
        for a, b in zip(pins, pins[1:]):
            d += f" Q{(a + b) / 2} {top + 175} {b} {top + 40}"
        d += f" L{pins[-1]} {top - 30} Z"
        g.append(f'<path d="{d}" fill="#b9c4dc" opacity=".88"/>')
        for px in pins:
            g.append(f'<rect x="{px - 8}" y="{top + 36}" width="16" height="{boneY - top - 36}" rx="7" fill="{SILVER}"/>')
            g.append(f'<circle cx="{px}" cy="{top + 40}" r="10" fill="#fff"/>')
        for a, b in zip(pins, pins[1:]):
            mid = (a + b) / 2
            g.append(f'<path d="M{mid} {top + 22} L{mid} {top + 80}" stroke="#ffb27a" stroke-width="3" marker-end="url(#ar)"/>')
    return "\n".join(g)


def anchor_html(t):
    svg = f"""<svg width="760" height="620" viewBox="0 0 760 620" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#ffb27a"/></marker></defs>
{panel(10, t["old"], t["old_d"], "old", t)}
{panel(420, t["new"], t["new_d"], "new", t)}
<line x1="385" y1="110" x2="385" y2="540" stroke="#fff" stroke-opacity=".15"/>
<g font-family="Kanit,Montserrat" font-size="16" fill="#0b1a3e" font-weight="500">
<text x="175" y="{150 + 135}" text-anchor="middle" fill="#1b2d55">{t["skin"]}</text>
<text x="585" y="{150 - 6}" text-anchor="middle" fill="#1b2d55">{t["skin"]}</text>
<text x="{420 + 175}" y="505" text-anchor="start" fill="#1b2d55">{t["bone"]}</text>
<text x="25" y="505" fill="#1b2d55">{t["bone"]}</text>
</g>
<g font-family="Kanit,Montserrat" font-size="16" fill="{SILVER}"><text x="{420 + 40 + 18}" y="420">{t["lig"]}</text><text x="{10 + 40 + 24}" y="380">{t["lig"]}</text></g>
<text x="10" y="600" font-family="Kanit,Montserrat" font-size="15" fill="#93a0bd">{t["note"]}</text>
</svg>"""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{css()}</style></head><body>
<div style="position:absolute;left:84px;top:96px;width:620px">
<div class="eyebrow">{t["eyebrow"]}</div><h1>{t["a_title"]}</h1><div class="sub">{t["a_sub"]}</div>
<div class="small" style="margin-top:60px">{t["src"]}</div></div>
<div style="position:absolute;left:770px;top:110px">{svg}</div>
{foot(t)}</body></html>"""


def fibres(cx, stage):
    """Conceptual collagen bundle drawing for one age group. stage 0..2."""
    rnd = random.Random(7 + stage)
    w, h, y0 = 250, 250, 0
    x0 = cx - w / 2
    out = [f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="20" fill="#0b1f4a" stroke="#ffffff" stroke-opacity=".14"/>']
    out.append(f'<clipPath id="c{stage}"><rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="20"/></clipPath><g clip-path="url(#c{stage})">')
    n = [11, 8, 6][stage]
    thick = [4, 8, 13][stage]
    wave = [22, 10, 3][stage]
    jitter = [0.55, 0.25, 0.05][stage]
    for i in range(n):
        y = y0 + (i + 0.5) * h / n
        ang = rnd.uniform(-jitter, jitter)
        freq, phase = rnd.uniform(1.5, 2.5) * [1.6, 1.2, 1][stage], rnd.uniform(0, 6.28)
        amp = wave * rnd.uniform(.6, 1)
        pts = []
        for k in range(41):
            xx = x0 - 10 + (w + 20) * k / 40
            yy = y + math.sin(k / 40 * math.pi * freq + phase) * amp + (xx - cx) * ang
            pts.append(f"{xx:.1f},{yy:.1f}")
        out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{SILVER}" stroke-opacity=".85" stroke-width="{thick}" stroke-linecap="round"/>')
    vessels = [7, 4, 1][stage]
    for _ in range(vessels):
        vx, vy = rnd.uniform(x0 + 30, x0 + w - 30), rnd.uniform(y0 + 30, y0 + h - 30)
        out.append(f'<circle cx="{vx:.0f}" cy="{vy:.0f}" r="11" fill="#d9605a" stroke="#fff" stroke-width="3" opacity=".95"/>')
    out.append("</g>")
    return "\n".join(out)


def findings_html(t):
    cols = [930, 1185, 1440]
    svg = ['<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" style="position:absolute;left:0;top:0">']
    svg.append('<g transform="translate(0,96)">')
    for i, cx in enumerate(cols):
        svg.append(fibres(cx, i))
        svg.append(f'<text x="{cx}" y="290" text-anchor="middle" font-family="Kanit,Montserrat" font-weight="500" font-size="22" fill="#fff">{t["ages"][i]}</text>')
    svg.append(f'<path d="M820 330 L1550 330" stroke="{SILVER}" stroke-opacity=".5" stroke-width="2" marker-end="url(#a2)"/>')
    svg.append(f'<defs><marker id="a2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="{SILVER}"/></marker></defs>')
    # rows
    y = 380
    for label, val, kind in t["rows"]:
        col = {"up": "#9fd3ff", "down": "#ffb27a", "=": "#e7eaf0"}[kind]
        sym = {"up": "▲", "down": "▼", "=": "="}[kind]
        svg.append(f'<line x1="806" y1="{y + 18}" x2="1560" y2="{y + 18}" stroke="#fff" stroke-opacity=".08"/>')
        svg.append(f'<text x="806" y="{y}" font-family="Kanit,Montserrat" font-size="22" fill="#c7d0e3">{label}</text>')
        svg.append(f'<text x="1560" y="{y}" text-anchor="end" font-family="Kanit,Montserrat" font-weight="600" font-size="22" fill="{col}">{sym}  {val}</text>')
        y += 52
    svg.append('</g></svg>')
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{css()}</style></head><body>
{''.join(svg)}
<div style="position:absolute;left:84px;top:96px;width:620px">
<div class="eyebrow">{t["eyebrow"]}</div><h1>{t["f_title"]}</h1><div class="sub">{t["f_sub"]}</div>
<div class="small" style="margin-top:56px">{t["f_note"]}<br>{t["f_src"]}</div></div>
{foot(t)}</body></html>"""


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1600, "height": 900})
        for lang, t in T.items():
            out = ROOT / "assets" / "img" / "articles" / ("en" if lang == "en" else "")
            for name, html in (("anchor", anchor_html(t)), ("findings", findings_html(t))):
                tmp = ROOT / "tools" / f"_tmp_{lang}_{name}.html"
                tmp.write_text(html, encoding="utf-8")
                pg.goto(tmp.as_uri())
                pg.evaluate("document.fonts.ready")
                pg.wait_for_timeout(300)
                im = Image.open(io.BytesIO(pg.screenshot(type="png"))).convert("RGB")
                tmp.unlink()
                base = out / f"facial-ligaments-aging-{name}"
                im.save(base.with_suffix(".jpg"), quality=86, optimize=True, progressive=True)
                im.save(base.with_suffix(".webp"), quality=82, method=6)
                print("wrote", base)
        b.close()


if __name__ == "__main__":
    main()
