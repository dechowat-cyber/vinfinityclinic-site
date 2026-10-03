#!/usr/bin/env python3
"""Generate the before/after sections for the home page.

Writes pages/_results_eye.html and pages/_results_layers.html.
Edit CASES below (layers treated, captions) — the layer tags must be
confirmed by the treating doctor before publishing.
Layer index: 0 ผิว, 1 ไขมันชั้นตื้น, 2 SMAS, 3 ไขมันชั้นลึก/เอ็นยึด, 4 กระดูก
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LAYER_NAMES = ["ผิว", "ไขมันชั้นตื้น", "SMAS", "ไขมันชั้นลึก", "กระดูก"]
DISCLAIMER = "ผลลัพธ์ที่ได้ขึ้นอยู่กับสภาพผิวและดุลยพินิจของแพทย์ในแต่ละบุคคล"

EYE = [
    ("06", "ใต้ตาดูเรียบขึ้น หน้าดูพักผ่อนเพียงพอ"),
    ("09", "ร่องใต้ตาตื้นลงอย่างเป็นธรรมชาติ"),
    ("15", "ใต้ตาดูตื้นลง หน้าดูสดชื่นขึ้น"),
    ("25", "ใต้ตาลึกในวัยผู้ใหญ่ เติมอย่างระมัดระวัง"),
    ("13", "ใต้ตาลึกในผู้ชาย ผลลัพธ์ไม่ดูเหมือนทำมา"),
]

# (case, title, plan line, layers treated)
LAYERS = [
    ("14", "วางแผนทั้งใบหน้า", "ค้ำโครงก่อน แล้วเกลี่ยผิวให้กลืน", [4, 3, 0]),
    ("16", "ปรับสัดส่วนรูปหน้า", "สร้างโครงคางและกรอบหน้า ให้สัดส่วนสมดุล", [4, 3]),
    ("20", "กลางหน้าดูอิ่มและเรียบขึ้น", "ค้ำไขมันชั้นลึก เติมชั้นตื้นด้วยเจลที่ยืดหยุ่น", [3, 1]),
    ("26", "ใบหน้าสมดุลและสดใสขึ้น", "โครงสร้างหลายตำแหน่ง ร่วมกับดูแลคุณภาพผิว", [4, 3, 0]),
    ("27", "กลางหน้าเรียบและอ่อนเยาว์ขึ้น", "เติมช่องไขมันที่ยุบทั้งสองชั้นอย่างสมดุล", [3, 1, 0]),
]


def slider(case, label):
    b = f"/assets/img/ba/case{case}-b"
    a = f"/assets/img/ba/case{case}-a"
    return f"""<div class="ba" style="--pos:50%">
<picture><source srcset="{a}.webp" type="image/webp"><img src="{a}.jpg" alt="หลังทำ เคส {case} {label}" width="450" height="574" loading="lazy" decoding="async"></picture>
<div class="ba-before" aria-hidden="true"><picture><source srcset="{b}.webp" type="image/webp"><img src="{b}.jpg" alt="" width="450" height="574" loading="lazy" decoding="async"></picture></div>
<span class="ba-tag ba-tag-b">BEFORE</span><span class="ba-tag ba-tag-a">AFTER</span>
<span class="ba-handle" aria-hidden="true"></span>
<input class="ba-range" type="range" min="0" max="100" value="50" aria-label="เลื่อนเปรียบเทียบก่อนและหลัง เคส {case}">
</div>"""


def eye_section():
    cards = "\n".join(
        f"""<figure class="ba-card">
{slider(c, "ฟิลเลอร์ใต้ตา")}
<figcaption><span class="ba-no">CASE {c}</span><span>{cap}</span></figcaption>
</figure>""" for c, cap in EYE)
    return f"""<section class="results" id="results">
<div class="wrap">
<div class="results-head">
<div>
<div class="eyebrow">Real Cases · Tear Trough</div>
<h2 class="h2">ใต้ตาที่ดูพักผ่อนขึ้น<br>โดยยังเป็นหน้าเดิมของคุณ</h2>
</div>
<p class="lead">ใต้ตาคือตำแหน่งที่ผิวบางที่สุดบนใบหน้า หมอบาสประเมินโครงสร้างใต้ตาก่อนทุกครั้ง แล้วเติมทีละน้อยในชั้นที่เหมาะสม เลื่อนแถบบนภาพเพื่อเปรียบเทียบ</p>
</div>
<div class="ba-rail" tabindex="0" aria-label="เคสฟิลเลอร์ใต้ตา">
{cards}
</div>
<p class="ba-legal">ภาพจากผู้รับบริการจริงที่ยินยอมให้เผยแพร่ ถ่ายในมุมและแสงเดียวกัน ไม่ผ่านการตกแต่ง · {DISCLAIMER}</p>
<div class="results-cta"><a class="btn btn-navy" href="{{{{LINE}}}}" target="_blank" rel="noopener">ปรึกษาเรื่องใต้ตาทาง LINE</a><a class="results-link" href="/filler/">อ่านเรื่องฟิลเลอร์ใต้ตา →</a></div>
</div>
</section>"""


def chips(active):
    out = []
    for i, n in enumerate(LAYER_NAMES):
        on = i in active
        if on:
            out.append(f'<button type="button" class="lchip is-on" data-layer="{i}" title="ดูชั้น {n} ในภาพกายวิภาค"><b>0{i+1}</b>{n}</button>')
        else:
            out.append(f'<span class="lchip"><b>0{i+1}</b>{n}</span>')
    return "".join(out)


def layers_section():
    cards = "\n".join(
        f"""<article class="lcase">
{slider(c, title)}
<div class="lcase-body">
<div class="ba-no">CASE {c}</div>
<h3>{title}</h3>
<p>{plan}</p>
<div class="lchips" aria-label="ชั้นที่รักษา">{chips(ls)}</div>
</div>
</article>""" for c, title, plan, ls in LAYERS)
    return f"""<section class="layer-cases" id="five-layers">
<div class="wrap">
<div class="results-head">
<div>
<div class="eyebrow">5 Layers in Practice</div>
<h2 class="h2">เมื่อแก้ให้ถูกชั้น<br>ทั้งใบหน้าก็เปลี่ยนไปด้วยกัน</h2>
</div>
<p class="lead">แต่ละเคสวางแผนจากโครงสร้างชั้นล่างขึ้นมา ชั้นที่ไฮไลต์คือชั้นที่รักษาในเคสนั้น กดที่ชั้นเพื่อดูตำแหน่งในภาพกายวิภาคด้านบน</p>
</div>
<div class="lcases">
{cards}
</div>
<p class="ba-legal">ภาพจากผู้รับบริการจริงที่ยินยอมให้เผยแพร่ ไม่ผ่านการตกแต่ง แผนการรักษาของแต่ละคนแตกต่างกัน · {DISCLAIMER}</p>
</div>
</section>"""


SCRIPT = """<script>
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(document.querySelectorAll('.ba'),function(el){
    var r=el.querySelector('.ba-range'),touched=false;
    function set(v){el.style.setProperty('--pos',v+'%')}
    r.addEventListener('input',function(){touched=true;set(r.value)});
    if(reduce||!('IntersectionObserver' in window))return;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting||touched)return;io.disconnect();
      var t0=null;function step(t){if(touched)return;if(!t0)t0=t;var p=(t-t0)/2200;if(p>=1){set(50);r.value=50;return}
        var v=50+38*Math.sin(p*Math.PI*2)*(1-p*.35);set(v.toFixed(1));r.value=v;requestAnimationFrame(step)}
      setTimeout(function(){requestAnimationFrame(step)},300);
    })},{threshold:.6});io.observe(el);
  });
  [].forEach.call(document.querySelectorAll('.lchip[data-layer]'),function(b){
    b.addEventListener('click',function(){
      var s=document.getElementById('layers');if(!s)return;
      s.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
      window.dispatchEvent(new CustomEvent('ana:pick',{detail:+b.dataset.layer}));
    });
  });
})();
</script>"""

if __name__ == "__main__":
    (ROOT / "pages" / "_results_eye.html").write_text(eye_section() + "\n", encoding="utf-8")
    (ROOT / "pages" / "_results_layers.html").write_text(layers_section() + "\n" + SCRIPT + "\n", encoding="utf-8")
    print("ok")
