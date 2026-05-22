/**
 * Cross-browser platform detection helpers.
 *
 * Build-time branching uses `import.meta.env.BROWSER`, which WXT exposes as the
 * lowercase name of the `-b` flag passed to `wxt build` (e.g. "chrome",
 * "firefox", "edge", "safari"). Runtime helpers fall back to the user agent for
 * cases where the build-time constant is not available (e.g. unit tests).
 */

const BROWSER = import.meta.env.BROWSER as string | undefined

/**
 * True when the extension is built for Safari (iOS or macOS) via
 * `wxt build -b safari`.
 */
export function isSafari(): boolean {
  if (BROWSER === "safari") {
    return true
  }
  if (typeof navigator === "undefined") {
    return false
  }
  const ua = navigator.userAgent
  // Exclude Chrome / Edge / Android which all include "Safari" in their UA.
  return /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Edge\/|OPR\//.test(ua)
}

/**
 * True when running on iOS or iPadOS (iPad on iPadOS 13+ identifies itself as
 * macOS, so we additionally check for touch points).
 */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") {
    return false
  }
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) {
    return true
  }
  // iPadOS 13+ reports itself as macOS but has touch support.
  if (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) {
    return true
  }
  return false
}

/**
 * True when running on macOS (desktop Safari container).
 */
export function isMacOS(): boolean {
  if (typeof navigator === "undefined") {
    return false
  }
  return /Macintosh/.test(navigator.userAgent) && !isIOS()
}

/**
 * True when running inside the Safari iOS web extension. This is the most
 * restrictive runtime: `contextMenus`, `offscreen`, `sidePanel`, and most of
 * `identity` are unavailable.
 */
export function isSafariIOS(): boolean {
  return isSafari() && isIOS()
}
