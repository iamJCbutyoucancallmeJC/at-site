// Bunny Stream playback URLs, signed server-side (token authentication).
// Docs: https://docs.bunny.net/docs/stream-embed-token-authentication
//   token = sha256_hex(TOKEN_KEY + videoId + expires)
//   https://<cdn>/<videoId>/playlist.m3u8?token=<token>&expires=<unix>
// Without BUNNY_STREAM_TOKEN_KEY the URL is returned unsigned (library without
// token auth, e.g. local dev). Never import from a client component.

import "server-only"

const CDN = process.env.BUNNY_STREAM_CDN_HOST ?? "" // e.g. vz-abc123.b-cdn.net
const TOKEN_KEY = process.env.BUNNY_STREAM_TOKEN_KEY ?? ""

export function videoConfigured(): boolean {
  return CDN.length > 0
}

async function sha256hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
  return Buffer.from(new Uint8Array(d)).toString("hex")
}

export type PlaybackSource = { hls: string; poster: string }

export async function playbackSource(videoId: string, ttlSeconds = 6 * 3600): Promise<PlaybackSource | null> {
  if (!videoConfigured() || !videoId) return null
  const base = `https://${CDN}/${videoId}`
  if (!TOKEN_KEY) return { hls: `${base}/playlist.m3u8`, poster: `${base}/thumbnail.jpg` }
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds
  const token = await sha256hex(`${TOKEN_KEY}${videoId}${expires}`)
  const q = `?token=${token}&expires=${expires}`
  return { hls: `${base}/playlist.m3u8${q}`, poster: `${base}/thumbnail.jpg${q}` }
}
