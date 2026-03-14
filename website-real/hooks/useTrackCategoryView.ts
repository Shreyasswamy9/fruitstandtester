/**
 * Hook for tracking category/collection page views
 */

import { useEffect } from "react";
import { trackViewCategory } from "@/lib/analytics/meta-pixel";

export interface CategoryTrackingData {
  categoryName: string;
  productIds?: string[];
  currency?: string;
  eventId?: string;
}

/**
 * Track category/collection page view
 */
export function useTrackCategoryView(data: CategoryTrackingData) {
  useEffect(() => {
    if (!data.categoryName) {
      console.warn("[Meta Pixel] Missing category name for tracking");
      return;
    }

    trackViewCategory({
      content_ids: data.productIds || [],
      content_name: data.categoryName,
      currency: data.currency || "USD",
      eventId: data.eventId,
    });
  }, [data.categoryName, data.productIds, data.eventId, data.currency]);
}
