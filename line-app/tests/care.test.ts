import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS } from "../lib/settings";
import { upsertClientByLine, recordConsent } from "../lib/crm";
import { aftercare } from "../lib/tick";
import { q, one } from "../lib/db";
import { CARE_CARDS, CARE_VERSION, careFlex, cardFor } from "../lib/careCards";
import { joinPick, splitPick, CONCERNS } from "../lib/options";

const live = { ...DEFAULTS, aftercareApproved: true, aftercareVersion: CARE_VERSION };

test("five self-care cards exist, Sculptra carries the 5-5-5 massage, cards render as LINE flex", () => {
  for (const k of ["filler", "toxin", "sculptra", "hifu", "microneedle"]) {
    const c = CARE_CARDS[k];
    assert.ok(c && c.doList.length && c.avoid.length && c.urgent.length, k);
    const f = careFlex(c, DEFAULTS.phone);
    assert.equal(f.type, "flex");
    assert.ok(JSON.stringify(f).length < 30000);
  }
  assert.ok(JSON.stringify(CARE_CARDS.sculptra.special).includes("5 นาที"));
  assert.equal(cardFor("energy"), CARE_CARDS.hifu);
  assert.equal(cardFor("skinbooster"), undefined);
});

test("catalog has Sculptra / HIFU / Microneedle and New Doublo uses the HIFU card", async () => {
  const rows = await q("select code, aftercare_key from catalog where code in ('SCULPTRA','HIFU','MN','DOUBLO') order by code");
  assert.deepEqual(rows.map((r) => `${r.code}:${r.aftercare_key}`), ["DOUBLO:hifu", "HIFU:hifu", "MN:microneedle", "SCULPTRA:sculptra"]);
  assert.ok((await one("select body from aftercare_templates where key = 'sculptra' and day = 1"))!.body.includes("5-5-5"));
});

test("card goes out right after the treatment is marked done, once", async () => {
  const c = await upsertClientByLine("UCARD", {});
  await recordConsent(c.id, "data", true, "t");
  await q("update clients set followed = true where id = $1", [c.id]);
  const cat = await one("select id from catalog where code = 'SCULPTRA'");
  const now = new Date("2026-10-05T07:00:00Z"); // 14:00 Bangkok
  await q("insert into treatments(client_id, catalog_id, name, aftercare_key, done_at) values ($1,$2,'Sculptra','sculptra',$3)", [c.id, cat!.id, new Date(now.getTime() - 5 * 60000).toISOString()]);
  assert.equal(await aftercare(now, DEFAULTS), 0); // nothing before the doctor approves
  assert.equal(await aftercare(now, live), 1);
  assert.equal(await aftercare(now, live), 0);
  assert.equal((await one("select count(*)::int n from touchpoints where client_id = $1 and kind = 'aftercare_card'", [c.id]))!.n, 1);
});

test("chips round-trip: picked options and free text", () => {
  const v = joinPick([CONCERNS[0], CONCERNS[2]], "อยากปรึกษาเรื่องจมูกด้วย");
  assert.deepEqual(splitPick(v, CONCERNS), { picked: [CONCERNS[0], CONCERNS[2]], other: "อยากปรึกษาเรื่องจมูกด้วย" });
});
