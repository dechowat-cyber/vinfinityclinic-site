"""Illustration for /articles/ligament-lift-injection/ (TH + EN), 1600x900.

python3 tools/make_ligament_lift_fig.py
"""
import io

from PIL import Image
from playwright.sync_api import sync_playwright

from make_ligament_figs import ROOT, SILVER, css, foot

T = {
    "th": {
        "eyebrow": "THE ARCHITECTURE OF A FACE",
        "title": "ไม่ต้องดึงเอ็น<br>เติมฐานให้ถูกชั้น",
        "sub": "เอ็นยึดใบหน้ายังยึดแน่น สิ่งที่หย่อนคือเนื้อเยื่อระหว่างเอ็น การเติมฐานรองรับชั้นลึกจึงตรงจุดกว่า",
        "a": "ฉีดเพื่อกระชับเอ็น", "a_d": "เอ็นแน่นอยู่แล้ว เนื้อเยื่อยังหย่อนเท่าเดิม",
        "b": "เติมฐานรองรับชั้นลึก", "b_d": "เนื้อเยื่อมีที่รองรับ แนวหน้ากลับมาเรียบขึ้น",
        "support": "ฐานรองรับ", "bone": "กระดูก",
        "note": "ภาพประกอบเชิงแนวคิด ไม่ได้แสดงสัดส่วนจริง · ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล",
        "by": "นพ.เดโชวัต พรมดา",
    },
    "en": {
        "eyebrow": "THE ARCHITECTURE OF A FACE",
        "title": "Support the layer,<br>not the ligament.",
        "sub": "Facial ligaments still hold firm. What sags is the tissue between them, so deep support targets the real cause.",
        "a": "Tightening ligaments", "a_d": "Ligaments already firm; tissue still sags",
        "b": "Deep support", "b_d": "Tissue is supported; contours look smoother",
        "support": "Support", "bone": "Bone",
        "note": "Conceptual illustration, not to scale · Results vary from person to person",
        "by": "Dechowat Promda, M.D.",
    },
}


def panel(x, title, desc, mode, t):
    w, top, bone = 360, 170, 470
    pins = [x + 40, x + 180, x + 320]
    sag = 150 if mode == "a" else 60
    g = [f'<text x="{x + w / 2}" y="44" text-anchor="middle" font-family="Kanit,Montserrat" font-weight="600" font-size="25" fill="#fff"><tspan fill="{'#ffb27a' if mode == 'a' else '#9fd3ff'}">{'✕' if mode == 'a' else '✓'}</tspan> {title}</text>',
         f'<text x="{x + w / 2}" y="78" text-anchor="middle" font-family="Kanit,Montserrat" font-size="16" fill="#c7d0e3">{desc}</text>',
         f'<rect x="{x}" y="{bone}" width="{w}" height="70" rx="12" fill="#e7eaf0" opacity=".92"/>',
         f'<text x="{x + w / 2}" y="{bone + 44}" text-anchor="middle" font-family="Kanit,Montserrat" font-size="18" font-weight="500" fill="#1b2d55">{t["bone"]}</text>']
    if mode == "b":
        for a, b in zip(pins, pins[1:]):
            m = (a + b) / 2
            g.append(f'<path d="M{a + 14} {bone} C{a + 20} {bone - 300} {b - 20} {bone - 300} {b - 14} {bone} Z" fill="#9fd3ff" opacity=".55"/>')
        g.append(f'<text x="{(pins[0] + pins[1]) / 2}" y="{bone - 70}" text-anchor="middle" font-family="Kanit,Montserrat" font-size="16" font-weight="500" fill="#041738">{t["support"]}</text>')
    d = f"M{pins[0]} {top - 40} L{pins[0]} {top}"
    for a, b in zip(pins, pins[1:]):
        d += f" Q{(a + b) / 2} {top + sag * 2} {b} {top}"
    d += f" L{pins[-1]} {top - 40} Z"
    g.append(f'<path d="{d}" fill="#b9c4dc" opacity=".9"/>')
    for p in pins:
        g.append(f'<rect x="{p - 8}" y="{top}" width="16" height="{bone - top}" rx="7" fill="{SILVER}"/>')
        g.append(f'<circle cx="{p}" cy="{top + 4}" r="11" fill="#fff"/>')
    if mode == "a":
        for p in pins:  # syringe arrows aimed at the ligaments
            g.append(f'<path d="M{p + 46} {top + 150} L{p + 14} {top + 190}" stroke="#ffb27a" stroke-width="4" marker-end="url(#ar)"/>')
    return "\n".join(g)


def html(t):
    svg = f"""<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#ffb27a"/></marker></defs>
{panel(0, t["a"], t["a_d"], "a", t)}
<line x1="400" y1="110" x2="400" y2="540" stroke="#fff" stroke-opacity=".15"/>
{panel(430, t["b"], t["b_d"], "b", t)}
<text x="0" y="590" font-family="Kanit,Montserrat" font-size="15" fill="#93a0bd">{t["note"]}</text>
</svg>"""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{css()}</style></head><body>
<div style="position:absolute;left:84px;top:110px;width:600px">
<div class="eyebrow">{t["eyebrow"]}</div><h1 style="font-size:56px">{t["title"]}</h1><div class="sub">{t["sub"]}</div></div>
<div style="position:absolute;left:730px;top:120px">{svg}</div>
{foot(t)}</body></html>"""


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1600, "height": 900})
        for lang, t in T.items():
            out = ROOT / "assets" / "img" / "articles" / ("en" if lang == "en" else "")
            tmp = ROOT / "tools" / f"_tmp_lift_{lang}.html"
            tmp.write_text(html(t), encoding="utf-8")
            pg.goto(tmp.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
            im = Image.open(io.BytesIO(pg.screenshot(type="png"))).convert("RGB")
            tmp.unlink()
            base = out / "ligament-lift-injection-support"
            im.save(base.with_suffix(".jpg"), quality=86, optimize=True, progressive=True)
            im.save(base.with_suffix(".webp"), quality=82, method=6)
            print("wrote", base)
        b.close()


if __name__ == "__main__":
    main()
