"use client";

/**
 * useCartFunnelTracking
 *
 * Captures every meaningful friction signal between "initiate checkout"
 * and "place order" so you can diagnose cart drop-off in PostHog.
 *
 * Events emitted
 * ─────────────────────────────────────────────────────────────────
 *  cart_viewed                    – page mount with items
 *  cart_payment_intent_loading    – Stripe intent request in flight
 *  cart_payment_intent_success    – intent resolved OK
 *  cart_payment_intent_error      – intent failed (includes message)
 *  cart_express_checkout_shown    – Stripe Elements rendered
 *  cart_checkout_clicked          – main CTA tapped
 *  cart_discount_applied          – valid code applied
 *  cart_discount_error            – invalid / inactive code
 *  cart_item_removed              – item deleted
 *  cart_item_quantity_changed     – qty +/−
 *  cart_quantity_decreased_to_zero – qty dropped to 0 → implicit remove
 *  cart_cleared                   – entire cart cleared
 *  cart_rage_click                – user clicked checkout ≥3 × in 4 s
 *  cart_payment_load_timeout      – payment options took >6 s to load
 *  cart_tab_hidden_during_checkout – user tab-switched mid-flow
 *  cart_user_idle_with_items      – 90 s of inactivity while cart is full
 */

import { useEffect, useRef, useCallback } from "react";
import { captureEvent } from "../instrumentation.client";
import type { CartItem } from "@/components/CartContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartFunnelState {
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  isSignedIn: boolean;
  clientSecret: string | null;
  paymentMessage: string | null;
  sessionLoading: boolean;
  /** expose so the hook can fire cart_express_checkout_shown at the right time */
  expressCheckoutReady: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IDLE_THRESHOLD_MS = 90_000;   // 90 s of no mouse / key / scroll / touch
const PAYMENT_LOAD_TIMEOUT_MS = 6_000;
const RAGE_CLICK_WINDOW_MS = 4_000;
const RAGE_CLICK_THRESHOLD = 3;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCartFunnelTracking(state: CartFunnelState) {
  const {
    items,
    total,
    subtotal,
    shipping,
    isSignedIn,
    clientSecret,
    paymentMessage,
    sessionLoading,
    expressCheckoutReady,
  } = state;

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  // ── Refs to avoid stale closures / duplicate fires ──────────────────────────
  const hasFiredViewRef = useRef(false);
  const prevClientSecretRef = useRef<string | null>(null);
  const prevPaymentMessageRef = useRef<string | null>(null);
  const intentStartRef = useRef<number | null>(null);
  const paymentLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkoutClickTimesRef = useRef<number[]>([]);

  // ── Helper: shared cart properties added to every event ─────────────────────
  const cartProps = useCallback(() => ({
    item_count: itemCount,
    cart_total: total,
    subtotal,
    shipping,
    is_signed_in: isSignedIn,
    item_names: items.map((i) => i.name),
    item_ids: items.map((i) => i.productId),
  }), [items, total, subtotal, shipping, isSignedIn, itemCount]);

  // ── 1. cart_viewed ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasFiredViewRef.current || items.length === 0) return;
    hasFiredViewRef.current = true;
    captureEvent("cart_viewed", {
      ...cartProps(),
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }, [items.length, cartProps]);

  // ── 2. Payment intent lifecycle ──────────────────────────────────────────────

  // Track when loading starts (items exist but no secret yet)
  useEffect(() => {
    if (items.length > 0 && !clientSecret && !paymentMessage) {
      if (intentStartRef.current === null) {
        intentStartRef.current = Date.now();
        captureEvent("cart_payment_intent_loading", cartProps());

        // Timeout warning if it takes too long
        paymentLoadTimerRef.current = setTimeout(() => {
          captureEvent("cart_payment_load_timeout", {
            ...cartProps(),
            elapsed_ms: PAYMENT_LOAD_TIMEOUT_MS,
          });
        }, PAYMENT_LOAD_TIMEOUT_MS);
      }
    }

    if (clientSecret && clientSecret !== prevClientSecretRef.current) {
      prevClientSecretRef.current = clientSecret;
      if (paymentLoadTimerRef.current) {
        clearTimeout(paymentLoadTimerRef.current);
        paymentLoadTimerRef.current = null;
      }
      captureEvent("cart_payment_intent_success", {
        ...cartProps(),
        load_time_ms: intentStartRef.current ? Date.now() - intentStartRef.current : null,
      });
      intentStartRef.current = null;
    }

    return () => {
      if (paymentLoadTimerRef.current) {
        clearTimeout(paymentLoadTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret, paymentMessage, items.length]);

  // ── 3. Payment intent error ──────────────────────────────────────────────────
  useEffect(() => {
    if (
      paymentMessage &&
      paymentMessage !== prevPaymentMessageRef.current
    ) {
      prevPaymentMessageRef.current = paymentMessage;
      if (paymentLoadTimerRef.current) {
        clearTimeout(paymentLoadTimerRef.current);
        paymentLoadTimerRef.current = null;
      }
      captureEvent("cart_payment_intent_error", {
        ...cartProps(),
        error_message: paymentMessage,
        load_time_ms: intentStartRef.current ? Date.now() - intentStartRef.current : null,
      });
      intentStartRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMessage]);

  // ── 4. Express checkout shown ────────────────────────────────────────────────
  const expressShownRef = useRef(false);
  useEffect(() => {
    if (expressCheckoutReady && !expressShownRef.current) {
      expressShownRef.current = true;
      captureEvent("cart_express_checkout_shown", cartProps());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expressCheckoutReady]);

  // ── 5. Tab visibility switch during checkout ─────────────────────────────────
  useEffect(() => {
    if (items.length === 0 || typeof document === "undefined") return;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        captureEvent("cart_tab_hidden_during_checkout", {
          ...cartProps(),
          has_payment_intent: !!clientSecret,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, clientSecret]);

  // ── 6. Idle timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined") return;

    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        captureEvent("cart_user_idle_with_items", {
          ...cartProps(),
          idle_ms: IDLE_THRESHOLD_MS,
        });
      }, IDLE_THRESHOLD_MS);
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle(); // start timer immediately

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetIdle));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // ── Rage-click detector (returned so the CTA button can call it) ─────────────
  const trackCheckoutClick = useCallback(() => {
    const now = Date.now();
    checkoutClickTimesRef.current.push(now);

    // Prune clicks outside the rolling window
    checkoutClickTimesRef.current = checkoutClickTimesRef.current.filter(
      (t) => now - t < RAGE_CLICK_WINDOW_MS
    );

    captureEvent("cart_checkout_clicked", {
      ...cartProps(),
      session_loading: sessionLoading,
      click_index: checkoutClickTimesRef.current.length,
    });

    if (checkoutClickTimesRef.current.length >= RAGE_CLICK_THRESHOLD) {
      captureEvent("cart_rage_click", {
        ...cartProps(),
        clicks_in_window: checkoutClickTimesRef.current.length,
        window_ms: RAGE_CLICK_WINDOW_MS,
      });
      // Reset so the next burst fires again
      checkoutClickTimesRef.current = [];
    }
  }, [cartProps, sessionLoading]);

  // ── Item-level callbacks (call these from button handlers) ───────────────────
  const trackItemRemoved = useCallback((item: CartItem) => {
    captureEvent("cart_item_removed", {
      ...cartProps(),
      removed_product_id: item.productId,
      removed_name: item.name,
      removed_price: item.price,
      removed_size: item.size,
      removed_color: item.color,
    });
  }, [cartProps]);

  const trackQuantityChanged = useCallback((item: CartItem, newQty: number) => {
    const event = newQty <= 0 ? "cart_quantity_decreased_to_zero" : "cart_item_quantity_changed";
    captureEvent(event, {
      ...cartProps(),
      product_id: item.productId,
      product_name: item.name,
      old_quantity: item.quantity,
      new_quantity: newQty,
    });
  }, [cartProps]);

  const trackCartCleared = useCallback(() => {
    captureEvent("cart_cleared", cartProps());
  }, [cartProps]);

  const trackDiscountApplied = useCallback((code: string, amount: number) => {
    captureEvent("cart_discount_applied", {
      ...cartProps(),
      discount_code: code,
      discount_amount: amount,
    });
  }, [cartProps]);

  const trackDiscountError = useCallback((code: string, reason: string) => {
    captureEvent("cart_discount_error", {
      ...cartProps(),
      attempted_code: code,
      reason,
    });
  }, [cartProps]);

  return {
    trackCheckoutClick,
    trackItemRemoved,
    trackQuantityChanged,
    trackCartCleared,
    trackDiscountApplied,
    trackDiscountError,
  };
}
