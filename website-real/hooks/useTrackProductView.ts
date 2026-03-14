/**
 * Hook for tracking product page views and interactions
 * Tracks ViewContent event with proper parameters
 */

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics/meta-pixel";

export interface ProductTrackingData {
  productId: string;
  productName: string;
  price: number;
  currency?: string;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  eventId?: string;
}

/**
 * Track product page view
 * Should be called once per page mount (use useEffect)
 */
export function useTrackProductView(data: ProductTrackingData) {
  useEffect(() => {
    if (!data.productId || !data.productName || !data.price) {
      console.warn("[Meta Pixel] Incomplete product data for tracking:", data);
      return;
    }

    // Track ViewContent
    trackViewContent({
      content_ids: [data.selectedVariant?.sku || data.productId],
      content_name: data.productName,
      value: data.price,
      currency: data.currency || "USD",
      eventId: data.eventId,
    });
  }, [data.productId, data.productName, data.price, data.selectedVariant, data.eventId, data.currency]);
}
