// Run with node scripts/test-gift.mjs. No network calls or customer records.
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createRequire } from "node:module"
import { execFileSync } from "node:child_process"

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "at-gift-test-"))
try {
  execFileSync("./node_modules/.bin/tsc", ["lib/gift.ts", "--module", "commonjs", "--target", "es2020", "--skipLibCheck", "--outDir", dir])
  const { parseGiftDetails, giftProperties } = createRequire(import.meta.url)(path.join(dir, "gift.js"))
  const gift = { firstName: " Test ", lastName: "Recipient", email: "recipient@example.com", senderName: "Giver", message: "Hello", start: "january" }
  assert.equal(parseGiftDetails(gift).firstName, "Test")
  for (const bad of [null, {}, { ...gift, email: "invalid" }, { ...gift, lastName: "" }, { ...gift, start: "tomorrow" }, { ...gift, message: "x".repeat(501) }]) {
    assert.equal(parseGiftDetails(bad), null)
  }
  const attributes = Object.fromEntries(giftProperties(parseGiftDetails(gift)).map(({ key, value }) => [key, value]))
  assert.equal(attributes.__rc_gift_recipient_email, "recipient@example.com")
  assert.equal(attributes.__rc_gift_recipient_first_name, "Test")
  assert.equal(attributes.__rc_gift_recipient_last_name, "Recipient")
  assert.equal(attributes.__rc_gift_sender_name, "Giver")
  assert.match(attributes.__rc_gift_recipient_note, /Hello[\s\S]*6-Month[\s\S]*January 2027/)
  assert.equal(attributes.__rc_gift_notification_scheduled_at, undefined, "A January start request must not delay the redemption email")
  assert.match(giftProperties({ ...gift, start: "next" }).find((a) => a.key === "__rc_gift_recipient_note").value, /next available envelope/)
  console.log("Gift validation and Recharge property contract passed")
} finally {
  fs.rmSync(dir, { recursive: true, force: true })
}
