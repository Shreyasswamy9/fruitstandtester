"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ProductImageGalleryOption = {
  name: string;
  slug?: string;
  images: string[];
  [key: string]: unknown;
};

type ProductImageGalleryProps = {
  productName: string;
  options: ReadonlyArray<ProductImageGalleryOption>;
  selectedOption: ProductImageGalleryOption;
  selectedImage: string;
  onOptionChange?: (option: ProductImageGalleryOption, ctx?: { image?: string }) => void;
  onImageChange: (image: string) => void;
  className?: string;
  thumbnailSize?: number;
  frameBackground?: string;
  frameBorderStyle?: string;
};

type FlattenedFrame = {
  option: ProductImageGalleryOption;
  optionKey: string;
  image: string;
  index: number;
};

const SWIPE_THRESHOLD = 28;
const MAX_SWIPE_DURATION = 600;
const LOCK_SLOP = 7;
const HORIZONTAL_LOCK_MIN = 18;
const HORIZONTAL_LOCK_RATIO = 1.15;
const VERTICAL_INTENT_THRESHOLD = 12;
const VERTICAL_OVERRIDE_RATIO = 1.35;

export default function ProductImageGallery({
  productName,
  options,
  selectedOption,
  selectedImage,
  onOptionChange,
  onImageChange,
  className,
  thumbnailSize = 64,
  frameBackground,
  frameBorderStyle,
}: ProductImageGalleryProps) {
  const gestureRef = useRef({
    active: false,
    pointerId: 0,
    pointerType: "",
    lockedAxis: null as null | "x" | "y",
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    captured: false,
  });
  const swipeHintTimers = useRef<number[]>([]);
  const [renderSwipeHint, setRenderSwipeHint] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const colorHintTimers = useRef<number[]>([]);
  const [renderColorHint, setRenderColorHint] = useState(false);
  const [showColorHint, setShowColorHint] = useState(false);
  const thumbnailStripRef = useRef<HTMLDivElement | null>(null);
  const [thumbnailScrollable, setThumbnailScrollable] = useState(false);
  const [thumbCanScrollLeft, setThumbCanScrollLeft] = useState(false);
  const [thumbCanScrollRight, setThumbCanScrollRight] = useState(false);

  const clearSwipeHintTimers = useCallback(() => {
    swipeHintTimers.current.forEach((timerId) => {
      clearTimeout(timerId);
    });
    swipeHintTimers.current = [];
  }, []);

  const dismissSwipeHint = useCallback(() => {
    clearSwipeHintTimers();
    setShowSwipeHint(false);
    setRenderSwipeHint(false);
  }, [clearSwipeHintTimers]);

  const clearColorHintTimers = useCallback(() => {
    colorHintTimers.current.forEach((timerId) => {
      clearTimeout(timerId);
    });
    colorHintTimers.current = [];
  }, []);

  const dismissColorHint = useCallback(() => {
    clearColorHintTimers();
    setShowColorHint(false);
    setRenderColorHint(false);
  }, [clearColorHintTimers]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    setRenderSwipeHint(true);

    const revealTimer = window.setTimeout(() => setShowSwipeHint(true), 150);
    const hideTimer = window.setTimeout(() => setShowSwipeHint(false), 2300);
    const removeTimer = window.setTimeout(() => setRenderSwipeHint(false), 2900);

    swipeHintTimers.current = [revealTimer, hideTimer, removeTimer];

    return () => {
      clearSwipeHintTimers();
    };
  }, [clearSwipeHintTimers]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedOption.images.length <= 1) {
      dismissColorHint();
      return;
    }

    setRenderColorHint(true);

    const revealTimer = window.setTimeout(() => setShowColorHint(true), 260);
    const hideTimer = window.setTimeout(() => setShowColorHint(false), 2800);
    const removeTimer = window.setTimeout(() => setRenderColorHint(false), 3400);

    colorHintTimers.current = [revealTimer, hideTimer, removeTimer];

    return () => {
      clearColorHintTimers();
    };
  }, [clearColorHintTimers, dismissColorHint, selectedOption.images.length]);

  const updateThumbnailMetrics = useCallback(() => {
    const strip = thumbnailStripRef.current;
    if (!strip) {
      setThumbnailScrollable(false);
      setThumbCanScrollLeft(false);
      setThumbCanScrollRight(false);
      return;
    }

    const scrollable = strip.scrollWidth > strip.clientWidth + 1;
    setThumbnailScrollable(scrollable);

    if (!scrollable) {
      setThumbCanScrollLeft(false);
      setThumbCanScrollRight(false);
      return;
    }

    const tolerance = 3;
    setThumbCanScrollLeft(strip.scrollLeft > tolerance);
    setThumbCanScrollRight(strip.scrollLeft < strip.scrollWidth - strip.clientWidth - tolerance);
  }, []);

  useEffect(() => {
    updateThumbnailMetrics();
  }, [ selectedOption, updateThumbnailMetrics]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("resize", updateThumbnailMetrics);
    return () => {
      window.removeEventListener("resize", updateThumbnailMetrics);
    };
  }, [updateThumbnailMetrics]);

  const handleThumbnailScroll = useCallback(() => {
    updateThumbnailMetrics();
    dismissColorHint();
  }, [dismissColorHint, updateThumbnailMetrics]);

  const handleThumbnailInteraction = useCallback(() => {
    dismissColorHint();
  }, [dismissColorHint]);

  const handleThumbnailSelect = useCallback(
    (image: string) => {
      dismissColorHint();
      onImageChange(image);
    },
    [dismissColorHint, onImageChange]
  );

  // Flatten color/image combos so we can look up the previous/next frame quickly.
  const frames = useMemo<FlattenedFrame[]>(() => {
    const flattened: FlattenedFrame[] = [];
    options.forEach((option) => {
      const optionKey = option.slug ?? option.name;
      option.images.forEach((image) => {
        flattened.push({ option, optionKey, image, index: flattened.length });
      });
    });
    return flattened;
  }, [options]);

  const frameCount = frames.length;

  const selectedKey = selectedOption.slug ?? selectedOption.name;

  const currentFrameIndex = useMemo(() => {
    return frames.findIndex(
      (frame) =>
        frame.image === selectedImage &&
        (frame.optionKey === selectedKey || frame.option.name === selectedOption.name)
    );
  }, [frames, selectedImage, selectedKey, selectedOption.name]);

  const fallbackIndex = useMemo(() => {
    const byKeyOrName = frames.findIndex(
      (frame) => frame.optionKey === selectedKey || frame.option.name === selectedOption.name
    );
    if (byKeyOrName >= 0) return byKeyOrName;
    return frames.findIndex((frame) => frame.image === selectedImage);
  }, [frames, selectedImage, selectedKey, selectedOption.name]);

  const goToFrame = useCallback(
    (nextIndex: number) => {
      if (!frameCount) return;
      const wrappedIndex = (nextIndex + frameCount) % frameCount;
      const target = frames[wrappedIndex];
      if (!target) return;

      if (target.optionKey !== selectedKey) {
        if (onOptionChange) {
          onOptionChange(target.option, { image: target.image });
          return;
        }
        if (target.image !== selectedImage) {
          onImageChange(target.image);
        }
        return;
      }

      if (target.image !== selectedImage) {
        onImageChange(target.image);
      }
    },
    [frameCount, frames, onImageChange, onOptionChange, selectedImage, selectedKey]
  );

  const goToNext = useCallback(() => {
    if (frameCount <= 1) return;
    const baseIndex = currentFrameIndex >= 0 ? currentFrameIndex : fallbackIndex;
    if (baseIndex < 0) return;
    goToFrame(baseIndex + 1);
  }, [currentFrameIndex, fallbackIndex, frameCount, goToFrame]);

  const goToPrev = useCallback(() => {
    if (frameCount <= 1) return;
    const baseIndex = currentFrameIndex >= 0 ? currentFrameIndex : fallbackIndex;
    if (baseIndex < 0) return;
    goToFrame(baseIndex - 1);
  }, [currentFrameIndex, fallbackIndex, frameCount, goToFrame]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      }
    },
    [goToNext, goToPrev]
  );

  const startGesture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") {
      gestureRef.current.active = false;
      gestureRef.current.lockedAxis = null;
      return;
    }
    dismissSwipeHint();
    dismissColorHint();
    gestureRef.current = {
      active: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      lockedAxis: null,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      startTime: performance.now(),
      captured: false,
    };
  }, [dismissColorHint, dismissSwipeHint]);

  const trackGesture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const state = gestureRef.current;
    if (!state.active || state.pointerId !== event.pointerId || state.pointerType !== "touch") return;

    state.lastX = event.clientX;
    state.lastY = event.clientY;

    const deltaX = state.lastX - state.startX;
    const deltaY = state.lastY - state.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (state.lockedAxis === null) {
      if (absX < LOCK_SLOP && absY < LOCK_SLOP) {
        return;
      }

      const verticalIntent =
        absY >= VERTICAL_INTENT_THRESHOLD && absY > absX * VERTICAL_OVERRIDE_RATIO;
      const horizontalIntent =
        absX >= HORIZONTAL_LOCK_MIN || absX > absY * HORIZONTAL_LOCK_RATIO;

      if (verticalIntent && !horizontalIntent) {
        state.active = false;
        state.lockedAxis = "y";
        return;
      }

      state.lockedAxis = "x";
      state.captured = true;
      try {
        event.currentTarget.setPointerCapture(state.pointerId);
      } catch {
        /* ignore capture failure */
      }
      event.preventDefault();
      return;
    }

    if (state.lockedAxis === "x") {
      if (!state.captured) {
        state.captured = true;
        try {
          event.currentTarget.setPointerCapture(state.pointerId);
        } catch {
          /* ignore capture failure */
        }
      }
      event.preventDefault();
    }
  }, []);

  const endGesture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = gestureRef.current;
      if (!state.active || state.pointerId !== event.pointerId) return;

      const { startX, lastX, startTime, captured: wasCaptured, pointerType, lockedAxis } = state;

      if (wasCaptured) {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          /* ignore release failure */
        }
      }

      const deltaX = lastX - startX;
      const absX = Math.abs(deltaX);
      const duration = performance.now() - startTime;

      state.active = false;
      state.captured = false;
      state.pointerType = "";
      state.lockedAxis = null;

      if (pointerType !== "touch" || lockedAxis !== "x") {
        return;
      }

      if (wasCaptured && absX > SWIPE_THRESHOLD && duration < MAX_SWIPE_DURATION) {
        if (deltaX < 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    },
    [goToNext, goToPrev]
  );

  const cancelGesture = useCallback((event?: React.PointerEvent<HTMLDivElement>) => {
    const state = gestureRef.current;
    if (state.captured && event && state.pointerId === event.pointerId) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore release failure */
      }
    }
    state.active = false;
    state.captured = false;
    state.pointerType = "";
    state.lockedAxis = null;
    dismissSwipeHint();
  }, [dismissSwipeHint]);

  const frameSurface = frameBackground ?? "#fbf6f0";

  return (
    <div className={`flex w-full flex-col items-center gap-4 ${className ?? ""}`}>
      <div
        className="relative w-full aspect-square rounded-xl overflow-hidden shadow-sm"
        style={{
          background: frameSurface,
          border: frameBorderStyle,
          touchAction: "pan-y pinch-zoom",
          overscrollBehaviorY: "contain",
        }}
        role="group"
        aria-roledescription="product image carousel"
        aria-label={`${productName} gallery`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={startGesture}
        onPointerMove={trackGesture}
        onPointerUp={endGesture}
        onPointerCancel={cancelGesture}
      >
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={productName}
          fill
          priority
          className="object-contain"
        />
        {renderSwipeHint && (
          <div
            className={`pointer-events-none absolute inset-0 flex items-end justify-center pb-6 transition-opacity duration-500 ${showSwipeHint ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex items-center gap-2 rounded-full bg-black/45 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.35em] text-white/80 shadow-sm backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-white/70" aria-hidden="true">
                <path
                  d="M14.5 5.5L8.5 11.5L14.5 17.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-white">Swipe</span>
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-white/70" aria-hidden="true">
                <path
                  d="M9.5 5.5L15.5 11.5L9.5 17.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
        {frameCount > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {frames.map((frame) => {
              const frameKey = `${frame.optionKey}-${frame.image}`;
              const isActive = frame.optionKey === selectedKey && frame.image === selectedImage;
              return (
                <span
                  key={frameKey}
                  className={`h-1.5 w-1.5 rounded-full transition ${isActive ? "bg-white" : "bg-white/40"}`}
                />
              );
            })}
          </div>
        )}
        {frameCount > 1 && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
            <button
              type="button"
              aria-label="Previous image"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#111] shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/60 sm:h-9 sm:w-9"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goToPrev();
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  d="M14.5 5.5L8.5 11.5L14.5 17.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#111] shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/60 sm:h-9 sm:w-9"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goToNext();
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  d="M9.5 5.5L15.5 11.5L9.5 17.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {selectedOption.images.length > 1 && (
        <div className="relative w-full">
          {renderColorHint && thumbnailScrollable && (
            <div
              className={`pointer-events-none absolute -top-7 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-white/80 shadow-lg backdrop-blur transition-opacity duration-500 ${showColorHint ? "opacity-100" : "opacity-0"}`}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                <path
                  d="M15 6L9 12L15 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>More Shades</span>
              <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                <path
                  d="M9 6L15 12L9 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          <div
            ref={thumbnailStripRef}
            className={`flex w-full flex-nowrap items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${thumbnailScrollable ? "" : "justify-center"}`}
            onScroll={handleThumbnailScroll}
            onPointerDown={handleThumbnailInteraction}
          >
            {selectedOption.images.map((image) => {
              const isActive = image === selectedImage;
              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => handleThumbnailSelect(image)}
                  onFocus={handleThumbnailInteraction}
                  className={`group relative flex-shrink-0 rounded-xl border transition ${isActive ? "border-transparent ring-2 ring-black" : "border-gray-200"}`}
                  style={{ width: thumbnailSize, height: thumbnailSize }}
                  aria-label={`View alternate angle of ${productName}`}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(15,15,15,0.12)] transition group-hover:shadow-[0_14px_24px_rgba(15,15,15,0.16)]">
                    <Image src={image} alt="" fill className="object-contain" />
                  </span>
                </button>
              );
            })}
          </div>
          {thumbnailScrollable && thumbCanScrollLeft && (
            <div
              className="pointer-events-none absolute inset-y-1 left-0 w-10"
              style={{ background: `linear-gradient(to right, ${frameSurface}, transparent)` }}
            />
          )}
          {thumbnailScrollable && thumbCanScrollRight && (
            <div
              className="pointer-events-none absolute inset-y-1 right-0 w-10"
              style={{ background: `linear-gradient(to left, ${frameSurface}, transparent)` }}
            />
          )}
        </div>
      )}
    </div>
  );
}
