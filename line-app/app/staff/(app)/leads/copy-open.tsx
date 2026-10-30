"use client";
import { useState } from "react";

/** Copies the text in the form's textarea (as edited) and opens this chat in LINE OA Manager. `prefix` adds a greeting. */
export function CopyOpen({ formId, url, prefix = "", label = "คัดลอก + เปิดแชท" }: { formId: string; url: string; prefix?: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn small" onClick={async () => {
      const t = (document.querySelector(`#${formId} textarea`) as HTMLTextAreaElement | null)?.value ?? "";
      try { await navigator.clipboard.writeText(prefix + t); setOk(true); } catch { setOk(false); }
      window.open(url, "_blank", "noopener");
    }}>{ok ? "คัดลอกแล้ว ✓ เปิดแชท" : label}</button>
  );
}
