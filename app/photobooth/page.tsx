"use client"

// /photobooth — Amy's photo booth, living on the site (t897).
//
// Ported from the standalone static app at photobooth.amytangerine.com
// (~/amy-photobooth: index.html / app.js / styles.css). The standing direction
// out of the Oaxaca walk is that experiments live as at-site ROUTES under the
// "Fun Stuff" nav, never as one-off subdomains; this booth is instance #1.
//
// The port is deliberately faithful: same 4-photo strip, same three filters,
// same countdown/flash, same flip-camera, same Web-Share-then-download save
// path, same "amytangerine.com" watermark burned into the strip. The imperative
// getElementById code became refs + state, and the canvas math is unchanged
// line for line. Styles: ./photobooth.css (namespaced, see its header).
//
// New here that the standalone never had: GA4. The site's layout already fires
// page_view, and this file adds photobooth_session_start (user taps capture)
// and photobooth_strip_save (strip shared or downloaded) via the house
// trackEvent idiom, so the weekly digest can see whether anyone uses it.
//
// Camera needs HTTPS or localhost — on a Vercel preview URL it works; over a
// LAN IP in `next dev` it won't, and the status line says so.

import { useCallback, useEffect, useRef, useState } from "react"
import { trackEvent } from "@/lib/analytics"
import "./photobooth.css"

const PHOTOS_PER_STRIP = 4
const COUNTDOWN_SECONDS = 3
const PHOTO_WIDTH = 600
const PHOTO_HEIGHT = 800

type BoothFilter = "none" | "bw" | "vintage"
type FacingMode = "user" | "environment"

const FILTERS: { id: BoothFilter; label: string }[] = [
  { id: "none", label: "Normal" },
  { id: "bw", label: "B&W" },
  { id: "vintage", label: "Vintage" },
]

// Live preview filter applied to the <video> element (the captured frame gets the
// real per-pixel filter below; this is just so the preview matches).
const PREVIEW_FILTER: Record<BoothFilter, string> = {
  none: "none",
  bw: "grayscale(100%)",
  vintage: "sepia(40%) saturate(1.2) brightness(1.05)",
}

const IDLE_STATUS = "Tap to start your session"

// ── REVIEW DECISION (t897): when does the camera prompt fire? ────────────────
// The standalone booth asked for the camera the instant the page loaded (app.js
// ran init() -> startCamera() with no user gesture). On its own subdomain that
// was defensible: you only ever landed there on purpose. Reached instead from a
// "Fun Stuff" nav item on Amy's main commercial site, a browsing customer now
// gets a camera prompt on amytangerine.com itself — and camera permission is a
// per-ORIGIN, sticky decision, so a reflexive "Block" blocks the camera for the
// whole domain, invisibly and for good. Browsers also increasingly distrust
// permission requests that aren't tied to a user gesture.
//
//   false — the ported behavior, unchanged: prompt on page load. Ships as-is,
//           because the port brief said look and behavior unchanged.
//   true  — gated: no prompt until the visitor taps the capture button. The
//           first tap turns the camera on (that tap IS the gesture); once they
//           can see themselves, the next tap starts the 4-photo session.
//
// Flip this one word to try the other behavior — nothing else changes.
//
// SET TO true BY JC, 2026-08-04, before the port shipped. Reasoning above stands:
// the per-origin stickiness is the whole argument. A visitor who reflexively
// Blocks on the booth silently loses camera for all of amytangerine.com, and
// nobody would ever see it happen. This also closes a second, uglier hole that
// only shows up once permission is denied: ungated, the capture button stays
// enabled after a Block, so tapping it runs the full 17-second countdown and
// hands the visitor an all-black photo strip with Amy's watermark on it. Gated,
// that tap re-requests permission and reports the failure instead.
const REQUIRE_TAP_TO_START_CAMERA = true

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

// Apply filter to canvas (verbatim from app.js).
function applyFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: BoothFilter,
) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (filter === "bw") {
      // Grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
    } else if (filter === "vintage") {
      // Sepia/vintage effect
      data[i] = Math.min(255, r * 1.1 + 40) // More red
      data[i + 1] = Math.min(255, g * 0.95 + 20) // Slightly less green
      data[i + 2] = Math.min(255, b * 0.8) // Less blue
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export default function PhotoboothPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const stripCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const stripPreviewRef = useRef<HTMLDivElement | null>(null)

  // Imperative state the async capture loop reads — refs, not React state, so the
  // loop never closes over a stale value mid-session.
  const streamRef = useRef<MediaStream | null>(null)
  const photosRef = useRef<HTMLCanvasElement[]>([])
  const filterRef = useRef<BoothFilter>("none")
  const facingRef = useRef<FacingMode>("user")
  const capturingRef = useRef(false)
  const aliveRef = useRef(true)

  // Render state.
  const [status, setStatus] = useState(IDLE_STATUS)
  const [activeFilter, setActiveFilter] = useState<BoothFilter>("none")
  const [facingMode, setFacingMode] = useState<FacingMode>("user")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flashKey, setFlashKey] = useState(0)
  const [flashing, setFlashing] = useState(false)
  const [showStrip, setShowStrip] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  // Start camera stream (verbatim constraints from app.js).
  const startCamera = useCallback(async () => {
    stopStream()

    const constraints = {
      video: {
        facingMode: facingRef.current,
        // Use natural camera resolution for wider field of view.
        // Avoid specifying exact dimensions which causes digital zoom.
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // Request wide angle if available (helps on newer iPhones).
        zoom: { ideal: 1 },
        resizeMode: "none",
      },
      audio: false,
    } as unknown as MediaStreamConstraints

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    // The effect may have torn down while getUserMedia was in flight (React
    // strict-mode double-mount, or a fast route change). Don't leak the camera.
    if (!aliveRef.current) {
      stream.getTracks().forEach((track) => track.stop())
      return
    }

    streamRef.current = stream
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream

    // Try to set minimum zoom if track supports it.
    const track = stream.getVideoTracks()[0]
    const capabilities = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & {
      zoom?: { min: number }
    }
    if (capabilities.zoom) {
      try {
        await track.applyConstraints({
          advanced: [{ zoom: capabilities.zoom.min }],
        } as unknown as MediaTrackConstraints)
      } catch {
        // Zoom constraint not supported, continue without it.
      }
    }

    // Wait for video to be ready.
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        void video.play()
        resolve()
      }
    })
  }, [stopStream])

  // Init on mount: request the camera, same as the standalone booth did on load.
  // Skipped entirely when the tap-gate is on — see REQUIRE_TAP_TO_START_CAMERA.
  useEffect(() => {
    aliveRef.current = true

    if (!REQUIRE_TAP_TO_START_CAMERA) {
      startCamera().catch((err) => {
        console.error("Init error:", err)
        if (aliveRef.current) {
          setStatus("Unable to access camera. Please allow camera permissions.")
        }
      })
    }

    return () => {
      aliveRef.current = false
      stopStream()
    }
  }, [startCamera, stopStream])

  // Flip between front/back camera.
  const flipCamera = useCallback(async () => {
    const next: FacingMode = facingRef.current === "user" ? "environment" : "user"
    facingRef.current = next
    setFacingMode(next)

    try {
      await startCamera()
    } catch (err) {
      console.error("Error flipping camera:", err)
      // Revert if flip fails.
      const reverted: FacingMode = next === "user" ? "environment" : "user"
      facingRef.current = reverted
      setFacingMode(reverted)
    }
  }, [startCamera])

  const selectFilter = useCallback((filter: BoothFilter) => {
    filterRef.current = filter
    setActiveFilter(filter)
  }, [])

  // Capture a single photo (canvas math verbatim from app.js).
  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!video || !ctx) return canvas

    canvas.width = PHOTO_WIDTH
    canvas.height = PHOTO_HEIGHT

    // Calculate crop to maintain aspect ratio.
    const videoRatio = video.videoWidth / video.videoHeight
    const targetRatio = PHOTO_WIDTH / PHOTO_HEIGHT

    let sx: number, sy: number, sw: number, sh: number

    if (videoRatio > targetRatio) {
      // Video is wider - crop sides
      sh = video.videoHeight
      sw = sh * targetRatio
      sx = (video.videoWidth - sw) / 2
      sy = 0
    } else {
      // Video is taller - crop top/bottom
      sw = video.videoWidth
      sh = sw / targetRatio
      sx = 0
      sy = (video.videoHeight - sh) / 2
    }

    // Mirror for front camera.
    if (facingRef.current === "user") {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT)

    // Reset transform.
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    if (filterRef.current !== "none") {
      applyFilter(ctx, canvas.width, canvas.height, filterRef.current)
    }

    return canvas
  }, [])

  // Generate the photo strip (layout + watermark verbatim from app.js).
  const generateStrip = useCallback(() => {
    const stripCanvas = stripCanvasRef.current
    if (!stripCanvas) return

    const padding = 20
    const photoDisplayWidth = 300
    const photoDisplayHeight = 400
    const gap = 10

    const stripWidth = photoDisplayWidth + padding * 2
    const stripHeight =
      photoDisplayHeight * PHOTOS_PER_STRIP + gap * (PHOTOS_PER_STRIP - 1) + padding * 2

    stripCanvas.width = stripWidth
    stripCanvas.height = stripHeight

    const ctx = stripCanvas.getContext("2d")
    if (!ctx) return

    // Black background
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, stripWidth, stripHeight)

    // Draw each photo
    photosRef.current.forEach((photo, index) => {
      const x = padding
      const y = padding + index * (photoDisplayHeight + gap)
      ctx.drawImage(photo, x, y, photoDisplayWidth, photoDisplayHeight)
    })

    // Watermark (unchanged — this is the branding that rides every saved strip).
    ctx.fillStyle = "#666"
    ctx.font = '10px -apple-system, sans-serif'
    ctx.textAlign = "center"
    ctx.fillText("amytangerine.com", stripWidth / 2, stripHeight - 8)

    setShowStrip(true)
    // Let the class toggle commit before scrolling to it.
    setTimeout(() => {
      stripPreviewRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }, [])

  const triggerFlash = useCallback(() => {
    setFlashKey((k) => k + 1)
    setFlashing(true)
    setTimeout(() => setFlashing(false), 150)
  }, [])

  const doCountdown = useCallback(async () => {
    for (let i = COUNTDOWN_SECONDS; i > 0; i--) {
      setCountdown(i)
      await delay(1000)
    }
    setCountdown(null)
  }, [])

  // Start the capture session.
  const startCapture = useCallback(async () => {
    if (capturingRef.current) return

    // Tap-gate: the first tap only turns the camera on, so the permission prompt
    // is tied to a real user gesture and the visitor gets to frame themselves
    // before anything counts down. No-op when the gate is off.
    if (REQUIRE_TAP_TO_START_CAMERA && !streamRef.current) {
      setStatus("Starting camera...")
      try {
        await startCamera()
        setStatus(IDLE_STATUS)
      } catch (err) {
        console.error("Init error:", err)
        setStatus("Unable to access camera. Please allow camera permissions.")
      }
      return
    }

    capturingRef.current = true
    photosRef.current = []
    setCapturing(true)
    setShowStrip(false)

    trackEvent("photobooth_session_start", {
      filter: filterRef.current,
      camera: facingRef.current,
      photos_per_strip: PHOTOS_PER_STRIP,
    })

    for (let i = 0; i < PHOTOS_PER_STRIP; i++) {
      setStatus(`Photo ${i + 1} of ${PHOTOS_PER_STRIP}`)

      await doCountdown()

      setStatus("Hold still...")
      await delay(300)

      photosRef.current.push(capturePhoto())

      triggerFlash()

      // Brief pause between photos.
      if (i < PHOTOS_PER_STRIP - 1) {
        await delay(800)
      }
    }

    setStatus("Creating your photo strip...")
    await delay(500)

    generateStrip()

    capturingRef.current = false
    setCapturing(false)
    setStatus("Tap to start a new session")
  }, [capturePhoto, doCountdown, generateStrip, startCamera, triggerFlash])

  // Save the strip using the native share sheet, falling back to download.
  const saveStrip = useCallback(async () => {
    const stripCanvas = stripCanvasRef.current
    if (!stripCanvas) return

    const blob = await new Promise<Blob | null>((resolve) => {
      stripCanvas.toBlob(resolve, "image/jpeg", 0.9)
    })
    if (!blob) return

    const file = new File([blob], `photobooth-${Date.now()}.jpg`, { type: "image/jpeg" })

    // Try Web Share API first (native share sheet on iOS/mobile).
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Photo Strip" })
        trackEvent("photobooth_strip_save", { method: "share", filter: filterRef.current })
        return
      } catch (err) {
        // User cancelled or share failed - fall through to download.
        if ((err as Error)?.name === "AbortError") return
      }
    }

    // Fallback: direct download.
    const dataUrl = stripCanvas.toDataURL("image/jpeg", 0.9)
    const link = document.createElement("a")
    link.download = `photobooth-${Date.now()}.jpg`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    trackEvent("photobooth_strip_save", { method: "download", filter: filterRef.current })
  }, [])

  const resetSession = useCallback(() => {
    photosRef.current = []
    setShowStrip(false)
    setStatus(IDLE_STATUS)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <div className="pb-root">
      <div className="pb-container">
        <header className="pb-header">
          {/* Plain <img>, not next/image: the booth sizes it by CSS max-width and
              the AT site routes next/image through a custom Shopify loader. */}
          {!logoFailed && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/images/photobooth-logo.png"
              alt="Amy Tangerine"
              className="pb-logo"
              onError={() => setLogoFailed(true)}
            />
          )}
          {logoFailed && <h1 className="pb-text-logo">amy tangerine</h1>}
          <p className="pb-tagline">Photo Booth</p>
        </header>

        <main className="pb-main">
          {/* Camera Preview */}
          <div className="pb-camera-wrapper">
            <video
              ref={videoRef}
              className="pb-camera"
              autoPlay
              playsInline
              muted
              style={{
                transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
                filter: PREVIEW_FILTER[activeFilter],
              }}
            />
            <canvas className="pb-preview-canvas" />
            {countdown !== null && <div className="pb-countdown">{countdown}</div>}
            {flashing && <div key={flashKey} className="pb-flash" />}
            <button
              type="button"
              className="pb-flip-btn"
              title="Flip Camera"
              aria-label="Flip camera"
              onClick={flipCamera}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5h1.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5c-.98 0-1.86.41-2.5 1.06l1.5 1.5H7v-4l1.5 1.5C9.36 7.46 10.61 7 12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5z"
                />
              </svg>
            </button>
          </div>

          {/* Status Message */}
          <p className="pb-status">{status}</p>

          {/* Filter Buttons */}
          <div className="pb-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`pb-filter-btn${activeFilter === f.id ? " pb-active" : ""}`}
                onClick={() => selectFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Capture Button */}
          <button
            type="button"
            className="pb-capture-btn"
            aria-label="Start photo session"
            disabled={capturing}
            onClick={startCapture}
          >
            <span className="pb-capture-inner" />
          </button>

          {/* Photo Strip Preview (shows after capture). Stays mounted so the
              canvas ref is live while it draws — the original hid it with CSS too. */}
          <div
            ref={stripPreviewRef}
            className={`pb-strip-preview${showStrip ? "" : " pb-hidden"}`}
          >
            <h2>Your Photo Strip</h2>
            <canvas ref={stripCanvasRef} className="pb-strip-canvas" />
            <div className="pb-strip-actions">
              <button type="button" className="pb-action-btn" onClick={saveStrip}>
                Save Strip
              </button>
              <button
                type="button"
                className="pb-action-btn pb-secondary"
                onClick={resetSession}
              >
                Take New Photos
              </button>
            </div>
          </div>
        </main>

        <footer className="pb-footer">
          <a href="https://www.amytangerine.com">amytangerine.com</a>
        </footer>
      </div>
    </div>
  )
}
