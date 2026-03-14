/**
 * Hook for tracking AddToCart events
 */

import { useEffect } from "react";
import { useCart } from "@/components/CartContext";
import { trackAddToCart, MetaPixelContent } from "@/lib/analytics/meta-pixel";

/**
 * Auto-track AddToCart when items are added to cart
 * Must be called within a component that has access to CartContext
 */
export function useTrackAddToCart() {
  const { lastAddedItem } = useCart();

  useEffect(() => {
    if (!lastAddedItem) return;

    // Only track if this is a new addition (not a quantity update to existing item)
    // We use the lastAddedItem signal to detect new adds
    const contents: MetaPixelContent[] = [
      {
        id: lastAddedItem.lineId || lastAddedItem.productId,
        quantity: lastAddedItem.quantity,
        item_price: lastAddedItem.price,
        title: lastAddedItem.name,
      },
    ];

    trackAddToCart({
      content_ids: [lastAddedItem.lineId || lastAddedItem.productId],
      contents,
      value: lastAddedItem.price * lastAddedItem.quantity,
      currency: "USD",
      content_name: lastAddedItem.name,
    });
  }, [lastAddedItem]);
}
