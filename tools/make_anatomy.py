#!/usr/bin/env python3
"""Generates pages/_anatomy.html — the interactive 5-layer facial anatomy explorer (original artwork).
Run: python3 tools/make_anatomy.py  (build.py inlines the partial into the home page)."""
import math, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
X0, X1 = 70, 470          # tissue block front face
DX, DY = 46, -26          # depth offset for the top surface sliver
AMP = 5

# name, en, top y (collapsed), thickness, fill, top-surface fill, explode offset (px up)
LAYERS = [
    ("ผิวหนัง", "SKIN", 120, 16, "#F6F8FC", "#FFFFFF", -132),
    ("ไขมันชั้นตื้น", "SUPERFICIAL FAT", 136, 40, "#D5DDEE", "#E6ECF6", -92),
    ("SMAS · กล้ามเนื้อ", "SMAS", 176, 16, "#8698B5", "#A3B2CB", -56),
    ("ไขมันชั้นลึก · เอ็นยึด", "DEEP FAT & LIGAMENTS", 192, 42, "#5A6FA8", "#7084BA", -24),
    ("กระดูก · เยื่อหุ้มกระดูก", "BONE & PERIOSTEUM", 234, 30, "#2A4796", "#3A5496", 0),
]


def wave(y, phase, x0=X0, x1=X1, step=10):
    return [(x, y + AMP * math.sin(x / 38 + phase)) for x in range(x0, x1 + 1, step)]


def pts(seq):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in seq)


def band(top, thick, phase):
    upper = wave(top, phase)
    lower = wave(top + thick, phase + 0.6)
    front = f"M{pts(upper)} L{pts(reversed(lower))} Z".replace(" ", " L", 0)
    front = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in upper) + " L" + " L".join(
        f"{x:.1f},{y:.1f}" for x, y in reversed(lower)) + " Z"
    sliver = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in upper) + \
             f" L{upper[-1][0]+DX:.1f},{upper[-1][1]+DY:.1f}" + \
             " L" + " L".join(f"{x+DX:.1f},{y+DY:.1f}" for x, y in reversed(upper)) + " Z"
    side = (f"M{upper[-1][0]:.1f},{upper[-1][1]:.1f} L{upper[-1][0]+DX:.1f},{upper[-1][1]+DY:.1f} "
            f"L{lower[-1][0]+DX:.1f},{lower[-1][1]+DY:.1f} L{lower[-1][0]:.1f},{lower[-1][1]:.1f} Z")
    return front, sliver, side


def details(i, top, thick):
    g = []
    if i == 1:   # superficial fat: compartments (septa) + lobules
        for x in range(96, 460, 64):
            g.append(f'<path d="M{x},{top+3} C{x+6},{top+thick*0.4} {x-6},{top+thick*0.7} {x+2},{top+thick-2}" stroke="#8698B5" stroke-width="1" fill="none" opacity=".7"/>')
        for k, x in enumerate(range(84, 462, 22)):
            y = top + 12 + (k % 3) * 9
            g.append(f'<circle cx="{x}" cy="{y:.0f}" r="{5 + k % 2}" fill="#EEF2F8" stroke="#B8C4DA" stroke-width=".8"/>')
    if i == 2:   # SMAS fibres
        for x in range(76, 466, 12):
            g.append(f'<path d="M{x},{top+3} l10,{thick-6}" stroke="#5A6480" stroke-width=".8" opacity=".55"/>')
    if i == 3:   # deep fat lobules + retaining ligament
        for k, x in enumerate(range(90, 460, 34)):
            y = top + 14 + (k % 2) * 14
            g.append(f'<ellipse cx="{x}" cy="{y}" rx="14" ry="9" fill="#6B80B8" stroke="#8698B5" stroke-width=".8"/>')
        g.append(f'<path d="M318,{top+thick} L318,{top+2}" stroke="#EEF2F8" stroke-width="2.4" stroke-linecap="round"/>')
        g.append(f'<path d="M322,{top+4} q8,-6 16,-2" stroke="#EEF2F8" stroke-width="1.4" fill="none"/>')
    if i == 4:   # bone: periosteum line + trabecular hint
        g.append(f'<path d="M{X0},{top+3} L{X1},{top+3}" stroke="#D5DDEE" stroke-width="1.2" opacity=".8"/>')
        for x in range(84, 466, 18):
            g.append(f'<path d="M{x},{top+10} l6,8 m6,-8 l-6,8" stroke="#1E3470" stroke-width="1" opacity=".7"/>')
    return "".join(g)


def label_y(top, thick):
    return top + thick / 2 + 4


groups = []
for i, (th, en, top, thick, fill, tfill, off) in enumerate(LAYERS):
    front, sliver, side = band(top, thick, i * 0.9)
    ly = label_y(top, thick)
    groups.append(f'''<g class="ana-layer" data-layer="{i}" style="--off:{off}px">
<path d="{sliver}" fill="{tfill}" stroke="rgba(11,20,46,.18)" stroke-width=".8"/>
<path d="{side}" fill="{fill}" opacity=".78"/>
<path d="{front}" fill="{fill}" stroke="rgba(11,20,46,.22)" stroke-width=".8"/>
{details(i, top, thick)}
<g class="ana-label"><path d="M{X1+DX+6},{ly-6:.0f} L{X1+DX+40},{ly-6:.0f}" stroke="#D5DDEE" stroke-width="1"/><circle cx="{X1+DX+6}" cy="{ly-6:.0f}" r="2.6" fill="#D5DDEE"/>
<text x="{X1+DX+48}" y="{ly-10:.0f}" class="ana-en">0{i+1} · {en}</text><text x="{X1+DX+48}" y="{ly+8:.0f}" class="ana-th">{th}</text></g>
</g>''')

# artery: runs deep in the medial face, then changes plane toward the surface (why depth matters)
artery = ("M84,250 C140,246 170,226 200,214 S250,186 280,170 S330,148 360,140 S420,134 452,130")
svg = f'''<svg class="ana-svg" viewBox="0 0 760 330" role="img" aria-labelledby="ana-title ana-desc">
<title id="ana-title">ภาพตัดขวางชั้นกายวิภาคของใบหน้า 5 ชั้น</title>
<desc id="ana-desc">ผิวหนัง ไขมันชั้นตื้น SMAS ไขมันชั้นลึกพร้อมเอ็นยึด และกระดูก แสดงหลอดเลือดแดงที่เปลี่ยนระดับความลึก</desc>
<defs><filter id="ana-glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<g class="ana-stack">{''.join(reversed(groups))}
<g class="ana-artery"><path d="{artery}" stroke="#F6F8FC" stroke-width="3.2" fill="none" stroke-linecap="round" filter="url(#ana-glow)" opacity=".9"/><path class="ana-flow" d="{artery}" stroke="#0B142E" stroke-width="1.4" fill="none" stroke-dasharray="4 10" stroke-linecap="round"/>
<text x="210" y="300" class="ana-note">หลอดเลือดแดงเปลี่ยนระดับความลึกตามตำแหน่ง</text></g>
</g></svg>'''

LAYER_INFO = [
    ("ผิวหนัง", "Epidermis · Dermis", "ชั้นที่มองเห็นและสัมผัสได้ ความชุ่มชื้น ความแน่น และเนื้อผิวอยู่ที่ชั้นนี้", "สกินบูสเตอร์ (PN · HA) ฉีดในชั้นผิว", "/skin-booster/"),
    ("ไขมันชั้นตื้น", "Superficial fat compartments", "ไขมันที่แบ่งเป็นช่องด้วยผนังบาง ๆ ขยับตามการแสดงสีหน้า ถ้าเติมด้วยเจลที่แข็งเกินไป หน้าจะดูตึงหรือ “เต็ม” เวลายิ้ม", "เจลที่ยืดหยุ่นสูงในปริมาณน้อย", "/articles/layered-injection-anatomy/"),
    ("SMAS · กล้ามเนื้อ", "Superficial musculoaponeurotic system", "แผ่นพังผืดและกล้ามเนื้อที่ยึดโครงหน้าไว้ เมื่อหย่อน แก้มและกรอบหน้าจะตกตาม", "ยกกระชับด้วยพลังงานโฟกัส (New Doublo 2.0)", "/#programs"),
    ("ไขมันชั้นลึก · เอ็นยึด", "Deep fat compartments · Retaining ligaments", "ไขมันชั้นลึกเป็นฐานรองรับ ส่วนเอ็นยึดคือหมุดที่ยึดผิวกับกระดูก เมื่อชั้นนี้ยุบ ชั้นบนจะหย่อนลงตาม", "เจลที่ค่า G′ สูง หรือการกระตุ้นคอลลาเจน", "/articles/layered-injection-anatomy/"),
    ("กระดูก · เยื่อหุ้มกระดูก", "Bone · Periosteum", "โครงสร้างที่กำหนดสัดส่วนใบหน้า เช่น โหนกแก้ม ขมับ คาง และกรอบหน้า กระดูกเองก็เปลี่ยนไปตามวัย", "ฟิลเลอร์ปรับโครงหน้าบนชั้นเยื่อหุ้มกระดูก", "/filler/"),
]
tabs = "".join(
    f'<button type="button" class="ana-tab" data-layer="{i}" aria-pressed="false"><span class="n">0{i+1}</span><span>{t}</span></button>'
    for i, (t, *_rest) in enumerate(LAYER_INFO))
panels = "".join(
    f'<div class="ana-panel" data-layer="{i}" {"hidden" if i else ""}><div class="ana-panel-en">{en}</div><h3>{t}</h3><p>{d}</p>'
    f'<a class="ana-panel-tx" href="{href}">{tx} →</a></div>'
    for i, (t, en, d, tx, href) in enumerate(LAYER_INFO))

html = f'''<section class="anatomy grid-bg on-dark" id="layers">
<div class="wrap">
<div class="eyebrow light">The Architecture of a Face</div>
<h2 class="h2">5 ชั้นของใบหน้า ที่แพทย์ต้องอ่านให้ออกก่อนฉีด</h2>
<p class="lead">กดเลือกแต่ละชั้นเพื่อดูว่ามีอะไรอยู่ในนั้น และแก้ด้วยอะไร หลอดเลือดสำคัญวิ่งผ่านหลายระดับความลึก การรู้ว่าปลายเข็มอยู่ชั้นไหนจึงเป็นทั้งเรื่องผลลัพธ์และความปลอดภัย</p>
<div class="ana-grid">
<figure class="ana-figure">{svg}<figcaption>ภาพประกอบเชิงแนวคิด ไม่ได้แสดงสัดส่วนจริงของแต่ละตำแหน่ง</figcaption></figure>
<div class="ana-side">
<div class="ana-tabs" role="group" aria-label="เลือกชั้นกายวิภาค">{tabs}</div>
<button type="button" class="ana-toggle" aria-pressed="true">รวมชั้น / แยกชั้น</button>
<div class="ana-panels" aria-live="polite">{panels}</div>
</div>
</div>
</div>
<script>
(function(){{
  var sec=document.getElementById('layers'); if(!sec) return;
  var tabs=[].slice.call(sec.querySelectorAll('.ana-tab')), panels=[].slice.call(sec.querySelectorAll('.ana-panel')), layers=[].slice.call(sec.querySelectorAll('.ana-layer'));
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches, timer=null, cur=0, user=false;
  function pick(i){{cur=i;
    tabs.forEach(function(t){{t.setAttribute('aria-pressed',String(+t.dataset.layer===i))}});
    panels.forEach(function(p){{p.hidden=(+p.dataset.layer!==i)}});
    layers.forEach(function(l){{l.classList.toggle('is-dim',+l.dataset.layer!==i);l.classList.toggle('is-on',+l.dataset.layer===i)}});
  }}
  function stop(){{if(timer){{clearInterval(timer);timer=null}}}}
  function hold(){{user=true;stop()}}
  tabs.forEach(function(t){{t.addEventListener('click',function(){{hold();pick(+t.dataset.layer)}})}});
  layers.forEach(function(l){{l.addEventListener('click',function(){{hold();pick(+l.dataset.layer)}})}});
  pick(0);
  window.addEventListener('ana:pick',function(e){{hold();sec.classList.add('is-open');pick(+e.detail)}});
  var tg=sec.querySelector('.ana-toggle'); if(tg) tg.addEventListener('click',function(){{hold();var o=sec.classList.toggle('is-open');tg.setAttribute('aria-pressed',String(o))}});
  function start(){{setTimeout(function(){{sec.classList.add('is-open')}},reduce?0:1800);if(!reduce&&!user&&!timer){{timer=setInterval(function(){{pick((cur+1)%5)}},3800)}}}}
  if('IntersectionObserver' in window){{
    new IntersectionObserver(function(es){{es.forEach(function(e){{if(e.isIntersecting){{start()}}else{{stop()}}}})}},{{threshold:.35}}).observe(sec);
  }} else start();
}})();
</script>
</section>
'''
(ROOT / "pages" / "_anatomy.html").write_text(html, encoding="utf-8")
print("wrote pages/_anatomy.html", len(html))
