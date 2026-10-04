/* Vinfinity web attribution + consent-gated pixels.
   1. Keeps the campaign that brought the visitor (utm_*, gclid, fbclid, ttclid) for 90 days in localStorage.
   2. Every LINE button goes through the LINE app (/r/web?v=CODE&…), which stores the visit and opens LINE with
      "(จากเว็บไซต์ #CODE)", so the clinic can follow ads → chat → booking → revenue. No personal data here.
   3. GA4 / Meta / TikTok pixels load only after the visitor accepts (PDPA). IDs come from build.py. */
(function () {
  var C = window.VF || {};
  if (!C.app) return;
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid"];
  var AL = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function cookie(n) { var m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)")); return m ? decodeURIComponent(m[1]) : ""; }

  var qs = new URLSearchParams(location.search), now = Date.now(), a = null, fresh = {}, has = false;
  try { a = JSON.parse(get("vf_attr") || "null"); } catch (e) {}
  if (a && now - a.t > 90 * 864e5) a = null;
  KEYS.forEach(function (k) { var v = qs.get(k); if (v) { fresh[k] = v.slice(0, 200); has = true; } });
  if (has || !a) {
    var ext = document.referrer && document.referrer.indexOf(location.hostname) < 0;
    a = fresh; a.landing = (location.pathname + location.search).slice(0, 300); a.referrer = ext ? document.referrer.slice(0, 300) : ""; a.t = now;
    set("vf_attr", JSON.stringify(a));
  }
  var code = "", r = new Uint8Array(6);
  (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach(function (_, i) { r[i] = Math.random() * 256; });
  for (var i = 0; i < 6; i++) code += AL[r[i] % AL.length];

  function lineUrl() {
    var p = new URLSearchParams({ v: code });
    KEYS.concat(["landing", "referrer"]).forEach(function (k) { if (a[k]) p.set(k, a[k]); });
    var ga = cookie("_ga").split(".").slice(-2).join("."), fbp = cookie("_fbp");
    if (ga && ga.indexOf(".") > 0) p.set("ga_cid", ga);
    if (fbp) p.set("fbp", fbp);
    return C.app + "/r/web?" + p.toString();
  }
  var LINE = /^https:\/\/line\.me\/R\/oaMessage\//;
  function rewrite(el) { if (el.dataset.vfLine || LINE.test(el.href)) { el.dataset.vfLine = "1"; el.href = lineUrl(); } }
  var up = false;
  function all() { if (up) Array.prototype.forEach.call(document.querySelectorAll("a[href]"), rewrite); }
  // only route through the app when it answers; otherwise the buttons stay plain LINE links
  var ctl = window.AbortController ? new AbortController() : null;
  if (ctl) setTimeout(function () { ctl.abort(); }, 3000);
  fetch(C.app + "/api/ping", { signal: ctl && ctl.signal, credentials: "omit" })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (j) { if (j && j.ok) { up = true; all(); } })
    .catch(function () {});
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a[data-vf-line]");
    if (!el) return;
    rewrite(el);
    if (window.fbq) fbq("track", "Contact");
    if (window.ttq) ttq.track("Contact");
    if (window.gtag) gtag("event", "generate_lead", { method: "line" });
  }, true);

  // ---- consent-gated pixels ----
  if (!(C.ga4 || C.meta || C.tiktok)) return;
  function load() {
    if (C.ga4) {
      var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.ga4; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
      gtag("js", new Date()); gtag("config", C.ga4);
    }
    if (C.meta) {
      var f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
      f.push = f; f.loaded = true; f.version = "2.0"; f.queue = [];
      var m = document.createElement("script"); m.async = true; m.src = "https://connect.facebook.net/en_US/fbevents.js"; document.head.appendChild(m);
      fbq("init", C.meta); fbq("track", "PageView");
    }
    if (C.tiktok) {
      var t = window.ttq = window.ttq || []; t._i = t._i || {};
      ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"].forEach(function (n) {
        t[n] = function () { t.push([n].concat([].slice.call(arguments))); };
      });
      t.load = function (id) { t._i[id] = []; var k = document.createElement("script"); k.async = true; k.src = "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + id + "&lib=ttq"; document.head.appendChild(k); };
      t.load(C.tiktok); t.page();
    }
    setTimeout(all, 1500); // pick up _ga / _fbp once the pixels have set them
  }
  var choice = get("vf_consent");
  if (choice === "yes") return load();
  if (choice === "no") return;
  var b = document.createElement("div");
  b.setAttribute("role", "dialog"); b.setAttribute("aria-label", "การใช้คุกกี้");
  b.style.cssText = "position:fixed;left:16px;right:16px;bottom:16px;z-index:50;max-width:560px;margin:0 auto;background:#0B142E;color:#F4F6F9;border:1px solid rgba(213,221,238,.25);border-radius:18px;padding:16px 18px;box-shadow:0 18px 40px rgba(0,0,0,.35);font-size:15px;line-height:1.6;display:grid;gap:12px";
  b.innerHTML = '<div>เว็บไซต์นี้ใช้คุกกี้เพื่อวัดผลโฆษณาและปรับปรุงเนื้อหา คุณเลือกได้ว่าจะอนุญาตหรือไม่ <a href="/#privacy" style="color:#D5DDEE">นโยบายความเป็นส่วนตัว</a></div>'
    + '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap"><button data-c="no" style="min-height:44px;padding:0 18px;border-radius:999px;border:1px solid rgba(213,221,238,.5);background:transparent;color:#fff;font:inherit;cursor:pointer">ไม่อนุญาต</button>'
    + '<button data-c="yes" style="min-height:44px;padding:0 22px;border-radius:999px;border:0;background:#D5DDEE;color:#0B142E;font:inherit;font-weight:600;cursor:pointer">อนุญาต</button></div>';
  b.addEventListener("click", function (e) {
    var c = e.target.getAttribute && e.target.getAttribute("data-c");
    if (!c) return;
    set("vf_consent", c); b.remove(); if (c === "yes") load();
  });
  document.body.appendChild(b);
})();
