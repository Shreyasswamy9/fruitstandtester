"use client";

import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, type CartItem } from "./CartContext";
import { gsap } from "gsap";

const TRACK_PANTS_IMAGE = "/images/products/Track Pants/ELMHURST TARO CUSTARD/P6.png";
const TRACK_PANTS_PRODUCT_ID = "859d396c-0cd7-4d62-9a95-135ce8efbb82";

const CROSS_SELL_BONUS = {
  heading: "BUNDLE AND SAVE $45.00",
  name: "Retro Track Pants",
  subtitle: "Victory Liberty Club",
  priceLabel: "$90.00",
  image: TRACK_PANTS_IMAGE,
  productId: TRACK_PANTS_PRODUCT_ID,
  slug: "/shop/track-pants",
};

const YOU_MAY_ALSO_LIKE = [
  {
    productId: "track-top",
    name: "Retro Track Jacket",
    priceLabel: "$110.00",
    image: "/images/products/Track Top/ELMHURST TARO CUSTARD/J6.png",
  },
  {
    productId: "forest-hills-hat",
    name: "Forest Hills Hat",
    priceLabel: "$46.00",
    image: "/images/products/Forest Hills Hat/Forest Hills Hat Final.png",
  },
];

const overlayBackdropId = "cart-overlay-backdrop";

function matchesTrackSuit(item: CartItem | null): boolean {
  if (!item) return false;
  const normalized = `${item.name} ${item.productId}`.toLowerCase();
  return normalized.includes("retro track suit") || normalized.includes("tracksuit");
}

export default function CartOverlay() {
  const {
    items,
    isOverlayOpen,
    closeCartOverlay,
    lastAddedItem,
    setLineQuantity,
    removeFromCart,
    addToCart,
  } = useCart();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Refs for GSAP animation
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => setMounted(true), []);

  // Initialize GSAP properties
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    // Set initial state: panel off-screen to the right, backdrop transparent
    gsap.set(panel, { xPercent: 100 });
    gsap.set(backdrop, { opacity: 0 });
  }, []);

  // Animate in/out based on isOverlayOpen
  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    // Kill any existing animations
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    if (isOverlayOpen) {
      // Animate in: backdrop fades in, panel slides in from right
      openTlRef.current = gsap.timeline()
        .to(backdrop, { opacity: 1, duration: 0.28, ease: 'power4.out' }, 0)
        .to(panel, { xPercent: 0, duration: 0.65, ease: 'power4.out' }, 0);
    } else {
      // Animate out: panel slides out to right, backdrop fades out
      closeTweenRef.current = gsap.to([panel, backdrop], {
        xPercent: (i) => (i === 0 ? 100 : 0), // panel slides right, backdrop stays
        opacity: (i) => (i === 1 ? 0 : 1), // backdrop fades out
        duration: 0.32,
        ease: 'power3.in',
      });
    }
  }, [isOverlayOpen]);

  useEffect(() => {
    if (!isOverlayOpen) return;
    if (typeof document === "undefined") return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOverlayOpen]);

  useEffect(() => {
    if (!isOverlayOpen) return;
    if (!pathname) return;
    if (pathname === "/cart") {
      closeCartOverlay();
    }
  }, [pathname, isOverlayOpen, closeCartOverlay]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0),
    [items]
  );

  const showBundle = useMemo(() => matchesTrackSuit(lastAddedItem), [lastAddedItem]);
  const youMayAlsoLike = YOU_MAY_ALSO_LIKE;

  const handleIncrement = (item: CartItem) => {
    setLineQuantity(item.lineId ?? item.productId, item.quantity + 1);
  };

  const handleDecrement = (item: CartItem) => {
    setLineQuantity(item.lineId ?? item.productId, item.quantity - 1);
  };

  const handleBundleAdd = () => {
    if (!showBundle) return;
    const size = lastAddedItem?.size;
    const color = lastAddedItem?.color;
    addToCart({
      productId: TRACK_PANTS_PRODUCT_ID,
      name: CROSS_SELL_BONUS.name,
      price: 90,
      image: TRACK_PANTS_IMAGE,
      quantity: 1,
      size: size ?? undefined,
      color: color ?? undefined,
    });
  };

  if (!mounted) {
    return null;
  }

  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  // Render overlay (always in DOM, visibility controlled by GSAP)
  return createPortal(
    <>
      {isOverlayOpen ? (
        <div
          ref={backdropRef}
          id={overlayBackdropId}
          className="fixed inset-0 z-[11002] flex items-start justify-center overflow-y-auto bg-[rgba(12,10,8,0.6)] px-4 pb-12 pt-[64px]"
          style={{ pointerEvents: isOverlayOpen ? 'auto' : 'none' }}
          onClick={(event) => {
            if (event.target instanceof HTMLElement && event.target.id === overlayBackdropId) {
              closeCartOverlay();
            }
          }}
        >
          <section
            ref={panelRef}
            className="relative w-full max-w-[480px] rounded-[28px] border border-[#1b1a18]/10 bg-[#fbf5eb] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
          >
        <header className="flex items-center justify-between border-b border-[#1b1a18]/20 pb-4">
          <h2 className="text-lg font-black uppercase tracking-[0.42em] text-[#1b1a18]">Cart</h2>
          <button
            type="button"
            onClick={closeCartOverlay}
            className="text-xs font-semibold uppercase tracking-[0.28em] text-[#1b1a18]"
          >
            Close ×
          </button>
        </header>

        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div
              key={item.lineId ?? item.productId}
              className="overflow-hidden rounded-[18px] border border-[#1b1a18]/15 bg-white"
            >
              <div className="grid grid-cols-[120px_1fr] border-b border-[#1b1a18]/15">
                <div className="relative aspect-square">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="120px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-[#1b1a18]/70">
                      {item.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between p-4">
                  <div>
                    <p className="text-base font-black uppercase tracking-[0.2em] text-[#1b1a18]">{item.name}</p>
                    {item.color ? (
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#58524a]">{item.color}</p>
                    ) : null}
                    {item.size ? (
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#58524a]">Size {item.size}</p>
                    ) : null}
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#1b1a18]">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#1b1a18]/10 pt-3 text-[#1b1a18]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1b1a18]/30 text-base"
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1b1a18]/30 text-base"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.lineId ?? item.productId)}
                      className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1b1a18]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#1b1a18]/20 bg-white/60 p-6 text-center text-sm font-semibold uppercase tracking-[0.32em] text-[#1b1a18]/60">
              Your cart is empty
            </p>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/cart"
            onClick={closeCartOverlay}
            className="block w-full rounded-full bg-black py-4 text-center text-sm font-semibold uppercase tracking-[0.35em] text-white"
          >
            Check Out
          </Link>
          <button
            type="button"
            onClick={closeCartOverlay}
            className="block w-full rounded-full border border-[#1b1a18] py-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#1b1a18]"
          >
            Continue Shopping
          </button>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-[#767068]">
            Subtotal ${subtotal.toFixed(2)}
          </p>
        </div>

        {showBundle ? (
          <div className="mt-8 rounded-[22px] border border-[#1b1a18] bg-[#f1e7d8] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.32em] text-[#1b1a18]">
                {CROSS_SELL_BONUS.heading}
              </p>
              <button
                type="button"
                onClick={handleBundleAdd}
                className="rounded-full bg-[#ffdb4d] px-6 py-2 text-[11px] font-black uppercase tracking-[0.38em] text-[#1b1a18]"
              >
                Add +
              </button>
            </div>
            <div className="mt-4 grid grid-cols-[120px_1fr] gap-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#1b1a18]/20">
                <Image src={CROSS_SELL_BONUS.image} alt={CROSS_SELL_BONUS.name} fill className="object-cover" sizes="120px" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-base font-black uppercase tracking-[0.28em] text-[#1b1a18]">{CROSS_SELL_BONUS.name}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#5f584e]">
                  {lastAddedItem?.color ?? CROSS_SELL_BONUS.subtitle}
                </p>
                {lastAddedItem?.size ? (
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#5f584e]">
                    Size {lastAddedItem.size}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.32em] text-[#1b1a18]">
                  {CROSS_SELL_BONUS.priceLabel}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {youMayAlsoLike.length ? (
          <div className="mt-8">
            <h3 className="text-[13px] font-black uppercase tracking-[0.38em] text-[#1b1a18]">You May Also Like</h3>
            <div className="mt-4 grid gap-4">
              {youMayAlsoLike.map((product) => (
                <div key={product.productId} className="flex items-center justify-between rounded-2xl border border-[#1b1a18]/20 bg-white p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#1b1a18]/15">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.28em] text-[#1b1a18]">{product.name}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#5f584e]">{product.priceLabel}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        productId: product.productId,
                        name: product.name,
                        price: Number(product.priceLabel.replace(/[^0-9.]/g, "")) || 0,
                        image: product.image,
                        quantity: 1,
                      })
                    }
                    className="rounded-full border border-[#1b1a18] px-4 py-2 text-[11px] font-black uppercase tracking-[0.38em] text-[#1b1a18]"
                  >
                    Add +
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
          </section>
        </div>
      ) : null}
    </>,
    portalTarget
  );
}
