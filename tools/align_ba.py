#!/usr/bin/env python3
"""Align each AFTER photo onto its BEFORE photo (same scale, position, tilt),
then crop both to the same 450x574 frame.

Usage: python tools/align_ba.py SRC_DIR OUT_DIR [--debug DIR]
SRC_DIR holds Vinfinity_BA_CaseNN_*.png (1080x1350 composed posts).
Needs opencv-python-headless<5, numpy.

Method: image registration (ECC, similarity transform) on the whole face,
coarse-to-fine. Only geometry changes — no retouching, colour or content edits.
"""
import glob, math, sys
from pathlib import Path
import cv2
import numpy as np

CASES = ["06", "09", "15", "25", "13", "14", "16", "20", "26", "27"]
# usable photo area inside each composed post (inside rounded corners, above BEFORE/AFTER labels)
BOX = {"b": (70, 356, 524, 995), "a": (556, 356, 1010, 995)}
OUT_W, OUT_H = 450, 574
ASPECT = OUT_W / OUT_H


def gray(p):
    g = cv2.cvtColor(p, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    g = cv2.GaussianBlur(g, (0, 0), 2)
    # use local contrast so lighting differences matter less
    return g - cv2.GaussianBlur(g, (0, 0), 25)


def register(b, a):
    """Return 2x3 matrix W mapping AFTER coords -> BEFORE coords (similarity)."""
    gb, ga = gray(b), gray(a)
    best = None
    h, w = gb.shape
    starts = [(s0, ty) for s0 in (0.85, 0.92, 1.0, 1.08, 1.18) for ty in (-120, -60, 0, 60, 120)]
    for s0, ty in starts:  # several starting scales/offsets, keep the best fit
        W = np.array([[s0, 0, 0], [0, s0, 0]], np.float32)
        W[:, 2] = [(1 - s0) * w / 2, (1 - s0) * h / 2 + ty]
        ok = True
        for f in (0.25, 0.5, 1.0):
            sb = cv2.resize(gb, None, fx=f, fy=f); sa = cv2.resize(ga, None, fx=f, fy=f)
            Wf = W.copy(); Wf[:, 2] *= f
            try:
                cc, Wf = cv2.findTransformECC(sb, sa, Wf, cv2.MOTION_AFFINE,
                                              (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, 5)
            except cv2.error:
                ok = False; break
            W = Wf.copy(); W[:, 2] /= f
        sc_ = math.sqrt(abs(np.linalg.det(W[:, :2]))) if ok else 0
        if ok and 0.7 < sc_ < 1.4 and (best is None or cc > best[0]):
            best = (cc, W)
    cc, W = best
    # findTransformECC gives warp from template(b) coords to input(a) coords; project to similarity
    A = W[:, :2]
    sc = math.sqrt(abs(np.linalg.det(A)))
    ang = math.atan2(A[1, 0] - A[0, 1], A[0, 0] + A[1, 1])
    R = np.array([[math.cos(ang), -math.sin(ang)], [math.sin(ang), math.cos(ang)]]) * sc
    # keep the same mapping of the panel centre
    h, w = b.shape[:2]
    c = np.array([w / 2, h / 2])
    t = W[:, :2] @ c + W[:, 2] - R @ c
    Wb2a = np.hstack([R, t[:, None]]).astype(np.float32)
    return cc, sc, math.degrees(ang), Wb2a


def max_rect(mask):
    """Largest ASPECT rect fully inside mask, preferring the centre."""
    h, w = mask.shape
    ii = cv2.integral(mask.astype(np.uint8))
    for rh in range(h, 100, -2):
        rw = int(round(rh * ASPECT))
        if rw > w: continue
        best = None
        for y in range(0, h - rh + 1, 2):
            for x in range(0, w - rw + 1, 2):
                s = ii[y + rh, x + rw] - ii[y, x + rw] - ii[y + rh, x] + ii[y, x]
                if s == rw * rh:
                    d = abs(x + rw / 2 - w / 2) + 0.5 * abs(y + rh / 2 - h * 0.48)
                    if best is None or d < best[0]:
                        best = (d, x, y, rw, rh)
        if best:
            return best[1:]
    return None


def main(src, out, dbg=None):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    for c in CASES:
        im = cv2.imread(glob.glob(f"{src}/Vinfinity_BA_Case{c}_*.png")[0])
        b = im[BOX["b"][1]:BOX["b"][3], BOX["b"][0]:BOX["b"][2]]
        a = im[BOX["a"][1]:BOX["a"][3], BOX["a"][0]:BOX["a"][2]]
        cc, sc, ang, W = register(b, a)
        h, w = b.shape[:2]
        a_on_b = cv2.warpAffine(a, W, (w, h), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP)
        valid = cv2.warpAffine(np.ones(a.shape[:2], np.uint8), W, (w, h),
                               flags=cv2.INTER_NEAREST | cv2.WARP_INVERSE_MAP, borderValue=0)
        valid = cv2.erode(valid, np.ones((5, 5), np.uint8))
        x, y, rw, rh = max_rect(valid > 0)
        for k, img in (("b", b), ("a", a_on_b)):
            o = cv2.resize(img[y:y + rh, x:x + rw], (OUT_W, OUT_H), interpolation=cv2.INTER_AREA if rw >= OUT_W else cv2.INTER_CUBIC)
            cv2.imwrite(str(out / f"case{c}-{k}.jpg"), o, [cv2.IMWRITE_JPEG_QUALITY, 86])
            cv2.imwrite(str(out / f"case{c}-{k}.webp"), o, [cv2.IMWRITE_WEBP_QUALITY, 84])
        print(f"{c} ecc={cc:.3f} scale={sc:.3f} rot={ang:+.2f}° crop={rw}x{rh}@{x},{y}")
        if dbg:
            Path(dbg).mkdir(parents=True, exist_ok=True)
            bo = cv2.resize(b[y:y + rh, x:x + rw], (OUT_W, OUT_H))
            ao = cv2.resize(a_on_b[y:y + rh, x:x + rw], (OUT_W, OUT_H))
            blend = cv2.addWeighted(bo, .5, ao, .5, 0)
            cv2.imwrite(f"{dbg}/chk{c}.jpg", np.hstack([bo, ao, blend]))


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[1], a[3] if len(a) > 3 and a[2] == "--debug" else None)
