/**
 * Internal Device Flag — Centralized staff/internal-user detection
 * ─────────────────────────────────────────────────────────────────
 *
 * The BOOTSTRAP (inline <script> in <head>) runs synchronously on every page
 * load before any analytics fire. It handles:
 *   • URL param parsing  →  ?staff_device=abc123  |  ?staff_device_reset=abc123
 *   • Persisting the flag in localStorage under "internal_user"
 *   • Exposing window.INTERNAL_USER (boolean)
 *   • Pushing { event: "internal_user_status", internal_user } to dataLayer
 *   • Cleaning the activation/reset param from the address bar
 *
 * This module (imported by TS files) provides:
 *   • isInternalUser()              — read the current flag
 *   • registerPosthogInternalUser() — sync the flag to PostHog super-properties
 *
 * [WHERE TO CHANGE THE SECRET TOKEN]
 *   The token is in `app/layout.tsx`, inside the inline bootstrap <script>.
 *   Search for INTERNAL_DEVICE_TOKEN.
 */

// ── Global type augmentation ──────────────────────────────────────────────────
declare global {
  interface Window {
    /** Set to true when this browser is flagged as an internal/staff device. */
    INTERNAL_USER?: boolean;
    /** GTM dataLayer — initialized by the bootstrap before GTM loads. */
    dataLayer?: Record<string, unknown>[];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true when the current browser is marked as an internal/staff device.
 * Safe to call in SSR (returns false on the server).
 */
export function isInternalUser(): boolean {
  if (typeof window === "undefined") return false;
  return window.INTERNAL_USER === true;
}

/**
 * Syncs the internal-user flag to PostHog super-properties.
 *
 * Call this once, immediately after posthog.init().
 *
 * [POSTHOG: REGISTER]   — posthog.register({ internal_user: true })
 * [POSTHOG: UNREGISTER] — posthog.unregister('internal_user')
 */
export function registerPosthogInternalUser(ph: {
  register: (props: Record<string, unknown>) => void;
  unregister: (key: string) => void;
}): void {
  if (isInternalUser()) {
    // [POSTHOG: REGISTER internal_user] Attach as super-property on every event
    ph.register({ internal_user: true });
  } else {
    // [POSTHOG: UNREGISTER internal_user] Remove super-property for normal users
    ph.unregister("internal_user");
  }
}
