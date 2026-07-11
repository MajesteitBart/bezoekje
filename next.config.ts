import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // To test `next dev` from another device (e.g. a phone on your LAN), add your
  // machine's address to `allowedDevOrigins` here — otherwise /_next assets are
  // blocked cross-origin and the client never hydrates. Dev-only setting.
  allowedDevOrigins: ["*.local"],
}

export default nextConfig
