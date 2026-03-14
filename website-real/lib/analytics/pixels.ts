"use client";

/**
 * Client-side analytics helpers for Meta (Facebook) and TikTok pixels.
 * Only fires events in production.
 */

interface PurchaseData {
  value: number;
  currency: string;
  orderId: string;
}

interface AddToCartData {
  value: number;
  currency: string;
  productId: string;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Track purchase event on both Meta and TikTok pixels
 */
export function trackPurchase({ value, currency, orderId }: PurchaseData) {
  if (!isProduction) return;

  // Guard against double-firing on refresh
  const storageKey = `purchase_tracked_${orderId}`;
  if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
    return;
  }

  // Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value,
      currency,
      content_ids: [orderId],
    });
  }

  // TikTok Pixel
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track("CompletePayment", {
      value,
      currency,
      content_id: orderId,
    });
  }

  // Mark as tracked
  if (typeof window !== "undefined") {
    sessionStorage.setItem(storageKey, "true");
  }
}

/**
 * Track add to cart event on both Meta and TikTok pixels
 */
export function trackAddToCart({ value, currency, productId }: AddToCartData) {
  if (!isProduction) return;

  // Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      value,
      currency,
      content_ids: [productId],
      content_type: "product",
    });
  }

  // TikTok Pixel
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track("AddToCart", {
      value,
      currency,
      content_id: productId,
      content_type: "product",
    });
  }
}

/**
 * Track view content event (product page view)
 */
export function trackViewContent({ value, currency, productId }: AddToCartData) {
  if (!isProduction) return;

  // Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      value,
      currency,
      content_ids: [productId],
      content_type: "product",
    });
  }

  // TikTok Pixel
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track("ViewContent", {
      value,
      currency,
      content_id: productId,
      content_type: "product",
    });
  }
}

/**
 * Track initiate checkout event
 */
export function trackInitiateCheckout({ value, currency }: Omit<PurchaseData, "orderId">) {
  if (!isProduction) return;

  // Meta Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value,
      currency,
    });
  }

  // TikTok Pixel
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track("InitiateCheckout", {
      value,
      currency,
    });
  }
}
