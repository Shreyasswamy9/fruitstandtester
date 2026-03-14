/**
 * GlobalAddToCartTracker
 *
 * This component should be added to the root layout to automatically track
 * all AddToCart events throughout the app.
 *
 * Usage: Add <GlobalAddToCartTracker /> within CartProvider in your layout
 */

"use client";

import { useTrackAddToCart } from "@/hooks/useTrackAddToCart";

export default function GlobalAddToCartTracker() {
  useTrackAddToCart();
  return null;
}
