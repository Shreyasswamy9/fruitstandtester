"use client"

import posthog from "posthog-js"
import { registerPosthogInternalUser } from "@/lib/analytics/internal-device"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com"

let posthogInitialized = false

export const ensurePosthog = () => {
  if (posthogInitialized || typeof window === "undefined" || !POSTHOG_KEY) return
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    persistence: "memory",
  })
  posthogInitialized = true

  // [POSTHOG: REGISTER/UNREGISTER internal_user]
  // Syncs window.INTERNAL_USER (set by the bootstrap script) to PostHog
  // super-properties so that every subsequent PostHog event carries the flag.
  registerPosthogInternalUser(posthog)
}

export const captureEvent = (name: string, properties?: Record<string, unknown>) => {
  ensurePosthog()
  if (!posthogInitialized) return
  posthog.capture(name, properties)
}

export const capturePageview = (path: string) => {
  ensurePosthog()
  if (!posthogInitialized) return
  posthog.capture("$pageview", { path })
}
