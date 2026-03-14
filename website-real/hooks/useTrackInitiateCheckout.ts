/**
 * Hook for tracking checkout initiation
 * Fires when user proceeds from cart to checkout
 */

import { useEffect, useRef } from "react";
import { trackInitiateCheckout, MetaPixelContent } from "@/lib/analytics/meta-pixel";
import type { CartItem } from "@/components/CartContext";

export interface CheckoutTrackingData {
  items: CartItem[];
  total: number;
  itemCount: number;
  eventId?: string;
}

/**
 * Track InitiateCheckout event
 * Call this when user clicks "Proceed to Checkout" button
 */
export function useTrackInitiateCheckout(data: CheckoutTrackingData) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per checkout session
    if (hasTracked.current || data.items.length === 0) {
      return;
    }

    const contents: MetaPixelContent[] = data.items.map((item) => ({
      id: item.lineId || item.productId,
      quantity: item.quantity,
      item_price: item.price,
      title: item.name,
    }));

    trackInitiateCheckout({
      contents,
      value: data.total,
      currency: "USD",
      num_items: data.itemCount,
      eventId: data.eventId,
    });

    hasTracked.current = true;
  }, [data.items, data.total, data.itemCount, data.eventId]);

  // Expose a function to reset tracking (for testing)
  const resetTracking = () => {
    hasTracked.current = false;
  };

  return { resetTracking };
}
