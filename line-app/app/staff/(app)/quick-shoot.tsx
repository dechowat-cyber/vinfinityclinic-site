import { startPhotoSession } from "@/lib/photoActions";
import { KINDS } from "@/lib/photos";
import { Icon } from "./icons";

/** One tap from anywhere in the back-office straight into the camera. */
export function QuickShoot({ clientId, kind, protocol = "face5", openSession, consent = true, size = "small", label }: {
  clientId: number; kind: string; protocol?: string; openSession?: number | null; consent?: boolean; size?: "small" | "big"; label?: string;
}) {
  const cls = `btn ${size === "small" ? "small" : "big"} cam`;
  if (!consent) return <span className="tag bad" title="ต้องได้รับความยินยอมให้เก็บข้อมูลก่อน (FR-11)">ยังไม่ยินยอม ถ่ายไม่ได้</span>;
  if (openSession) return <a className={cls} href={`/staff/clients/${clientId}/capture?session=${openSession}`}><Icon name="camera" />ถ่ายต่อ</a>;
  return (
    <form action={startPhotoSession} style={{ display: "inline" }}>
      <input type="hidden" name="client_id" value={clientId} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="protocol" value={protocol} />
      <button className={cls}><Icon name="camera" />{label ?? `ถ่าย${KINDS[kind] ?? kind}`}</button>
    </form>
  );
}
