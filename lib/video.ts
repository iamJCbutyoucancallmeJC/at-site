// Bunny Stream playback URLs, signed server-side (CDN token authentication).
//
// Proven against the live library 2026-10-07 (lib 773430):
//   token = base64url( sha256_raw( TOKEN_KEY + signPath + expires [+ "token_path=" + dir] ) )
//   - per file:   signPath = "/<id>/play_720p.mp4"            -> ?token=..&expires=..
//   - directory:  signPath = "/<id>/", plus the token_path tail -> ?token=..&expires=..&token_path=/<id>/
// Child HLS playlists and segments come back as RELATIVE paths with no query,
// so the client must append the same query to every request (hls.js xhrSetup).
// Browsers without MSE (iOS Safari) get the per-file MP4 fallback instead.
// Referrer must be on the library's allowed list (amytangerine.com, *.vercel.app, localhost).
// Without BUNNY_STREAM_TOKEN_KEY the URLs are returned unsigned (dev library without token auth).

import "server-only"

const CDN = process.env.BUNNY_STREAM_CDN_HOST ?? "" // vz-xxxx.b-cdn.net
const TOKEN_KEY = process.env.BUNNY_STREAM_TOKEN_KEY ?? ""

export function videoConfigured(): boolean {
  return CDN.length > 0
}

async function sign(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
  return Buffer.from(new Uint8Array(d)).toString("base64url")
}

export type PlaybackSource = {
  hls: string // master playlist with the directory token
  hlsQuery: string // "token=..&expires=..&token_path=.." to append to every child request
  mp4: string // signed MP4 fallback for browsers without MSE
  poster: string
}

export async function playbackSource(videoId: string, ttlSeconds = 6 * 3600, mp4Res = "720p"): Promise<PlaybackSource | null> {
  if (!videoConfigured() || !videoId) return null
  const base = `https://${CDN}/${videoId}`
  const dir = `/${videoId}/`
  if (!TOKEN_KEY) {
    return { hls: `${base}/playlist.m3u8`, hlsQuery: "", mp4: `${base}/play_${mp4Res}.mp4`, poster: `${base}/thumbnail.jpg` }
  }
  // Expiry snaps to a window boundary so repeated renders of the same page
  // produce the SAME signed URL for hours: a React Server Component refresh
  // mid-playback otherwise hands the player a "new" URL and resets it.
  const window = Math.max(600, ttlSeconds)
  const expires = (Math.floor(Date.now() / 1000 / window) + 2) * window
  const dirToken = await sign(`${TOKEN_KEY}${dir}${expires}token_path=${dir}`)
  const hlsQuery = `token=${dirToken}&expires=${expires}&token_path=${encodeURIComponent(dir)}`
  const file = async (name: string) => `${base}/${name}?token=${await sign(`${TOKEN_KEY}${dir}${name}${expires}`)}&expires=${expires}`
  return {
    hls: `${base}/playlist.m3u8?${hlsQuery}`,
    hlsQuery,
    mp4: await file(`play_${mp4Res}.mp4`),
    poster: await file("thumbnail.jpg"),
  }
}
