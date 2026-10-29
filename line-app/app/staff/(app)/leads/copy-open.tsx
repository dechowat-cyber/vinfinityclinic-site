"use client";
import { useState } from "react";

/** Copies the draft (as edited in the box above) and opens this chat in LINE OA Manager. */
export function CopyOpen({ formId, url }: { formId: string; url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn small" onClick={async () => {
      const t = (document.querySelector(`#${formId} textarea`) as HTMLTextAreaElement | null)?.value ?? "";
      try { await navigator.clipboard.writeText(t); setOk(true); } catch { setOk(false); }
      window.open(url, "_blank", "noopener");
    }}>{ok ? "คัดลอกแล้ว ✓ เปิดแชท" : "คัดลอก + เปิดแชท"}</button>
  );
}
