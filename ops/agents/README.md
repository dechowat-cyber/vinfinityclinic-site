# Vinfinity daily agents (internal — not deployed, see /.vercelignore)

One scheduled agent ("Growth", 07:30 Bangkok, since 31 Oct 2026) replaces the four daily agents to save cost: one setup, one combined email report to Dr. Dechowat.
Each area keeps its own file here: a backlog (what to do next) and a dated log (what was done).

| Area | When | File |
|---|---|---|
| Marketing (light) | every day | marketing.md |
| SEO | Monday | seo.md |
| AEO (AI-search answers) | Wednesday | aeo.md |
| Branding | Friday | branding.md |
| Live-site check only | Tue / Thu / Sat / Sun | — |

The old per-area scheduled tasks (SEO 07:10, AEO 07:20, Branding 07:40) are paused, not deleted, and can be switched back on.

## Rules every agent follows
- Technical SEO fixes may go straight to `main` (meta title/description, canonical, hreflang, JSON-LD validity, sitemap, robots, alt text, broken links, internal links, page speed). Run `python3 build.py`, check the diff, commit, push.
- Anything a patient reads as content (new articles, FAQ wording, prices, treatment claims, before/after, photos, menu) goes to a branch `agent/<name>-<yyyymmdd>`; Vercel builds a preview. List it in the report for the doctor to approve. Never merge it yourself.
- Never change prices, the medical license (ว.48943), NAP (name/address/phone/hours), consent-gated before/after, or anything under line-app/.
- Banned in copy: ดีที่สุด, อันดับ 1, 100%, การันตี, หายขาด, เห็นผลทันที, ถาวร, ไม่เจ็บ, เชี่ยวชาญ, ชำนาญ, "ที่สุด" claims; EN: best, guaranteed, permanent, instant, painless, expert, specialist, risk-free. No toxin brand names. Galderma is not a current affiliation. Results: "ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล". Before/after labels are PRE / POST.
- No paid ads are created or changed. Ad ideas are drafts only (and any campaign must be created PAUSED by a human).
- Never invent facts, reviews, numbers or awards. Say "not verified" when unsure.

## Doctor's answers (30 Oct 2026)
- English consultations: YES — the clinic can consult in English (doctor and/or team). Captions and pages may say so.
- schema.org medicalSpecialty "Dermatology": KEEP as is. Do not ask again.
