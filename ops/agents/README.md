# Vinfinity daily agents (internal — not deployed, see /.vercelignore)

Four scheduled agents run every morning (Bangkok) and email a progress report to Dr. Dechowat.
Each keeps its own file here: a backlog (what to do next) and a dated log (what was done).

| Agent | Time (BKK) | File |
|---|---|---|
| SEO | 07:10 | seo.md |
| AEO (AI-search answers) | 07:20 | aeo.md |
| Marketing | 07:30 | marketing.md |
| Branding | 07:40 | branding.md |

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
