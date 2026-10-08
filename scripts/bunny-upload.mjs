#!/usr/bin/env node
// Upload (or replace) a class video in the Bunny Stream library and print its GUID.
//   node scripts/bunny-upload.mjs <file.mp4> "<title>"
// Same title = the old video is DELETED and a new one created (Bunny refuses a second upload to
// a GUID), so the printed GUID changes: paste it into the env again.
// Env (.env.local): BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY.
import fs from "node:fs"
import path from "node:path"

const envFile = path.join(process.cwd(), ".env.local")
if (fs.existsSync(envFile)) for (const l of fs.readFileSync(envFile, "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "")
}
const LIB = process.env.BUNNY_STREAM_LIBRARY_ID, KEY = process.env.BUNNY_STREAM_API_KEY
const [file, title] = process.argv.slice(2)
if (!LIB || !KEY) { console.error("BUNNY_STREAM_LIBRARY_ID / BUNNY_STREAM_API_KEY missing"); process.exit(2) }
if (!file || !title) { console.error("usage: bunny-upload.mjs <file> <title>"); process.exit(2) }
const api = (p, init = {}) => fetch(`https://video.bunnycdn.com/library/${LIB}${p}`, { ...init, headers: { AccessKey: KEY, accept: "application/json", ...(init.headers || {}) } })

const list = await (await api(`/videos?search=${encodeURIComponent(title)}&itemsPerPage=50`)).json()
const old = (list.items || []).find((v) => v.title === title)
if (old) {
  const d = await api(`/videos/${old.guid}`, { method: "DELETE" })
  console.error(`deleted old "${title}" (${old.guid}) ${d.ok ? "ok" : d.status}`)
}
const video = await (await api(`/videos`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title }) })).json()
console.error(`created "${title}" (${video.guid})`)
const size = fs.statSync(file).size
const res = await api(`/videos/${video.guid}`, { method: "PUT", headers: { "content-type": "application/octet-stream", "content-length": String(size) }, body: fs.createReadStream(file), duplex: "half" })
if (!res.ok) { console.error("upload failed", res.status, await res.text()); process.exit(1) }
console.error(`uploaded ${(size / 1e6).toFixed(1)} MB; Bunny is encoding`)
console.log(video.guid)
