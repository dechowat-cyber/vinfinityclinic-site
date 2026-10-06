# Vinfinity Clinic: Thai → English translation rules

Readers: foreign patients in and around Udon Thani (expats, visitors, Lao patients from Vientiane, English-speaking Thais). Write natural, warm, clear English, as a native-speaking medical copywriter would. Do not translate word for word. Keep the meaning, every fact, every number and every citation.

## Files
- Source: `pages/<name>.html` (Thai). Output: `pages/en/<name>.html`, with the same file name.
- Keep the HTML structure the same: tags, classes, ids, anchors (`id="..."`, `href="#..."`), image `src`/`srcset`, width/height, `<sup>` citation links, tables, SVG markup and inline styles.
- Translate visible text, `alt` text, `aria-label`, `title` and `figcaption`. Translate Thai text inside SVG `<text>` too. Keep the same coordinates. If the English is much longer, shorten the wording rather than letting it overflow.
- Leave every `{{PLACEHOLDER}}` exactly as is (`{{LINE}}`, `{{MSG}}`, `{{FAQ}}`, `{{ADDR}}`, `{{ANATOMY}}`, `{{RESULTS_EYE}}`, `{{RESULTS_MEN}}`, `{{RESULTS_LAYERS}}`, `{{BA_JS}}`, `{{REVIEWS}}`, `{{CLINIC_INFO}}`, `{{MAP}}`).
- Do not add or remove sections. Do not add claims, numbers, prices or facts that are not in the Thai.

## Internal links → English counterparts
Every internal link `href="/X"` becomes `href="/en/X"`. Examples:
- `/` → `/en/`; `/#programs` → `/en/#programs`
- `/filler/` → `/en/filler/`; `/articles/filler-long-term/` → `/en/articles/filler-long-term/`
- `/price/` → `/en/price/`; `/doctor/` → `/en/doctor/`
- Leave `/assets/...` and external links (https://...) unchanged.
- `/menu/` stays `/menu/`.

## Terms
- นพ.เดโชวัต พรมดา → Dr. Dechowat Promda (in bylines: "Dechowat Promda, M.D."). หมอบาส → Dr. Bas.
- อุดร / อุดรธานี → Udon Thani. เวียงจันทน์ สปป.ลาว → Vientiane, Laos.
- อย. → Thai FDA. เลขทะเบียน อย. → Thai FDA registration number. แพทยสภา → Medical Council of Thailand. สบส. → Department of Health Service Support (HSS). ใบอนุญาตสถานพยาบาล → clinic (medical facility) license. ฆสพ. → advertising approval number (keep the number as is).
- Prices: "9,990 บาท" → "THB 9,990". "บาทต่อ cc" → "per cc". Keep every price exactly as written.
- ฟิลเลอร์ → dermal filler / HA filler. สกินบูสเตอร์ → skin booster. โบท็อก / ท็อกซิน → botulinum toxin (it is fine to say "anti-wrinkle injections (botulinum toxin)"). Do not name toxin brands in new text. Sculptra, Ellansé, New Doublo 2.0 and other product names stay as written.
- ร่องใต้ตา → tear trough. กายวิภาค → anatomy. ชั้น → layer. ฉันทามติ → consensus.
- The Filler Architect, The Architect Rebuild and Vinfinity Wallet stay in English as is.
- Thai Buddhist-era dates: 7 ตุลาคม 2569 → 7 October 2026. Article meta looks like: "By Dechowat Promda, M.D. · Updated 7 October 2026 · 7 min read".

## Compliance (Thai medical advertising rules; English equivalents banned too)
Never write: best, No.1, 100%, guaranteed, permanent cure, instant results, miracle, risk-free, painless (say "most people find it tolerable"), expert or specialist (unless it is a formal title in a citation). Keep "Results vary from person to person" wherever the Thai has ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล. Keep all medical disclaimers.

## References
Citation lists (`<ol class="refs">`) are already in English: copy them unchanged. If a reference has a Thai description in brackets, translate only that bracketed text.

## When done
Check that the output has no Thai characters left, except in references that are inherently Thai (e.g. Thai government website names). Use: `python3 -c "import re,sys;s=open(sys.argv[1]).read();print(re.findall(r'[฀-๿]+',s)[:20])" pages/en/<file>`. Check every `{{...}}` from the source is present, and that the tag count is roughly equal to the source.
