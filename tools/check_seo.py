#!/usr/bin/env python3
"""GEO Phase 1 checks on the built site: python3 tools/check_seo.py  (exit 1 on any problem).

Per page: title ≤60, description ≤155, one <h1>, <html lang>, self-canonical, no noindex, JSON-LD parses,
every {"@id": …} reference resolves, no AggregateRating/Review, FAQPage questions not marked up twice,
hreflang pairs reciprocal; plus sitemap, robots.txt and llms.txt coverage.
"""
import json, re, sys, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://vinfinityclinic.com"
BOTS = ["Googlebot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot"]
errors, faq_seen = [], collections.defaultdict(list)


def err(page, msg):
    errors.append(f"{page}: {msg}")


def walk(x, defined, refs):
    if isinstance(x, dict):
        if "@id" in x:
            (refs if set(x) == {"@id"} else defined).add(x["@id"])
        for v in x.values():
            walk(v, defined, refs)
    elif isinstance(x, list):
        for v in x:
            walk(v, defined, refs)


def types(x):
    t = x.get("@type") if isinstance(x, dict) else None
    return t if isinstance(t, list) else [t] if t else []


pages = {}
for f in sorted(ROOT.glob("**/index.html")):
    if "line-app" in f.parts or "node_modules" in f.parts:
        continue
    rel = "/" + str(f.parent.relative_to(ROOT)).replace(".", "").strip("/")
    path = "/" if rel == "/" else rel + "/"
    pages[path] = f.read_text(encoding="utf-8")

for path, s in pages.items():
    t = re.search(r"<title>(.*?)</title>", s)
    d = re.search(r'<meta name="description" content="(.*?)"', s)
    if not t or len(t.group(1)) > 60: err(path, f"title missing or over 60 chars ({t and len(t.group(1))})")
    if not d or len(d.group(1)) > 155: err(path, f"description missing or over 155 chars ({d and len(d.group(1))})")
    if len(re.findall(r"<h1[\s>]", s)) != 1: err(path, "needs exactly one <h1>")
    lang = re.search(r'<html lang="(\w+)"', s).group(1)
    if lang != ("en" if path.startswith("/en/") else "th"): err(path, f"html lang={lang}")
    if f'<link rel="canonical" href="{SITE}{path}">' not in s: err(path, "canonical is not self")
    if "noindex" in s: err(path, "noindex present")
    defined, refs = set(), set()
    for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try:
            ld = json.loads(raw)
        except ValueError as e:
            err(path, f"JSON-LD does not parse: {e}"); continue
        walk(ld, defined, refs)
        nodes = ld.get("@graph", [ld])
        for n in nodes:
            ts = types(n)
            if {"AggregateRating", "Review"} & set(ts) or "aggregateRating" in json.dumps(n): err(path, "review/rating markup")
            if "FAQPage" in ts:
                for q in n["mainEntity"]:
                    if not q.get("acceptedAnswer", {}).get("text"): err(path, f"FAQ without answer: {q['name']}")
                    faq_seen[q["name"]].append(path)
            if "BreadcrumbList" in ts:
                pos = [i["position"] for i in n["itemListElement"]]
                if pos != list(range(1, len(pos) + 1)): err(path, "breadcrumb positions")
                if n["itemListElement"][-1]["item"] != SITE + path: err(path, "breadcrumb does not end at this page")
            if "MedicalWebPage" in ts and isinstance(n.get("about"), dict) and "MedicalProcedure" in types(n["about"]):
                for k in ("name", "provider", "howPerformed"):
                    if k not in n["about"]: err(path, f"MedicalProcedure missing {k}")
            if "Article" in ts:
                for k in ("headline", "author", "datePublished", "dateModified", "inLanguage"):
                    if k not in n: err(path, f"Article missing {k}")
    missing = refs - defined
    if missing: err(path, f"unresolved @id references: {sorted(missing)}")
    if path != "/" and '"BreadcrumbList"' not in s: err(path, "no BreadcrumbList")
    for h, href in re.findall(r'<link rel="alternate" hreflang="([\w-]+)" href="([^"]+)">', s):
        other = href.replace(SITE, "")
        if other not in pages: err(path, f"hreflang {h} → missing page {other}")
        elif f'href="{SITE}{path}"' not in pages[other]: err(path, f"hreflang {h} → {other} does not link back")

for q, where in faq_seen.items():
    if len(where) > 1: errors.append(f"FAQ marked up on more than one page: {q} {where}")

sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
for path in pages:
    if f"<loc>{SITE}{path}</loc>" not in sitemap: err(path, "not in sitemap.xml")
robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
if f"Sitemap: {SITE}/sitemap.xml" not in robots: errors.append("robots.txt: no Sitemap line")
for b in BOTS:
    if f"User-agent: {b}\nAllow: /" not in robots: errors.append(f"robots.txt: {b} not explicitly allowed")
if "Disallow: /\n" in robots: errors.append("robots.txt blocks the site")
for f in ("llms.txt", "llms-full.txt"):
    if not (ROOT / f).exists(): errors.append(f"{f} missing")
if "TODO" in (ROOT / "llms.txt").read_text(encoding="utf-8"): errors.append("llms.txt contains TODO")

print(f"checked {len(pages)} pages")
for e in errors:
    print("✗", e)
sys.exit(1 if errors else 0)
