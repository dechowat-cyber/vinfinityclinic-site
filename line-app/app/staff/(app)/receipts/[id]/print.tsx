"use client";
export function PrintButton() {
  return <button type="button" className="btn" onClick={() => window.print()}>พิมพ์ / บันทึก PDF</button>;
}
