/**
 * Hook for tracking contact form submission
 */

import { trackContact } from "@/lib/analytics/meta-pixel";

/**
 * Track Contact event
 * Call this when user submits a contact form
 */
export function trackContactSubmit(eventId?: string): void {
  trackContact({ eventId });
}
