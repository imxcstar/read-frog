#!/usr/bin/env node
/**
 * One-time bootstrap of the Xcode project under `apple/` from the WXT Safari
 * build output, using Apple's `xcrun safari-web-extension-converter`.
 *
 * Must be run on macOS with Xcode (and Command Line Tools) installed. The
 * generated project is then committed to the repository; subsequent builds
 * should only refresh `apple/ReadFrogExtension/Resources/` via
 * `scripts/sync-safari-resources.mjs`.
 *
 * Defaults can be overridden via env vars:
 *   READ_FROG_BUNDLE_ID       (default: app.readfrog)
 *   READ_FROG_APP_NAME        (default: Read Frog)
 *   READ_FROG_PROJECT_DIR     (default: apple)
 *   READ_FROG_SAFARI_SOURCE   (default: .output/safari-mv3)
 *   READ_FROG_MACOS_ONLY      (default: NO)   pass "YES" for macOS-only build
 */
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const SOURCE = process.env.READ_FROG_SAFARI_SOURCE
  ?? path.join(ROOT, ".output", "safari-mv3")
const PROJECT_DIR = process.env.READ_FROG_PROJECT_DIR
  ?? path.join(ROOT, "apple")
const BUNDLE_ID = process.env.READ_FROG_BUNDLE_ID ?? "app.readfrog"
const APP_NAME = process.env.READ_FROG_APP_NAME ?? "Read Frog"
const MACOS_ONLY = (process.env.READ_FROG_MACOS_ONLY ?? "NO").toUpperCase()

if (process.platform !== "darwin") {
  console.error("[bootstrap-safari-xcode] this script must be run on macOS.")
  process.exit(1)
}

if (!existsSync(SOURCE)) {
  console.error(`[bootstrap-safari-xcode] source not found: ${SOURCE}`)
  console.error("Run `pnpm build:safari` first.")
  process.exit(1)
}

const args = [
  "safari-web-extension-converter",
  SOURCE,
  "--project-location", PROJECT_DIR,
  "--bundle-identifier", BUNDLE_ID,
  "--app-name", APP_NAME,
  "--no-open",
  "--force",
  "--swift",
  "--macos-only", MACOS_ONLY,
]

console.log(`[bootstrap-safari-xcode] xcrun ${args.join(" ")}`)
const result = spawnSync("xcrun", args, { stdio: "inherit" })
process.exit(result.status ?? 1)
