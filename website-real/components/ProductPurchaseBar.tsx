"use client";

import { Shredder } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSurveyMode } from '@/hooks/useSurveyMode';

export type PurchaseSizeOption = {
  value: string;
  label?: string;
  soldOut?: boolean;
  note?: string;
};

export type PurchaseColorOption = {
  value: string;
  label: string;
  swatch?: string;
  border?: string;
};

type ProductPurchaseBarProps = {
  price: number;
  currency?: string;
  addToCartLabel?: string;
  addDisabled?: boolean;
  addDisabledReason?: string;
  isAdding?: boolean;
  sizeOptions: PurchaseSizeOption[];
  selectedSize: string | null;
  onSelectSize: (value: string) => void;
  colorOptions?: PurchaseColorOption[];
  selectedColor?: string | null;
  onSelectColor?: (value: string) => void;
  onAddToCart: () => void;
  sizeGuideTrigger?: React.ReactNode;
  summaryLabel?: string;
};

const PURCHASE_BAR_HEIGHT_FALLBACK = 220;

export default function ProductPurchaseBar({
  price: _price,
  currency: _currency = "USD",
  addToCartLabel = "Add to Cart",
  addDisabled,
  addDisabledReason,
  isAdding,
  sizeOptions,
  selectedSize,
  onSelectSize,
  colorOptions,
  selectedColor,
  onSelectColor,
  onAddToCart,
  sizeGuideTrigger,
  summaryLabel: _summaryLabel,
}: ProductPurchaseBarProps) {
  const isSurveyMode = useSurveyMode();
  const barRef = useRef<HTMLDivElement | null>(null);
  const sizeNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [barHeight, setBarHeight] = useState(PURCHASE_BAR_HEIGHT_FALLBACK);
  const [showSizeNotice, setShowSizeNotice] = useState(false);

  const selectedColorOption = useMemo(() => {
    if (!selectedColor || !colorOptions?.length) return null;
    return colorOptions.find((opt) => opt.value === selectedColor) ?? null;
  }, [selectedColor, colorOptions]);

  const sizeLabel = useMemo(() => {
    if (!selectedSize) return "SIZE";
    const found = sizeOptions.find((opt) => opt.value === selectedSize);
    return (found?.label ?? selectedSize).toUpperCase();
  }, [selectedSize, sizeOptions]);

  const colorLabel = useMemo(() => {
    if (!selectedColorOption) return "COLOR";
    return selectedColorOption.label.toUpperCase();
  }, [selectedColorOption]);

  const addButtonDisabled = Boolean(addDisabled);
  const disableReason = addDisabled ? addDisabledReason : undefined;

  const triggerSizeNotice = () => {
    setShowSizeNotice(true);

    if (sizeNoticeTimeoutRef.current) {
      clearTimeout(sizeNoticeTimeoutRef.current);
    }

    sizeNoticeTimeoutRef.current = setTimeout(() => {
      setShowSizeNotice(false);
      sizeNoticeTimeoutRef.current = null;
    }, 1700);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = barRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setBarHeight(entry.contentRect.height);
      }
    }); 

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const height = Math.max(barHeight || 0, PURCHASE_BAR_HEIGHT_FALLBACK);
    document.documentElement.style.setProperty("--purchase-bar-height", `${Math.round(height)}px`);
    return () => {
      document.documentElement.style.removeProperty("--purchase-bar-height");
    };
  }, [barHeight]);

  useEffect(() => {
    return () => {
      if (sizeNoticeTimeoutRef.current) {
        clearTimeout(sizeNoticeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSize) {
      setShowSizeNotice(false);
    }
  }, [selectedSize]);

  const handleAddToCartClick = () => {
    if (isAdding || addButtonDisabled) return;

    if (!selectedSize) {
      triggerSizeNotice();
      return;
    }

    onAddToCart();
  };

  // In survey mode, show a message instead of purchase functionality
  if (isSurveyMode) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[10004]">
        <div className="pointer-events-auto w-full pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
          <div className="relative flex overflow-hidden border-t border-white bg-gray-800 text-white shadow-[0_-14px_40px_rgba(0,0,0,0.35)]">
            <div className="flex h-full w-full items-center justify-center py-4 px-6">
              <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-center">
                More Information Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[10004]">
        <div className="pointer-events-auto w-full pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
          <div
            className={`pointer-events-none flex justify-center px-4 pb-2 transition-all duration-300 ${
              showSizeNotice ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
            aria-live="polite"
          >
            <div className="rounded-full border border-white/20 bg-black/90 px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-white shadow-lg backdrop-blur-sm">
              Select a size before adding to cart
            </div>
          </div>

          <div
            ref={barRef}
            className="relative flex overflow-hidden border-t border-white bg-black text-white shadow-[0_-14px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex h-full w-full items-stretch">
              <div className="relative flex flex-1 items-center justify-end border-r border-black px-3 py-4">
                {selectedColorOption?.swatch ? (
                  <span
                    aria-hidden
                    className="mr-2 inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: selectedColorOption.swatch,
                      border: selectedColorOption.border ?? "1px solid rgba(255,255,255,0.45)",
                    }}
                  />
                ) : null}
                <span className="max-w-[120px] truncate text-[13px] font-semibold uppercase tracking-[0.18em]">
                  {colorLabel}
                </span>
                <span className="pointer-events-none text-sm text-white ml-2">▼</span>
                <select
                  aria-label="Select color"
                  value={selectedColor ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value) {
                      onSelectColor?.(value);
                    }
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  style={{ color: "#000000", backgroundColor: "#ffffff" }}
                >
                  {!selectedColor && <option value="">Select</option>}
                  {colorOptions?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex flex-1 items-center justify-end border-r border-white px-3 py-4">
                <span className="max-w-[120px] truncate text-[13px] font-semibold uppercase tracking-[0.18em]">
                  {sizeLabel}
                </span>
                <span className="pointer-events-none text-sm text-white ml-2">▼</span>
                <select
                  aria-label="Select size"
                  value={selectedSize ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value) {
                      onSelectSize(value);
                    }
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  style={{ color: "#000000", backgroundColor: "#ffffff" }}
                >
                  {!selectedSize && <option value="">Select</option>}
                  {sizeOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.soldOut}>
                      {option.label ?? option.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex flex-1 items-stretch bg-white text-black">
                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  disabled={addButtonDisabled || isAdding}
                  className={`relative z-10 flex h-full w-full items-center justify-center px-3 text-[13px] font-semibold uppercase tracking-[0.18em] transition ${
                    addButtonDisabled || isAdding ? "opacity-50" : "hover:bg-[#f4f4f4]"
                  }`}
                  title={disableReason}
                >
                  {isAdding ? "ADDING" : addButtonDisabled && disableReason ? disableReason.toUpperCase() : addToCartLabel.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sizeGuideTrigger ? (
        <div className="mt-4 flex justify-center text-[10px] font-semibold uppercase tracking-[0.34em] text-[#1c1a18]">
          {sizeGuideTrigger}
        </div>
      ) : null}

      <div
        aria-hidden
        style={{ height: `calc(var(--purchase-bar-height, ${PURCHASE_BAR_HEIGHT_FALLBACK}px) + 32px)` }}
      />
    </>
  );
}
