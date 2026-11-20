import type { MetadataRoute } from "next"

// Design finish, Phase 5 (2026-11-20): the tangerine slice from the logo, for "Add to
// Home Screen" on Android. Cut from public/brand/tangerine-slice.png.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amy Tangerine",
    short_name: "Amy Tangerine",
    start_url: "/",
    display: "browser",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [{ src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" }],
  }
}
