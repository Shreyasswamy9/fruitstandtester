/**
 * Hook for tracking user registration
 */

import { trackCompleteRegistration } from "@/lib/analytics/meta-pixel";

/**
 * Track CompleteRegistration event
 * Call this when user creates an account
 */
export function trackRegistration(eventId?: string): void {
  trackCompleteRegistration({ status: "completed", eventId });
}
