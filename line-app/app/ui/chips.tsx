"use client";
import { useState } from "react";
import { joinPick, splitPick } from "@/lib/options";

/**
 * Tap-to-pick chips. Works inside a server-action <form> (pass `name`, value goes in a hidden input) or as a
 * controlled field (pass `value` + `onChange`). "ไม่มี" clears the others. `other` adds a short free-text box.
 */
export function Chips({ name, options, defaultValue, value, onChange, other = true, otherLabel = "อื่นๆ (พิมพ์เพิ่ม)", single = false }: {
  name?: string; options: string[]; defaultValue?: string | null; value?: string; onChange?: (v: string) => void;
  other?: boolean; otherLabel?: string; single?: boolean;
}) {
  const init = splitPick(value ?? defaultValue, options);
  const [picked, setPicked] = useState<string[]>(init.picked);
  const [extra, setExtra] = useState(init.other);
  const emit = (p: string[], e: string) => { setPicked(p); setExtra(e); onChange?.(joinPick(p, e)); };
  const toggle = (o: string) => {
    if (single) return emit(picked[0] === o ? [] : [o], extra);
    if (o === "ไม่มี") return emit(picked.includes(o) ? [] : [o], "");
    const base = picked.filter((x) => x !== "ไม่มี");
    emit(base.includes(o) ? base.filter((x) => x !== o) : [...base, o], extra);
  };
  return (
    <div className="chips-wrap">
      {name && <input type="hidden" name={name} value={joinPick(picked, extra)} />}
      <div className="chips" role="group">
        {options.map((o) => <button key={o} type="button" className="chip" aria-pressed={picked.includes(o)} onClick={() => toggle(o)}>{o}</button>)}
      </div>
      {other && !picked.includes("ไม่มี") && <input className="chip-other" value={extra} placeholder={otherLabel} onChange={(e) => emit(picked, e.target.value)} />}
    </div>
  );
}
