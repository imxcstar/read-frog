#!/usr/bin/env node
/**
 * Copy the WXT Safari build output into the Xcode project's extension
 * Resources/ directory so the next `xcodebuild` (or Xcode Run) bundles the
 * latest web-extension assets.
 *
 * Usage:
 *   pnpm safari:sync                         # default paths
 *   node scripts/sync-safari-resources.mjs   # same as above
 *   READ_FROG_SAFARI_DEST=./apple/MyExtension/Resources node scripts/sync-safari-resources.mjs
 *
 * Inputs:
 *   - .output/safari-mv3/      (produced by `wxt build -b safari --mv3`)
 *
 * Outputs:
 *   - apple/ReadFrogExtension/Resources/   (replaced)
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const SOURCE = process.env.READ_FROG_SAFARI_SOURCE
  ?? path.join(ROOT, ".output", "safari-mv3")
const DEST = process.env.READ_FROG_SAFARI_DEST
  ?? path.join(ROOT, "apple", "ReadFrogExtension", "Resources")

function main() {
  if (!existsSync(SOURCE)) {
    console.error(`[sync-safari-resources] source not found: ${SOURCE}`)
    console.error("Run `pnpm build:safari` first.")
    process.exitCode = 1
    return
  }

  if (existsSync(DEST)) {
    rmSync(DEST, { recursive: true, force: true })
  }
  mkdirSync(DEST, { recursive: true })
  cpSync(SOURCE, DEST, { recursive: true })
  console.log(`[sync-safari-resources] copied ${SOURCE} -> ${DEST}`)
}

main()
