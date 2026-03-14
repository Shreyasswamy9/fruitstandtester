/**
 * Meta Pixel (Facebook Pixel) - Comprehensive E-commerce Tracking
 * Pixel ID: 951068325996992
 *
 * Supports:
 * - All standard events with proper parameters
 * - Deduplication via event_id
 * - Consent Mode (delay tracking until consent granted)
 * - Advanced Matching (email/phone hashing)
 * - Single-fire prevention on SPA navigation
 * - Currency and content tracking
 */

import { hasConsent } from "./consent";

declare global {
  interface Window {
    fbq?: (((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      push?: (...args: any[]) => void;
      loaded?: boolean;
      version?: string;
    }) | undefined;
    _fbq?: any;
    /** True when this browser is a flagged internal/staff device. */
    INTERNAL_USER?: boolean;
  }
}

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MetaPixelContent {
  id: string; // Product ID or SKU
  quantity: number;
  item_price: number; // Price per item
  title?: string;
}

export interface MetaPixelEventData {
  // Common
  event_id?: string; // For deduplication
  currency?: string; // ISO 4217 code (e.g., 'USD')
  value?: number; // Total value
  
  // Content-related
  content_type?: "product" | "product_group" | "product_list";
  content_ids?: string[];
  content_name?: string;
  contents?: MetaPixelContent[];
  
  // Search
  search_string?: string;
  
  // Checkout
  num_items?: number;
  
  // Custom fields
  [key: string]: any;
}

export interface AdvancedMatchingData {
  em?: string; // Email (hashed SHA-256)
  ph?: string; // Phone (hashed SHA-256)
  fn?: string; // First name (hashed SHA-256)
  ln?: string; // Last name (hashed SHA-256)
  ct?: string; // City (hashed SHA-256)
  st?: string; // State (hashed SHA-256)
  zp?: string; // ZIP code (hashed SHA-256)
  country?: string; // Country code
}

// ============================================================================
// Configuration
// ============================================================================

const PIXEL_ID = "951068325996992";
const DEFAULT_CURRENCY = "USD";
const PRODUCTION = process.env.NODE_ENV === "production";
const DEBUG_ENABLED = process.env.NEXT_PUBLIC_META_PIXEL_DEBUG === "true" || process.env.NEXT_PUBLIC_META_PIXEL_DEBUG === "1";

// Event deduplication: track which events have been fired in this session
const firedEventIds = new Set<string>();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique event ID for deduplication
 * Use the same event_id for both browser Pixel and server CAPI
 */
export function generateEventId(): string {
  // Simple UUID v4 implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * SHA-256 hash for Advanced Matching
 * Note: In production, implement proper SHA-256. This is a placeholder.
 */
async function hashForAdvancedMatching(value: string): Promise<string> {
  if (!value) return "";
  
  // Normalize: lowercase and trim whitespace
  const normalized = value.toLowerCase().trim();
  
  // In production, use crypto-js or node's crypto module
  // For now, return base64 encoded for placeholder purposes
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch (e) {
    console.warn("Failed to hash value for Advanced Matching:", e);
    return "";
  }
}

/**
 * Check if consent has been granted for Meta Pixel tracking
 * Uses the consent module for checking
 */
function checkConsent(): boolean {
  return hasConsent();
}

/**
 * Backup hasConsent function for backward compatibility
 */
function hasConsentLocal(): boolean {
  if (typeof window === "undefined") return false;
  
  // Example: Check for consent cookie/flag (customize per your setup)
  // Common consent managers: OneTrust, Termly, CookieBot, Evidon, etc.
  
  // For now, return true unless explicitly disabled
  const hasOptedOut = localStorage.getItem("meta_pixel_opt_out") === "true";
  return !hasOptedOut;
}

/**
 * Check if an event has already been fired in this session (deduplication)
 */
function hasEventBeenFired(eventId: string): boolean {
  return firedEventIds.has(eventId);
}

/**
 * Mark an event as fired
 */
function markEventAsFired(eventId: string): void {
  firedEventIds.add(eventId);
}

/**
 * Ensure Meta Pixel script is loaded
 *
 * Returns false (blocking all fbq calls) when:
 *  - running on the server
 *  - [META PIXEL: BLOCKED for internal users] window.INTERNAL_USER === true
 *  - window.fbq is not initialised
 */
function ensurePixelLoaded(): boolean {
  if (typeof window === "undefined") return false;

  // [META PIXEL: BLOCKED for internal users]
  // window.INTERNAL_USER is set synchronously by the bootstrap script in <head>
  // before any React code runs, so this check is always reliable.
  if (window.INTERNAL_USER) return false;

  if (!window.fbq) {
    console.warn("Meta Pixel not loaded. Ensure the base code is in your <head>.");
    return false;
  }

  return true;
}

/**
 * Log Meta Pixel values only if debug mode is enabled via environment variable
 */
function logMetaPixel(eventName: string, data: MetaPixelEventData | AdvancedMatchingData | any): void {
  if (!DEBUG_ENABLED) return;
  
  console.log(`[Meta Pixel Debug] ${eventName}:`, JSON.stringify(data, null, 2));
}

// ============================================================================
// Core Tracking Functions
// ============================================================================

/**
 * Track PageView - should fire on every page load
 * This is typically fired automatically by the base code, but you can call it explicitly
 */
export function trackPageView(eventData?: MetaPixelEventData): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = eventData?.event_id || generateEventId();
  
  // Check deduplication
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] PageView already tracked with event_id: ${eventId}`);
    }

    return;
  }
  
  const data: MetaPixelEventData = {
    ...eventData,
    event_id: eventId,
    currency: eventData?.currency || DEFAULT_CURRENCY,
  };
  
  window.fbq?.("track", "PageView", data);
  markEventAsFired(eventId);
  
  logMetaPixel("PageView", data);
}

/**
 * Track ViewContent - product detail page
 */
export function trackViewContent(options: {
  content_ids: string[]; // Product ID or SKU
  content_name: string;
  value: number; // Product price or sale price
  currency?: string;
  eventId?: string; // Provided for deduplication with CAPI
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] ViewContent already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    content_type: "product",
    content_ids: options.content_ids,
    content_name: options.content_name,
    value: options.value,
    currency: options.currency || DEFAULT_CURRENCY,
    event_id: eventId,
  };
  
  window.fbq?.("track", "ViewContent", data);
  markEventAsFired(eventId);
  
  logMetaPixel("ViewContent", data);
}

/**
 * Track ViewCategory - collection or category page
 * Meta doesn't have ViewCategory, so we use ViewContent with content_type='product_group'
 */
export function trackViewCategory(options: {
  content_ids?: string[]; // Product IDs in category (optional)
  content_name: string; // Category name
  currency?: string;
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] ViewCategory already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    content_type: "product_group",
    content_ids: options.content_ids || [],
    content_name: options.content_name,
    currency: options.currency || DEFAULT_CURRENCY,
    event_id: eventId,
  };
  
  window.fbq?.("track", "ViewContent", data);
  markEventAsFired(eventId);
  
  logMetaPixel("ViewCategory", data);
}

/**
 * Track Search - search results page
 */
export function trackSearch(options: {
  search_string: string;
  content_ids?: string[]; // Product IDs found (optional)
  currency?: string;
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] Search already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    search_string: options.search_string,
    content_ids: options.content_ids || [],
    currency: options.currency || DEFAULT_CURRENCY,
    event_id: eventId,
  };
  
  window.fbq?.("track", "Search", data);
  markEventAsFired(eventId);
  
  logMetaPixel("Search", data);
}

/**
 * Track AddToCart - item added to cart
 */
export function trackAddToCart(options: {
  content_ids: string[]; // Product ID or SKU
  contents: MetaPixelContent[]; // Item details with quantity and price
  value: number; // Total value of added item(s)
  currency?: string;
  content_name?: string;
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] AddToCart already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    content_type: "product",
    content_ids: options.content_ids,
    contents: options.contents,
    value: options.value,
    currency: options.currency || DEFAULT_CURRENCY,
    content_name: options.content_name,
    event_id: eventId,
  };
  
  window.fbq?.("track", "AddToCart", data);
  markEventAsFired(eventId);
  
  logMetaPixel("AddToCart", data);
}

/**
 * Track InitiateCheckout - user proceeds to checkout (not just viewing cart)
 */
export function trackInitiateCheckout(options: {
  contents: MetaPixelContent[]; // All items in cart
  value: number; // Cart total
  currency?: string;
  num_items: number; // Number of items
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] InitiateCheckout already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    content_type: "product",
    contents: options.contents,
    value: options.value,
    currency: options.currency || DEFAULT_CURRENCY,
    num_items: options.num_items,
    event_id: eventId,
  };
  
  window.fbq?.("track", "InitiateCheckout", data);
  markEventAsFired(eventId);
  
  logMetaPixel("InitiateCheckout", data);
}

/**
 * Track AddPaymentInfo - payment method selected/submitted
 */
export function trackAddPaymentInfo(options: {
  contents: MetaPixelContent[];
  value: number;
  currency?: string;
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] AddPaymentInfo already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    content_type: "product",
    contents: options.contents,
    value: options.value,
    currency: options.currency || DEFAULT_CURRENCY,
    event_id: eventId,
  };
  
  window.fbq?.("track", "AddPaymentInfo", data);
  markEventAsFired(eventId);
  
  logMetaPixel("AddPaymentInfo", data);
}

/**
 * Track Purchase - order completed
 * Use same event_id for browser Pixel and server CAPI for deduplication
 */
export function trackPurchase(options: {
  content_ids: string[]; // Product IDs in order
  contents: MetaPixelContent[];
  value: number; // Order total
  currency?: string;
  order_id?: string; // Order number for additional context
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] Purchase already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    content_type: "product",
    content_ids: options.content_ids,
    contents: options.contents,
    value: options.value,
    currency: options.currency || DEFAULT_CURRENCY,
    ...(options.order_id && { order_id: options.order_id }),
    event_id: eventId,
  };
  
  window.fbq?.("track", "Purchase", data);
  markEventAsFired(eventId);
  
  logMetaPixel("Purchase", data);
}

/**
 * Track AddToWishlist - item added to wishlist
 */
export function trackAddToWishlist(options: {
  content_ids: string[];
  content_name?: string;
  value?: number;
  currency?: string;
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] AddToWishlist already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    content_ids: options.content_ids,
    content_name: options.content_name,
    value: options.value,
    currency: options.currency || DEFAULT_CURRENCY,
    event_id: eventId,
  };
  
  window.fbq?.("track", "AddToWishlist", data);
  markEventAsFired(eventId);
  
  logMetaPixel("AddToWishlist", data);
}

/**
 * Track CompleteRegistration - account created
 */
export function trackCompleteRegistration(options: {
  status?: "completed" | "abandoned";
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] CompleteRegistration already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    status: options.status || "completed",
    event_id: eventId,
  };
  
  window.fbq?.("track", "CompleteRegistration", data);
  markEventAsFired(eventId);
  
  logMetaPixel("CompleteRegistration", data);
}

/**
 * Track Lead - email captured or newsletter signup
 */
export function trackLead(options: {
  currency?: string;
  value?: number;
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] Lead already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    currency: options.currency || DEFAULT_CURRENCY,
    ...(options.value && { value: options.value }),
    event_id: eventId,
  };
  
  window.fbq?.("track", "Lead", data);
  markEventAsFired(eventId);
  
  logMetaPixel("Lead", data);
}

/**
 * Track Contact - contact form submitted
 */
export function trackContact(options: {
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] Contact already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    event_id: eventId,
  };
  
  window.fbq?.("track", "Contact", data);
  markEventAsFired(eventId);
  
  logMetaPixel("Contact", data);
}

/**
 * Track Subscribe - subscription purchase (if applicable)
 */
export function trackSubscribe(options: {
  value?: number;
  currency?: string;
  eventId?: string;
}): void {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  const eventId = options.eventId || generateEventId();
  
  if (hasEventBeenFired(eventId)) {
    if (DEBUG_ENABLED) {
      console.log(`[Meta Pixel Debug] Subscribe already tracked with event_id: ${eventId}`);
    }
    return;
  }
  
  const data: MetaPixelEventData = {
    ...(options.value && { value: options.value }),
    currency: options.currency || DEFAULT_CURRENCY,
    event_id: eventId,
  };
  
  window.fbq?.("track", "Subscribe", data);
  markEventAsFired(eventId);
  
  logMetaPixel("Subscribe", data);
}

/**
 * Advanced Matching - set user data for better targeting
 * Can be called when user info is available (login, checkout, etc.)
 */
export async function setAdvancedMatchingData(
  data: AdvancedMatchingData
): Promise<void> {
  if (!PRODUCTION || !checkConsent() || !ensurePixelLoaded()) return;
  
  // Hash sensitive fields if provided
  const hashedData: AdvancedMatchingData = { ...data };
  
  if (data.em) hashedData.em = await hashForAdvancedMatching(data.em);
  if (data.ph) hashedData.ph = await hashForAdvancedMatching(data.ph);
  if (data.fn) hashedData.fn = await hashForAdvancedMatching(data.fn);
  if (data.ln) hashedData.ln = await hashForAdvancedMatching(data.ln);
  if (data.ct) hashedData.ct = await hashForAdvancedMatching(data.ct);
  if (data.st) hashedData.st = await hashForAdvancedMatching(data.st);
  if (data.zp) hashedData.zp = await hashForAdvancedMatching(data.zp);
  
  window.fbq?.("setUserData", hashedData);
  
  logMetaPixel("Advanced Matching", hashedData);
}

/**
 * Clear event deduplication (use for manual testing or session reset)
 */
export function clearEventHistory(): void {
  firedEventIds.clear();
  if (DEBUG_ENABLED) {
    console.log(`[Meta Pixel Debug] Event history cleared`);
  }
}

/**
 * Opt out from Meta Pixel tracking
 */
export function optOut(): void {
  localStorage.setItem("meta_pixel_opt_out", "true");
  firedEventIds.clear();
  if (DEBUG_ENABLED) {
    console.log(`[Meta Pixel Debug] Opted out from tracking`);
  }
}

/**
 * Opt in to Meta Pixel tracking
 */
export function optIn(): void {
  localStorage.removeItem("meta_pixel_opt_out");
  if (DEBUG_ENABLED) {
    console.log(`[Meta Pixel Debug] Opted in to tracking`);
  }
}
