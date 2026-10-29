/* น้องวิน — the clinic's AI chat mascot.
   Answers from the website's own content (served by the LINE app, /api/webchat) and books a doctor consult
   through a short form (free times + name + phone + consent) into the same appointment system as LINE.
   The conversation is kept only in this browser tab (sessionStorage); nothing is stored on the server
   unless the visitor books. */
(function () {
  var C = window.VF || {};
  if (!C.app || window.__vfChat) return;
  window.__vfChat = 1;
  var API = C.app + "/api/webchat";
  var EN = (document.documentElement.lang || "th").slice(0, 2) === "en";
  var T = EN ? {
    name: "Nong Win", sub: "Vinfinity's AI assistant", hi: "Hi! I'm Nong Win 💙 Ask me about treatments, prices or opening hours, or book a consult with the doctor.",
    teaser: "Hi! Need help?", ph: "Type a question…", send: "Send", close: "Close", open: "Chat with Nong Win",
    chips: ["Book a consult", "Prices", "Tear trough filler", "Opening hours & map"],
    note: "AI answers can be wrong. The doctor assesses every case. Chats aren't saved.",
    pick: "Pick a time for your free first consult", more: "More days", nm: "Your name", ph2: "Phone number", wish: "What would you like to consult about? (optional)",
    consent: "I agree that Vinfinity Clinic may keep and use my name, phone and the details I give for appointments, consultation and care.",
    mk: "Send me news and offers on LINE (optional)", confirm: "Book this time", busy: "Booking…",
    done: "Booked ✨", doneTxt: "The team will call to confirm. Add our LINE to get reminders and chat with the clinic:", addLine: "Add LINE @vinfinityclinic",
    err: { slot_taken: "That time was just taken, please pick another.", bad_phone: "Please check the phone number.", bad_name: "Please enter your name.", consent_required: "Please tick the consent box.", x: "Booking didn't go through. Please try again or message LINE @vinfinityclinic." },
    chatErr: "Sorry, I couldn't answer just now. Please ask again, or message LINE @vinfinityclinic.",
    none: "No free times found online. Message LINE @vinfinityclinic and the team will find one for you.", typing: "Nong Win is typing", reset: "New chat",
  } : {
    name: "น้องวิน", sub: "ผู้ช่วย AI ของ Vinfinity Clinic", hi: "สวัสดีค่ะ น้องวินเองค่ะ 💙 ถามเรื่องหัตถการ ราคา เวลาเปิด หรือให้น้องวินจองคิวปรึกษาคุณหมอได้เลยนะคะ",
    teaser: "สวัสดีค่ะ มีอะไรให้น้องวินช่วยไหมคะ", ph: "พิมพ์คำถาม…", send: "ส่ง", close: "ปิด", open: "คุยกับน้องวิน",
    chips: ["จองคิวปรึกษาหมอ", "ราคา", "ฟิลเลอร์ใต้ตา", "เวลาเปิด / แผนที่"],
    note: "คำตอบจาก AI อาจคลาดเคลื่อน แพทย์ประเมินก่อนทำทุกเคส · ไม่บันทึกบทสนทนา",
    pick: "เลือกเวลาปรึกษาคุณหมอ (ครั้งแรกไม่มีค่าใช้จ่าย)", more: "วันถัดไป", nm: "ชื่อ", ph2: "เบอร์โทร", wish: "อยากปรึกษาเรื่องอะไร (ไม่บังคับ)",
    consent: "ยินยอมให้ Vinfinity Clinic เก็บและใช้ชื่อ เบอร์โทร และข้อมูลที่แจ้ง เพื่อการนัดหมาย ปรึกษา และดูแลการรักษา",
    mk: "รับข่าวสารและสิทธิพิเศษทาง LINE (ไม่บังคับ)", confirm: "ยืนยันจองเวลานี้", busy: "กำลังจอง…",
    done: "จองแล้วค่ะ ✨", doneTxt: "ทีมงานจะโทรยืนยันนัดค่ะ เพิ่มเพื่อน LINE ไว้เพื่อรับการแจ้งเตือนนัดและคุยกับคลินิกได้เลย:", addLine: "เพิ่มเพื่อน LINE @vinfinityclinic",
    err: { slot_taken: "เวลานี้เพิ่งมีคนจองไปค่ะ เลือกเวลาอื่นได้เลย", bad_phone: "เบอร์โทรไม่ถูกต้องค่ะ", bad_name: "กรอกชื่อด้วยนะคะ", consent_required: "ติ๊กช่องยินยอมก่อนนะคะ", x: "จองไม่สำเร็จค่ะ ลองใหม่อีกครั้ง หรือทัก LINE @vinfinityclinic ได้เลย" },
    chatErr: "ขอโทษค่ะ ตอนนี้น้องวินตอบไม่ได้ ลองถามใหม่อีกครั้ง หรือทัก LINE @vinfinityclinic ได้เลยค่ะ",
    none: "ตอนนี้ไม่พบเวลาว่างออนไลน์ ทัก LINE @vinfinityclinic ทีมงานจะหาเวลาให้ค่ะ", typing: "น้องวินกำลังพิมพ์", reset: "เริ่มคุยใหม่",
  };

  var SVG0 = '<svg viewBox="0 0 144 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="vfm"> <defs> <radialGradient id="vfb" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#EEF2F8"/><stop offset="1" stop-color="#C4CDE0"/></radialGradient> <linearGradient id="vfe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A5496"/><stop offset="1" stop-color="#1A326B"/></linearGradient> <linearGradient id="vfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#8698B5"/></linearGradient> </defs> <ellipse class="vfm-sh" cx="70" cy="131" rx="36" ry="5" fill="#0B142E" opacity=".13"/> <path class="vfm-tail" d="M106 114 C 126 114 136 96 131 80" stroke="#C4CDE0" stroke-width="9" stroke-linecap="round" fill="none"/> <path class="vfm-star" d="M131 64 L133.6 71 L140 73.5 L133.6 76 L131 83 L128.4 76 L122 73.5 L128.4 71 Z" fill="url(#vfe)" stroke="#1A326B" stroke-width=".8"/> <path d="M36 52 C 30 30 34 16 40 12 C 50 20 58 32 60 42 Z" fill="url(#vfb)" stroke="#9AA8C4" stroke-width="1.5" stroke-linejoin="round"/> <path d="M41 22 C 46 28 51 35 53 41 L42 46 C 39 38 39 29 41 22 Z" fill="url(#vfe)"/> <path d="M104 52 C 110 30 106 16 100 12 C 90 20 82 32 80 42 Z" fill="url(#vfb)" stroke="#9AA8C4" stroke-width="1.5" stroke-linejoin="round"/> <path d="M99 22 C 94 28 89 35 87 41 L98 46 C 101 38 101 29 99 22 Z" fill="url(#vfe)"/> <path d="M70 36 C 102 36 116 60 116 86 C 116 114 96 128 70 128 C 44 128 24 114 24 86 C 24 60 38 36 70 36 Z" fill="url(#vfb)" stroke="#9AA8C4" stroke-width="1.5"/> <ellipse cx="70" cy="108" rx="22" ry="16" fill="#FFFFFF" opacity=".8"/> <path d="M44 52 C 38 58 34 66 33 74" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".9"/> <path d="M70 44 L72.4 50.6 L79 53 L72.4 55.4 L70 62 L67.6 55.4 L61 53 L67.6 50.6 Z" fill="url(#vfg)" stroke="#1A326B" stroke-width=".9"/> <g class="vfm-eyes"><ellipse cx="53" cy="80" rx="8" ry="10" fill="#0B142E"/><ellipse cx="87" cy="80" rx="8" ry="10" fill="#0B142E"/> <ellipse cx="53" cy="84" rx="5" ry="5" fill="#2A4796" opacity=".7"/><ellipse cx="87" cy="84" rx="5" ry="5" fill="#2A4796" opacity=".7"/> <circle cx="56" cy="75.5" r="3" fill="#fff"/><circle cx="90" cy="75.5" r="3" fill="#fff"/><circle cx="50.5" cy="85" r="1.4" fill="#fff"/><circle cx="84.5" cy="85" r="1.4" fill="#fff"/></g> <ellipse cx="40" cy="93" rx="7" ry="4" fill="#F4A6B8" opacity=".6"/><ellipse cx="100" cy="93" rx="7" ry="4" fill="#F4A6B8" opacity=".6"/> <path d="M64 92 Q67 96 70 92 Q73 96 76 92" stroke="#0B142E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/> <ellipse cx="55" cy="112" rx="8" ry="6.5" fill="#FFFFFF" stroke="#9AA8C4" stroke-width="1.3"/> <ellipse class="vfm-wave" cx="88" cy="105" rx="8" ry="6.5" fill="#FFFFFF" stroke="#9AA8C4" stroke-width="1.3"/> <ellipse cx="54" cy="127" rx="10" ry="4.5" fill="#E2E8F3" stroke="#9AA8C4" stroke-width="1.2"/><ellipse cx="86" cy="127" rx="10" ry="4.5" fill="#E2E8F3" stroke="#9AA8C4" stroke-width="1.2"/> </svg>';
  var n = 0;
  function SVGf() { n++; return SVG0.replace(/vf([beg])"/g, "vf$1" + n + '"').replace(/#vf([beg])\)/g, "#vf$1" + n + ")"); }
  var css = ''
    + '.vfc,.vfc *{box-sizing:border-box}.vfc{--n:#0B142E;--r:#1A326B;--s:#2A4796;--sv:#D5DDEE;--p:#EEF2F8;--m:#5A6480;font-family:Kanit,Montserrat,system-ui,sans-serif;color:var(--n)}'
    + '.vfc-btn{position:fixed;right:18px;bottom:18px;z-index:45;width:78px;height:84px;border:0;background:none;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}'
    + '.vfc-btn .vfm{width:100%;height:100%;filter:drop-shadow(0 8px 16px rgba(11,20,46,.28));animation:vfbob 3.2s ease-in-out infinite}'
    + '.vfc-btn:focus-visible{outline:3px solid var(--s);outline-offset:4px;border-radius:20px}'
    + '.vfm .vfm-eyes{transform-origin:70px 80px;animation:vfblink 4.6s infinite}.vfm .vfm-wave{transform-origin:80px 108px;animation:vfwave 2.4s ease-in-out infinite}.vfm .vfm-tail{transform-origin:106px 114px;animation:vfwag 1.8s ease-in-out infinite}'
    + '.vfm .vfm-star{transform-origin:131px 73.5px;animation:vfspin 6s ease-in-out infinite}'
    + '@keyframes vfbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes vfblink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}'
    + '@keyframes vfwave{0%,60%,100%{transform:rotate(0)}70%{transform:rotate(-18deg)}80%{transform:rotate(10deg)}90%{transform:rotate(-12deg)}}@keyframes vfwag{0%,100%{transform:rotate(0)}50%{transform:rotate(-8deg)}}@keyframes vfspin{0%,80%,100%{transform:rotate(0) scale(1)}90%{transform:rotate(45deg) scale(1.25)}}'
    + '.vfc-tease{position:fixed;right:100px;bottom:46px;z-index:45;max-width:220px;background:#fff;color:var(--n);border:1px solid var(--sv);border-radius:16px 16px 4px 16px;padding:10px 14px;font-size:14.5px;line-height:1.45;box-shadow:0 10px 26px rgba(11,20,46,.16);cursor:pointer;animation:vfin .35s ease}'
    + '.vfc-tease b{display:block;font-weight:600}.vfc-tease i{position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:var(--p);border:1px solid var(--sv);font-style:normal;font-size:13px;line-height:20px;text-align:center;color:var(--m)}'
    + '@keyframes vfin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
    + '.vfc-pan{position:fixed;right:18px;bottom:18px;z-index:60;width:380px;max-width:calc(100vw - 24px);height:min(620px,calc(100vh - 36px));background:#fff;border-radius:24px;box-shadow:0 24px 60px rgba(11,20,46,.32);display:flex;flex-direction:column;overflow:hidden;animation:vfin .25s ease}'
    + '.vfc-hd{display:flex;align-items:center;gap:10px;padding:12px 12px 12px 14px;background:linear-gradient(135deg,#0B142E,#1E3470);color:#fff}'
    + '.vfc-hd .vfm{width:50px;height:50px;flex:none}.vfc-hd .vfm .vfm-sh{display:none}.vfc-ht{flex:1;min-width:0}.vfc-ht b{display:block;font-size:17px;font-weight:600;line-height:1.2}.vfc-ht small{font-size:12.5px;color:var(--sv);opacity:.9}'
    + '.vfc-x{width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:20px;cursor:pointer}.vfc-x:hover{background:rgba(255,255,255,.2)}'
    + '.vfc-rs{border:0;background:none;color:var(--sv);font:inherit;font-size:12px;cursor:pointer;text-decoration:underline;padding:4px}'
    + '.vfc-bd{flex:1;overflow-y:auto;padding:16px 14px 8px;background:var(--p);display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}'
    + '.vfc-m{max-width:86%;padding:10px 14px;border-radius:18px;font-size:15px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word}'
    + '.vfc-m.b{align-self:flex-start;background:#fff;border:1px solid #DFE5F0;border-bottom-left-radius:6px}.vfc-m.u{align-self:flex-end;background:var(--r);color:#fff;border-bottom-right-radius:6px}'
    + '.vfc-m a{color:var(--s);text-decoration:underline}.vfc-m.u a{color:#fff}'
    + '.vfc-dots{display:inline-flex;gap:4px;align-items:center}.vfc-dots span{width:7px;height:7px;border-radius:50%;background:#8698B5;animation:vfdot 1s infinite}.vfc-dots span:nth-child(2){animation-delay:.15s}.vfc-dots span:nth-child(3){animation-delay:.3s}'
    + '@keyframes vfdot{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}'
    + '.vfc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:2px 0}.vfc-chip{border:1px solid #C9D2E4;background:#fff;color:var(--r);border-radius:999px;padding:7px 13px;font:inherit;font-size:14px;cursor:pointer;min-height:36px}.vfc-chip:hover{background:var(--sv)}'
    + '.vfc-card{align-self:stretch;background:#fff;border:1px solid #DFE5F0;border-radius:18px;padding:12px;display:grid;gap:10px;font-size:14.5px}'
    + '.vfc-card h4{margin:0;font-size:15px;font-weight:600}.vfc-days{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}'
    + '.vfc-day{flex:none;border:1px solid #C9D2E4;background:#fff;border-radius:12px;padding:6px 10px;font:inherit;font-size:13px;cursor:pointer;color:var(--n)}.vfc-day[aria-pressed=true]{background:var(--r);color:#fff;border-color:var(--r)}'
    + '.vfc-times{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.vfc-t{border:1px solid #C9D2E4;background:var(--p);border-radius:10px;padding:8px 0;font:inherit;font-size:14px;cursor:pointer;color:var(--n)}.vfc-t[aria-pressed=true]{background:var(--s);color:#fff;border-color:var(--s)}'
    + '.vfc-card input[type=text],.vfc-card input[type=tel]{width:100%;border:1px solid #C9D2E4;border-radius:12px;padding:10px 12px;font:inherit;font-size:15px;color:var(--n);background:#fff}'
    + '.vfc-card label.ck{display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.5;color:var(--m)}.vfc-card label.ck input{margin-top:3px;width:18px;height:18px;flex:none;accent-color:var(--r)}'
    + '.vfc-go{border:0;border-radius:999px;background:var(--r);color:#fff;font:inherit;font-weight:600;font-size:15px;min-height:46px;cursor:pointer}.vfc-go:disabled{opacity:.5;cursor:default}'
    + '.vfc-line{display:block;text-align:center;border-radius:999px;background:#06C755;color:#fff!important;text-decoration:none!important;font-weight:600;padding:12px;min-height:46px}'
    + '.vfc-err{color:#B42318;font-size:13.5px}.vfc-ft{padding:8px 12px 10px;border-top:1px solid #E3E8F2;background:#fff}'
    + '.vfc-f{display:flex;gap:8px}.vfc-f textarea{flex:1;resize:none;border:1px solid #C9D2E4;border-radius:14px;padding:10px 12px;font:inherit;font-size:15px;max-height:110px;min-height:44px;color:var(--n);line-height:1.45}'
    + '.vfc-f textarea:focus,.vfc-card input:focus{outline:2px solid var(--s);outline-offset:1px}.vfc-f button{border:0;border-radius:14px;background:var(--r);color:#fff;font:inherit;font-weight:600;padding:0 16px;cursor:pointer;min-height:44px}'
    + '.vfc-nt{font-size:11.5px;color:var(--m);margin:6px 2px 0;line-height:1.4}'
    + '@media (max-width:520px){.vfc-pan{right:0;bottom:0;width:100vw;max-width:100vw;height:100%;height:100dvh;border-radius:0}.vfc-btn{right:12px;bottom:12px;width:68px;height:74px}.vfc-tease{right:84px;bottom:34px}}'
    + '@media (prefers-reduced-motion:reduce){.vfc *{animation:none!important}}';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function linkify(s) {
    return esc(s).replace(/(https?:\/\/[^\s<]+[^\s<.,)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(@vinfinityclinic)/g, '$1<a href="https://line.me/R/ti/p/@vinfinityclinic" target="_blank" rel="noopener">$2</a>')
      .replace(/(0\d{2}-\d{3}-\d{4})/g, '<a href="tel:$1">$1</a>');
  }
  function store(k, v) { try { v === undefined ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) { return null; } }

  var root = el("div", "vfc"), style = el("style"); style.textContent = css;
  document.head.appendChild(style); document.body.appendChild(root);
  var btn = el("button", "vfc-btn", SVGf()); btn.type = "button"; btn.setAttribute("aria-label", T.open);
  root.appendChild(btn);

  var hist = load("vf_chat") || [], pan = null, bd, ta, sending = false;
  try { if (!localStorage.getItem("vf_chat_seen")) setTimeout(tease, 6000); } catch (e) {}
  function tease() {
    if (pan || document.querySelector(".vfc-tease")) return;
    var t = el("div", "vfc-tease", "<b>" + esc(T.name) + "</b>" + esc(T.teaser) + '<i aria-hidden="true">×</i>');
    t.setAttribute("role", "button"); t.tabIndex = 0;
    t.addEventListener("click", function (e) { t.remove(); try { localStorage.setItem("vf_chat_seen", "1"); } catch (x) {} if (e.target.tagName !== "I") openPanel(); });
    root.appendChild(t);
  }
  btn.addEventListener("click", function () { pan ? closePanel() : openPanel(); });

  function openPanel() {
    var tz = root.querySelector(".vfc-tease"); if (tz) tz.remove();
    try { localStorage.setItem("vf_chat_seen", "1"); } catch (e) {}
    btn.style.display = "none";
    pan = el("div", "vfc-pan"); pan.setAttribute("role", "dialog"); pan.setAttribute("aria-label", T.name);
    pan.innerHTML = '<div class="vfc-hd">' + SVGf() + '<div class="vfc-ht"><b>' + esc(T.name) + '</b><small>' + esc(T.sub) + '</small></div>'
      + '<button class="vfc-rs" type="button">' + esc(T.reset) + '</button><button class="vfc-x" type="button" aria-label="' + esc(T.close) + '">×</button></div>'
      + '<div class="vfc-bd" aria-live="polite"></div>'
      + '<div class="vfc-ft"><form class="vfc-f"><textarea rows="1" maxlength="600" placeholder="' + esc(T.ph) + '" aria-label="' + esc(T.ph) + '"></textarea><button type="submit">' + esc(T.send) + '</button></form><p class="vfc-nt">' + esc(T.note) + '</p></div>';
    root.appendChild(pan);
    bd = pan.querySelector(".vfc-bd"); ta = pan.querySelector("textarea");
    pan.querySelector(".vfc-x").onclick = closePanel;
    pan.querySelector(".vfc-rs").onclick = function () { hist = []; store("vf_chat"); render(); };
    pan.querySelector("form").onsubmit = function (e) { e.preventDefault(); ask(ta.value); };
    ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(ta.value); } });
    ta.addEventListener("input", function () { ta.style.height = "auto"; ta.style.height = Math.min(110, ta.scrollHeight) + "px"; });
    document.addEventListener("keydown", onEsc);
    render();
    setTimeout(function () { ta.focus(); }, 50);
  }
  function onEsc(e) { if (e.key === "Escape" && pan) closePanel(); }
  function closePanel() { if (pan) pan.remove(); pan = null; btn.style.display = ""; document.removeEventListener("keydown", onEsc); btn.focus(); }

  function bubble(role, text) { var m = el("div", "vfc-m " + (role === "user" ? "u" : "b"), linkify(text)); bd.appendChild(m); return m; }
  function render() {
    bd.innerHTML = "";
    bubble("assistant", T.hi);
    hist.forEach(function (m) { bubble(m.role, m.content); });
    if (!hist.length) {
      var ch = el("div", "vfc-chips");
      T.chips.forEach(function (c, i) {
        var b = el("button", "vfc-chip", esc(c)); b.type = "button";
        b.onclick = function () { i === 0 ? (push("user", c), bubble("user", c), booking(null)) : ask(c); };
        ch.appendChild(b);
      });
      bd.appendChild(ch);
    }
    scroll();
  }
  function scroll() { bd.scrollTop = bd.scrollHeight; }
  function push(role, content) { hist.push({ role: role, content: content }); hist = hist.slice(-20); store("vf_chat", hist); }

  function ask(text) {
    text = String(text || "").trim();
    if (!text || sending) return;
    ta.value = ""; ta.style.height = "";
    var chips = bd.querySelector(".vfc-chips"); if (chips) chips.remove();
    push("user", text); bubble("user", text);
    sending = true;
    var dots = el("div", "vfc-m b", '<span class="vfc-dots" aria-label="' + esc(T.typing) + '"><span></span><span></span><span></span></span>');
    bd.appendChild(dots); scroll();
    fetch(API, { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit",
      body: JSON.stringify({ messages: hist.slice(-12), lang: EN ? "en" : "th", page: location.pathname }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        dots.remove();
        var reply = (j && j.reply) || T.chatErr;
        push("assistant", reply); bubble("assistant", reply);
        if (j && j.book) booking(j.book.date || null);
        if (window.gtag) gtag("event", "chat_message", { method: "webchat" });
        scroll();
      })
      .catch(function () { dots.remove(); bubble("assistant", T.chatErr); scroll(); })
      .then(function () { sending = false; });
  }

  // ---- booking card: free times → name, phone, consent → appointment ----
  function booking(date) {
    var card = el("div", "vfc-card", "<h4>" + esc(T.pick) + "</h4><div class=\"vfc-dots\"><span></span><span></span><span></span></div>");
    bd.appendChild(card); scroll();
    var chosen = null;
    fetch(C.app + "/api/webchat/slots" + (date ? "?from=" + date : ""), { credentials: "omit" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var days = (j && j.days) || [];
        if (!days.length) { card.innerHTML = "<div>" + linkify(T.none) + "</div>"; return; }
        card.innerHTML = "<h4>" + esc(T.pick) + "</h4>";
        var dRow = el("div", "vfc-days"), tGrid = el("div", "vfc-times");
        card.appendChild(dRow); card.appendChild(tGrid);
        var form = el("div", "", "");
        form.style.cssText = "display:none;gap:8px;grid-auto-rows:min-content";
        form.innerHTML = '<input type="text" name="n" autocomplete="name" placeholder="' + esc(T.nm) + '" aria-label="' + esc(T.nm) + '">'
          + '<input type="tel" name="p" autocomplete="tel" inputmode="tel" placeholder="' + esc(T.ph2) + '" aria-label="' + esc(T.ph2) + '">'
          + '<input type="text" name="w" maxlength="150" placeholder="' + esc(T.wish) + '" aria-label="' + esc(T.wish) + '">'
          + '<label class="ck"><input type="checkbox" name="c"><span>' + esc(T.consent) + ' <a href="/#privacy" target="_blank">' + (EN ? "Privacy" : "นโยบายความเป็นส่วนตัว") + '</a></span></label>'
          + '<label class="ck"><input type="checkbox" name="m"><span>' + esc(T.mk) + '</span></label>'
          + '<div class="vfc-err" role="alert"></div><button type="button" class="vfc-go" disabled>' + esc(T.confirm) + '</button>';
        card.appendChild(form);
        var go = form.querySelector(".vfc-go"), err = form.querySelector(".vfc-err");
        function check() { go.disabled = !(chosen && form.querySelector("[name=c]").checked && form.querySelector("[name=n]").value.trim() && form.querySelector("[name=p]").value.trim()); }
        form.addEventListener("input", check); form.addEventListener("change", check);
        function showDay(d) {
          Array.prototype.forEach.call(dRow.children, function (b) { b.setAttribute("aria-pressed", b.dataset.d === d.date ? "true" : "false"); });
          tGrid.innerHTML = "";
          d.times.forEach(function (t) {
            var b = el("button", "vfc-t", esc(t.time)); b.type = "button"; b.setAttribute("aria-pressed", "false");
            b.onclick = function () {
              Array.prototype.forEach.call(tGrid.children, function (x) { x.setAttribute("aria-pressed", "false"); });
              b.setAttribute("aria-pressed", "true"); chosen = { start: t.start, label: d.label + " " + t.time };
              form.style.display = "grid"; check(); scroll();
            };
            tGrid.appendChild(b);
          });
        }
        days.forEach(function (d, i) {
          var b = el("button", "vfc-day", esc(d.label.replace(/^วัน/, "").replace(/ \d{4}$/, ""))); b.type = "button"; b.dataset.d = d.date;
          b.onclick = function () { chosen = null; check(); showDay(d); };
          dRow.appendChild(b); if (i === 0) showDay(d);
        });
        go.onclick = function () {
          err.textContent = ""; go.disabled = true; go.textContent = T.busy;
          var body = { name: form.querySelector("[name=n]").value, phone: form.querySelector("[name=p]").value, start: chosen.start,
            interest: form.querySelector("[name=w]").value, consent: form.querySelector("[name=c]").checked, marketing: form.querySelector("[name=m]").checked };
          fetch(C.app + "/api/webchat/book", { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit", body: JSON.stringify(body) })
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (!j || !j.ok) { err.textContent = T.err[(j && j.error) || "x"] || T.err.x; go.disabled = false; go.textContent = T.confirm; return; }
              card.innerHTML = "<h4>" + esc(T.done) + "</h4><div>" + esc(j.when) + "</div><div>" + esc(T.doneTxt) + "</div>"
                + '<a class="vfc-line" href="' + esc(j.lineUrl) + '" target="_blank" rel="noopener">' + esc(T.addLine) + "</a>";
              push("assistant", T.done + " " + j.when);
              if (window.gtag) gtag("event", "generate_lead", { method: "webchat_booking" });
              if (window.fbq) fbq("track", "Schedule");
              if (window.ttq) ttq.track("Schedule");
              scroll();
            })
            .catch(function () { err.textContent = T.err.x; go.disabled = false; go.textContent = T.confirm; });
        };
        scroll();
      })
      .catch(function () { card.innerHTML = "<div>" + linkify(T.none) + "</div>"; });
  }
})();
