import { test } from "node:test";
import assert from "node:assert/strict";
import { scheduledBroadcastTick, SCHEDULED_BROADCASTS } from "../lib/scheduledBroadcasts";
import { mediaSet } from "../lib/campaignMedia";

process.env.LINE_CHANNEL_ACCESS_TOKEN = "";

test("launch broadcast: only inside its 25 Nov morning window, exactly once, with the live box-25 card set", async () => {
  const s = SCHEDULED_BROADCASTS.find((x) => x.id === "gift-launch-2611-25")!;
  assert.ok(mediaSet(s.set, new Date("2026-11-25T03:00:00Z")), "set is live at 10:00");
  const fake = [{ ...s, id: "test-launch" }];
  assert.deepEqual(await scheduledBroadcastTick(new Date("2026-11-25T02:55:00Z"), fake), []); // 09:55
  assert.deepEqual(await scheduledBroadcastTick(new Date("2026-11-25T06:00:00Z"), fake), []); // 13:00, window closed
  assert.deepEqual(await scheduledBroadcastTick(new Date("2026-11-25T03:01:00Z"), fake), ["test-launch"]);
  assert.deepEqual(await scheduledBroadcastTick(new Date("2026-11-25T03:06:00Z"), fake), []);
});
