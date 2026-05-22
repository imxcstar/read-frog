# Read Frog — Safari Web Extension (iOS / macOS)

This directory hosts the Xcode project that wraps the WXT extension build as a
native Safari Web Extension for iOS and macOS.

> Phase 1 status: build pipeline + scaffolding only. Native messaging for
> OAuth/TTS lands in a later phase.

## Prerequisites

- macOS 13+ with Xcode 16 or newer (`xcode-select --install`)
- Node 22+, pnpm 10 (matching the repository root)
- An Apple Developer account (for code signing; not required to build for the
  Simulator)

## First-time bootstrap

The Xcode project itself is not yet checked in. Generate it once with Apple's
official converter, then commit the result:

```bash
pnpm install
pnpm build:safari                  # produces .output/safari-mv3/
pnpm safari:bootstrap              # wraps `xcrun safari-web-extension-converter`
git add apple/ReadFrog.xcodeproj apple/ReadFrog apple/ReadFrogExtension
git commit -m "chore(apple): bootstrap Safari Xcode project"
```

You can override defaults via env vars:

```bash
READ_FROG_BUNDLE_ID=com.example.readfrog \
READ_FROG_APP_NAME="Read Frog" \
READ_FROG_MACOS_ONLY=NO \
pnpm safari:bootstrap
```

> The first time you open the generated project in Xcode, set your **Team** in
> the _Signing & Capabilities_ tab of each target (`ReadFrog`, the
> `ReadFrogExtension` target, and optionally `ReadFrog (macOS)`).

## Day-to-day workflow

After the project exists, rebuild the web-extension and refresh the bundled
resources:

```bash
pnpm build:safari:ios     # = build:safari + safari:sync
open apple/ReadFrog.xcodeproj
```

`safari:sync` deletes `apple/ReadFrogExtension/Resources/` and re-copies
`.output/safari-mv3/` into it, so always run **after** `pnpm build:safari`.

## Running in the iOS Simulator

1. In Xcode, select the `ReadFrog` scheme and an iOS Simulator destination.
2. _Run_ (⌘R). The container app launches and shows instructions for enabling
   the extension.
3. Open Safari in the Simulator → ⓘ in the address bar → **Manage Extensions**
   → enable _Read Frog_.
4. To inspect the extension, open Safari on your Mac → _Develop_ menu →
   _Simulator_ → choose the Read Frog page.

## Running on a real iOS device

You need a paid Apple Developer account and a unique Bundle ID. After signing
is configured, run on the device from Xcode and enable the extension under
**Settings → Safari → Extensions**.

## Capabilities

The Phase 1 scaffold does **not** require App Groups. Once Phase 2 introduces
native messaging (for OAuth and TTS), enable the _App Groups_ capability on
both the container app and the extension targets and add the same group ID
(e.g. `group.app.readfrog`) so they can share `UserDefaults` / Keychain items.

## Troubleshooting

- **"Manifest does not contain a permissions key"**: rebuild with
  `pnpm build:safari` — `wxt.config.ts` strips Safari-incompatible permissions
  only when `-b safari` is set.
- **Extension shows up but won't grant host access**: iOS Safari requires the
  user to tap _Permissions → All Websites → Allow_ under
  _Settings → Safari → Extensions → Read Frog_.
- **Streaming fetch hangs on iOS**: iOS Safari has stricter background task
  limits; long-running streams must originate from a content script or page.

## Folder layout (after bootstrap)

```
apple/
├── ReadFrog.xcodeproj/
├── ReadFrog/                          # iOS / macOS container app
│   ├── AppDelegate.swift
│   ├── ViewController.swift
│   ├── Resources/
│   └── Info.plist
├── ReadFrogExtension/                 # Safari Web Extension target
│   ├── SafariWebExtensionHandler.swift
│   ├── Resources/                     # ← populated by safari:sync (gitignored)
│   └── Info.plist
└── README.md                          # this file
```

The `Resources/` directory inside the extension is generated content and is
ignored by Git (see the top-level `.gitignore`).
