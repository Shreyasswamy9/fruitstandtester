/**
 * Consent Management for Meta Pixel
 *
 * Provides utilities to manage user consent for Meta Pixel tracking
 * Integrates with common consent managers (OneTrust, Termly, etc.)
 */

const CONSENT_KEY = "meta_pixel_consent";
const OPT_OUT_KEY = "meta_pixel_opt_out";

export type ConsentStatus = "granted" | "denied" | "unknown";

/**
 * Check if user has granted consent for Meta Pixel tracking
 */
export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;

  // Check localStorage override
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;

  // Check for opt-out flag
  const hasOptedOut = localStorage.getItem(OPT_OUT_KEY) === "true";
  if (hasOptedOut) return false;

  // Check for common consent manager implementations
  // OneTrust
  if (typeof window !== "undefined" && (window as any).OnetrustActiveGroups) {
    const groups = ((window as any).OnetrustActiveGroups as string).split(",");
    return groups.includes("C0002"); // Marketing group ID (adjust per your setup)
  }

  // Termly / CookieBot would go here
  // For now, assume consent is granted unless explicitly denied
  return true;
}

/**
 * Get current consent status
 */
export function getConsentStatus(): ConsentStatus {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "true") return "granted";
  if (stored === "false") return "denied";
  return "unknown";
}

/**
 * Grant consent for Meta Pixel tracking
 */
export function grantConsent(): void {
  localStorage.setItem(CONSENT_KEY, "true");
  localStorage.removeItem(OPT_OUT_KEY);

  // Initialize Meta Pixel if it's ready
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("consent", "grant");
  }

  console.log("[Meta Pixel] Consent granted");
}

/**
 * Deny consent for Meta Pixel tracking
 */
export function denyConsent(): void {
  localStorage.setItem(CONSENT_KEY, "false");
  localStorage.setItem(OPT_OUT_KEY, "true");

  // Disable Meta Pixel if loaded
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("consent", "deny");
  }

  console.log("[Meta Pixel] Consent denied");
}

/**
 * Reset consent status (user hasn't made a choice yet)
 */
export function resetConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(OPT_OUT_KEY);
  console.log("[Meta Pixel] Consent reset");
}

/**
 * Hook to listen for consent changes
 * Useful for updating UI based on consent status
 */
export function useConsentListener(
  callback: (hasConsent: boolean) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY || e.key === OPT_OUT_KEY) {
      callback(hasConsent());
    }
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}
