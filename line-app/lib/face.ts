// Client-side face geometry for guided capture and before/after alignment.
// Uses @vladmandic/face-api (tiny detector + 68 landmarks, models self-hosted under /models).
// Everything runs on the device; no image leaves the clinic iPad except the final upload.

export type Pt = { x: number; y: number };
export type Pose = {
  cx: number; cy: number;   // eye midpoint, as a fraction of the 3:4 frame
  scale: number;            // inter-ocular distance / frame width
  roll: number;             // degrees, + = head tilted clockwise on screen
  yaw: number;              // -0.5..0.5, + = nose towards the right of the screen
  pitch: number;            // nose drop between eyes and chin, 0..1
  points: Pt[];             // 68 landmarks in frame pixels
};

export const FRAME_RATIO = 3 / 4; // width / height of the stored photo

let api: any = null;
export async function loadFace() {
  if (api) return api;
  const faceapi: any = await import("@vladmandic/face-api");
  try { await faceapi.tf.setBackend("webgl"); } catch { /* falls back to cpu/wasm */ }
  await faceapi.tf.ready();
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  api = faceapi;
  return api;
}

/** Crop rectangle (in source pixels) of a centred 3:4 portrait frame, like CSS object-fit: cover. */
export function coverCrop(w: number, h: number) {
  if (w / h > FRAME_RATIO) { const cw = h * FRAME_RATIO; return { x: (w - cw) / 2, y: 0, w: cw, h }; }
  const ch = w / FRAME_RATIO; return { x: 0, y: (h - ch) / 2, w, h: ch };
}

const mean = (ps: Pt[]) => ({ x: ps.reduce((a, p) => a + p.x, 0) / ps.length, y: ps.reduce((a, p) => a + p.y, 0) / ps.length });

export function poseFrom(points: Pt[], srcW: number, srcH: number): Pose {
  const c = coverCrop(srcW, srcH);
  const fp = points.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
  const le = mean(fp.slice(36, 42)), re = mean(fp.slice(42, 48));
  const eye = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
  const iod = Math.hypot(re.x - le.x, re.y - le.y);
  const nose = fp[30], chin = fp[8], jl = fp[0], jr = fp[16];
  const jawMid = { x: (jl.x + jr.x) / 2, y: (jl.y + jr.y) / 2 };
  const jawW = Math.max(1, Math.hypot(jr.x - jl.x, jr.y - jl.y));
  return {
    cx: eye.x / c.w, cy: eye.y / c.h, scale: iod / c.w,
    roll: (Math.atan2(re.y - le.y, re.x - le.x) * 180) / Math.PI,
    yaw: (nose.x - jawMid.x) / jawW,
    pitch: (nose.y - eye.y) / Math.max(1, chin.y - eye.y),
    points: fp,
  };
}

export async function detect(input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<Pose | null> {
  const f = await loadFace();
  const w = (input as HTMLVideoElement).videoWidth || (input as HTMLImageElement).naturalWidth || (input as HTMLCanvasElement).width;
  const h = (input as HTMLVideoElement).videoHeight || (input as HTMLImageElement).naturalHeight || (input as HTMLCanvasElement).height;
  if (!w || !h) return null;
  const r = await f.detectSingleFace(input, new f.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })).withFaceLandmarks();
  if (!r) return null;
  return poseFrom(r.landmarks.positions.map((p: any) => ({ x: p.x, y: p.y })), w, h);
}

export function eyes(p: Pt[]) { return { l: mean(p.slice(36, 42)), r: mean(p.slice(42, 48)) }; }

/** 68 landmarks in the image's own pixel space (no crop), or null when no face is found. */
export async function landmarks(input: HTMLImageElement | HTMLCanvasElement): Promise<Pt[] | null> {
  const f = await loadFace();
  const r = await f.detectSingleFace(input, new f.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 })).withFaceLandmarks();
  return r ? r.landmarks.positions.map((p: any) => ({ x: p.x, y: p.y })) : null;
}
