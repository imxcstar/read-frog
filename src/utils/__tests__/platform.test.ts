import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { isIOS, isMacOS, isSafari, isSafariIOS } from "@/utils/platform"

const ORIGINAL_NAVIGATOR_DESC = Object.getOwnPropertyDescriptor(globalThis, "navigator")

interface FakeNavigator {
  userAgent: string
  maxTouchPoints?: number
}

function setNavigator(nav: FakeNavigator | undefined) {
  if (nav === undefined) {
    if (ORIGINAL_NAVIGATOR_DESC) {
      Object.defineProperty(globalThis, "navigator", ORIGINAL_NAVIGATOR_DESC)
    }
    else {
      delete (globalThis as { navigator?: Navigator }).navigator
    }
    return
  }
  Object.defineProperty(globalThis, "navigator", {
    value: nav,
    configurable: true,
    writable: true,
  })
}

describe("platform helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    setNavigator(ORIGINAL_NAVIGATOR_DESC?.value as FakeNavigator | undefined)
  })

  describe("isSafari", () => {
    it("returns true for a real Safari user agent", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      })
      expect(isSafari()).toBe(true)
    })

    it("returns false for Chrome's user agent", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      })
      expect(isSafari()).toBe(false)
    })

    it("returns false for Edge's user agent", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0",
      })
      expect(isSafari()).toBe(false)
    })
  })

  describe("isIOS", () => {
    it("returns true for iPhone UA", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      })
      expect(isIOS()).toBe(true)
    })

    it("returns true for iPadOS reporting as Macintosh with touch support", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        maxTouchPoints: 5,
      })
      expect(isIOS()).toBe(true)
    })

    it("returns false on macOS without touch support", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        maxTouchPoints: 0,
      })
      expect(isIOS()).toBe(false)
    })
  })

  describe("isMacOS", () => {
    it("returns true on macOS Safari", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        maxTouchPoints: 0,
      })
      expect(isMacOS()).toBe(true)
    })

    it("returns false on iPadOS pretending to be macOS", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        maxTouchPoints: 5,
      })
      expect(isMacOS()).toBe(false)
    })
  })

  describe("isSafariIOS", () => {
    it("is true on iPhone Safari", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      })
      expect(isSafariIOS()).toBe(true)
    })

    it("is false on macOS Safari", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        maxTouchPoints: 0,
      })
      expect(isSafariIOS()).toBe(false)
    })
  })
})
