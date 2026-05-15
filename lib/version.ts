// Version information — injected at build time via next.config.mjs + package.json build script
// Display format: "v0.1.0+a1b2c3d (dev)"

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0"
export const COMMIT_HASH = process.env.NEXT_PUBLIC_COMMIT_HASH || "dev"
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString()

export function getEnvironment(): string {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname.includes("dev")) {
      return "dev"
    }
    return "production"
  }
  // Server-side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  if (siteUrl.includes("dev") || siteUrl.includes("localhost")) return "dev"
  return "production"
}

/** Returns a human-readable version string, e.g. "v0.1.0+a1b2c3d (dev)" */
export function getVersionDisplay(): string {
  return `v${APP_VERSION}+${COMMIT_HASH} (${getEnvironment()})`
}
