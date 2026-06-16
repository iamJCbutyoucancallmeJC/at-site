/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Houston conference cohort closed 2026-06-16 (t659): finite 6-month, 11 subs ride to
      // Oct expiry, no more conference sales. The /houston landing page + the /hm QR shortcut
      // now redirect to the main Happy Mail page so any stray bookmark/QR handout lands sensibly.
      // (Page source kept in git for a future conference; flip these back to revive it.)
      { source: "/houston", destination: "/happy-mail", permanent: false },
      { source: "/hm", destination: "/happy-mail", permanent: false },
      // Short path for Junklub event QR code handouts
      { source: "/jl", destination: "/junklub", permanent: false },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "media.rainpos.com",
      },
    ],
  },
}

export default nextConfig
