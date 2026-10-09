"""Render reel.html to MP4 (1080x1920, 30 fps).

python3 tools/reel_ligaments/render.py            # full MP4
python3 tools/reel_ligaments/render.py --stills   # preview frames only
"""
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FONTS = ROOT / "assets" / "fonts"
OUT = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else HERE / "out"
FPS = 30


def page_html():
    faces = []
    for w in (300, 400, 500, 600):
        faces.append(f"@font-face{{font-family:Kanit;font-weight:{w};src:url('{(FONTS / f'kanit-thai-{w}-normal.woff2').as_uri()}')}}")
    for w in (400, 500, 600, 700):
        faces.append(f"@font-face{{font-family:Montserrat;font-weight:{w};src:url('{(FONTS / f'montserrat-latin-{w}-normal.woff2').as_uri()}')}}")
    html = (HERE / "reel.html").read_text(encoding="utf-8")
    logo = (ROOT / "assets" / "vinfinity-logo-h.svg").read_text(encoding="utf-8")
    return html.replace("/*__FONTS__*/", "\n".join(faces)).replace("__LOGO__", logo)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = HERE / "_render.html"
    tmp.write_text(page_html(), encoding="utf-8")
    stills = "--stills" in sys.argv
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.add_init_script("window.__CAPTURE__ = true")
        pg.goto(tmp.as_uri())
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(500)
        dur = pg.evaluate("window.DURATION")
        if stills:
            for t in (2.8, 8.8, 12, 18, 25.5, 32, 39, 46, 51.5):
                pg.evaluate(f"render({t})")
                pg.screenshot(path=str(OUT / f"still_{t:05.1f}.png"))
            b.close()
            return
        frames = OUT / "frames"
        frames.mkdir(exist_ok=True)
        n = int(dur * FPS)
        for i in range(n):
            pg.evaluate(f"render({i / FPS})")
            pg.screenshot(path=str(frames / f"f{i:05d}.jpg"), type="jpeg", quality=92)
        b.close()
    tmp.unlink(missing_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", str(frames / "f%05d.jpg"),
                    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "18", "-profile:v", "high",
                    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(OUT / "vinfinity-ligament-reel-th.mp4")], check=True)
    print("wrote", OUT / "vinfinity-ligament-reel-th.mp4")


if __name__ == "__main__":
    main()
