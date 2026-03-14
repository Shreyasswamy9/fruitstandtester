/**
 * Hook for tracking purchase events
 * Fires when order is completed
 */

import { useEffect, useRef } from "react";
import { trackPurchase, MetaPixelContent } from "@/lib/analytics/meta-pixel";

export interface PurchaseTrackingData {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  eventId?: string;
}

/**
 * Track Purchase event
 * Use the same eventId for both browser Pixel and server CAPI for deduplication
 */
export function useTrackPurchase(data: PurchaseTrackingData) {
  const hasTracked = useRef<string | null>(null);

  useEffect(() => {
    // Only track once per order (use orderId as key)
    if (hasTracked.current === data.orderId || !data.orderId || data.items.length === 0) {
      return;
    }

    const contents: MetaPixelContent[] = data.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
      title: item.name,
    }));

    const contentIds = data.items.map((item) => item.id);

    trackPurchase({
      content_ids: contentIds,
      contents,
      value: data.total,
      currency: "USD",
      order_id: data.orderId,
      eventId: data.eventId,
    });

    hasTracked.current = data.orderId;
  }, [data.orderId, data.items, data.total, data.eventId]);

  // Expose a function to reset tracking (for testing)
  const resetTracking = () => {
    hasTracked.current = null;
  };

  return { resetTracking };
}
