"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import SizeGuide from "@/components/SizeGuide";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import ProductPurchaseBar, { PurchaseColorOption, PurchaseSizeOption } from "@/components/ProductPurchaseBar";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { useCart } from "@/components/CartContext";
import { TEE_VARIANTS, SIZE_OPTIONS, type TeeVariant, type TeeColor, type SizeOption } from "@/lib/teeVariants";
import { CUSTOM_BUNDLE_PRICES, type CustomBundleSize } from "@/lib/customBundles";
import { useTrackProductView } from "@/hooks/useTrackProductView";

function formatText(text: string, productName: string, colorNames: string[]): string {
  let lower = text.toLowerCase();
  const nameRegex = new RegExp(productName, "gi");
  lower = lower.replace(nameRegex, productName.toUpperCase());
  colorNames.forEach(color => {
    const colorRegex = new RegExp(color, "gi");
    lower = lower.replace(colorRegex, color.toUpperCase());
  });
  lower = lower.replace(/(?:^|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());
  return lower;
}

const PRODUCT = {
  name: " Tee Bundle",
  subtitle: "Build Your Bundle",
  description: "Choose your favorite tees, pick the colors, and lock in your size. Build a trio now, then expand to four or five with the same bundle pricing.",
  details: [
    "Mix and match any Gala, Cameo, Mutsu, or Fuji tees",
    "Select color + size for each tee",
    "Bundle pricing applied automatically",
    "Ships together as one curated set",
    "Quality guaranteed, Free returns."
  ],
};

type BundleItem = {
  tee: TeeVariant;
  color: TeeColor;
  size: SizeOption | null;
};

export default function TshirtBundlePage() {
  const { addToCart } = useCart();

  const [bundleSize, setBundleSize] = useState<CustomBundleSize>(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [items, setItems] = useState<BundleItem[]>([
    { tee: TEE_VARIANTS[0], color: TEE_VARIANTS[0].colors[0], size: null },
    { tee: TEE_VARIANTS[1], color: TEE_VARIANTS[1].colors[0], size: null },
    { tee: TEE_VARIANTS[2], color: TEE_VARIANTS[2].colors[0], size: null },
  ]);

  const currentItem = items[currentIndex];

  useTrackProductView({
    productId: "89c1a393-3829-47bc-9c11-40e8183672cd",
    productName: PRODUCT.name,
    price: CUSTOM_BUNDLE_PRICES[bundleSize],
    currency: "USD",
  });

  const updateTeeType = useCallback((tee: TeeVariant) => {
    setCurrentImageIndex(0);
    setItems((prev) => {
      const next = [...prev];
      next[currentIndex] = { tee, color: tee.colors[0], size: null };
      return next;
    });
  }, [currentIndex]);

  const updateColor = useCallback((colorName: string) => {
    const color = currentItem.tee.colors.find((c) => c.name === colorName);
    if (!color) return;
    setCurrentImageIndex(0);
    setItems((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], color };
      return next;
    });
  }, [currentIndex, currentItem.tee.colors]);

  const updateSize = useCallback((sizeValue: string) => {
    const size = SIZE_OPTIONS.find((s) => s === sizeValue);
    if (!size) return;
    setItems((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], size };
      return next;
    });
    
    // Move to next incomplete item or stay on last
    setTimeout(() => {
      const nextIncomplete = items.findIndex((item, i) => i > currentIndex && !item.size);
      if (nextIncomplete !== -1) {
        setCurrentIndex(nextIncomplete);
      } else if (currentIndex < bundleSize - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  }, [currentIndex, items, bundleSize]);

  const expandBundle = useCallback((newSize: CustomBundleSize) => {
    setBundleSize(newSize);
    setItems((prev) => {
      const next = [...prev];
      while (next.length < newSize) {
        const tee = TEE_VARIANTS[next.length % TEE_VARIANTS.length];
        next.push({ tee, color: tee.colors[0], size: null });
      }
      return next;
    });
  }, []);

  const filledCount = items.filter((item) => item.size).length;
  const canAddToCart = filledCount === bundleSize;

  const addBundleToCart = useCallback(() => {
    if (!canAddToCart) return;
    const price = CUSTOM_BUNDLE_PRICES[bundleSize];
    const summary = items
      .slice(0, bundleSize)
      .map((item) => `${item.tee.name} • ${item.color.name} • ${item.size}`)
      .join(" | ");
    addToCart({
      productId: "89c1a393-3829-47bc-9c11-40e8183672cd",
      name: `Build Your Bundle (${bundleSize}) – ${summary}`,
      price,
      image: "/images/products/Teebundle/Five T-Shirts.png",
      quantity: 1,
    });
  }, [addToCart, bundleSize, canAddToCart, items]);

  const allColorNames = useMemo(() => TEE_VARIANTS.flatMap((tee) => tee.colors.map((c) => c.name)), []);
  const description = useMemo(
    () => formatText(PRODUCT.description, PRODUCT.name, allColorNames),
    [allColorNames]
  );

  const boughtTogetherItems = useMemo(() => getFBTForPage("tshirt-bundle"), []);

  // Purchase bar options
  const colorOptions: PurchaseColorOption[] = useMemo(
    () => currentItem.tee.colors.map((c) => ({ label: c.name, value: c.name, hex: c.hex })),
    [currentItem.tee.colors]
  );

  const sizeOptions: PurchaseSizeOption[] = useMemo(
    () => SIZE_OPTIONS.map((s) => ({ value: s, label: s })),
    []
  );

  return (
    <div>
      <ProductPageBrandHeader />

      <main className="bg-[#fbf5ed] pb-15 pt-16 md:pt-20 lg:pt-24">
        <div
          className="mx-auto w-full max-w-7xl px-6 text-center lg:px-12 lg:text-left lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-14"
          style={{ minHeight: "75vh" }}
        >
          {/* IMAGE */}
          <div className="relative mx-auto aspect-4/5 w-full lg:mx-0 lg:max-w-155 lg:row-span-3">
            <ProductImageGallery
              productName={PRODUCT.name}
              options={[
                {
                  name: currentItem.color.name,
                  images: currentItem.color.images || [currentItem.color.image],
                },
              ]}
              selectedOption={{
                name: currentItem.color.name,
                images: currentItem.color.images || [currentItem.color.image],
              } as ProductImageGalleryOption}
              selectedImage={currentItem.color.images?.[currentImageIndex] || currentItem.color.image}
              onImageChange={(image) => {
                const images = currentItem.color.images || [currentItem.color.image];
                setCurrentImageIndex(images.indexOf(image));
              }}
              className="h-full w-full"
              frameBackground="transparent"
            />
          </div>

          {/* TITLE / PRICE / BUILDER */}
          <div className="mt-8 flex flex-col items-center lg:col-start-2 lg:items-start lg:mt-45">
            <h1 className="text-[24px] uppercase tracking-[0.08em] leading-tight text-[#1d1c19] font-avenir-black">
              {PRODUCT.name}
            </h1>
            <p className="mt-1 text-[18px] text-[#1d1c19] font-avenir-light">
              {PRODUCT.subtitle.toUpperCase()}
            </p>

            <p className="mt-2 text-[26px] font-black text-[#1d1c19]">
              Coming Soon
            </p>

            {/* PROGRESS INDICATOR */}
            <div className="mt-6 flex items-center gap-2">
              {items.slice(0, bundleSize).map((item, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    i === currentIndex
                      ? "border-black bg-black text-white"
                      : item.size
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-black/20 text-black/40"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* TEE TYPE SELECTOR */}
            <div className="mt-6 w-full">
              <p className="text-xs uppercase tracking-[0.2em] text-[#1d1c19]/70 mb-3">
                Tee {currentIndex + 1} - Choose Type
              </p>
              <div className="flex flex-wrap gap-2">
                {TEE_VARIANTS.map((tee) => (
                  <button
                    key={tee.slug}
                    type="button"
                    onClick={() => updateTeeType(tee)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
                      tee.slug === currentItem.tee.slug
                        ? "border-black bg-black text-white"
                        : "border-black/20 text-[#1d1c19] hover:border-black"
                    }`}
                  >
                    {tee.name}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR SWATCHES */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {currentItem.tee.colors.map((color) => {
                const isActive = color.name === currentItem.color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => updateColor(color.name)}
                    aria-label={color.name}
                    className={[
                      "appearance-none bg-transparent [-webkit-tap-highlight-color:transparent]",
                      "h-7 w-7 rounded-full overflow-hidden p-0.5",
                      "transition-transform duration-150 hover:-translate-y-px",
                      "focus:outline-none focus:ring-2 focus:ring-[#1d1c19]/35",
                      isActive ? "ring-2 ring-[#1d1c19]" : "ring-1 ring-[#cfc2b3]",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden
                      className="block h-full w-full rounded-full"
                      style={{
                        backgroundColor: color.hex,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* EXPAND BUNDLE */}
            {filledCount === bundleSize && bundleSize < 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <button
                  onClick={() => expandBundle((bundleSize + 1) as CustomBundleSize)}
                  className="rounded-full border-2 border-black bg-white px-6 py-2 text-sm font-bold tracking-wide transition-all hover:bg-black hover:text-white"
                >
                  + Add {bundleSize === 3 ? "4th" : "5th"} Tee (Coming Soon)
                </button>
              </motion.div>
            )}
          </div>

          {/* DESCRIPTION */}
          <section className="mt-12 lg:col-span-2 lg:mt-24">
            <div className="mx-auto max-w-225">
              <h2 className="text-[20px] uppercase tracking-[0.12em] font-avenir-black text-[#1d1c19]">
                Description
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#1d1c19]/80">
                {description}
              </p>
            </div>
          </section>

          {/* DETAILS */}
          <section className="mt-10 lg:col-span-2 lg:mt-16">
            <div className="mx-auto max-w-225">
              <h2 className="text-[20px] uppercase tracking-[0.12em] font-avenir-black text-[#1d1c19]">
                Details
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[#1d1c19]/80">
                {PRODUCT.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* YOU MAY ALSO LIKE */}
          {boughtTogetherItems && boughtTogetherItems.length > 0 && (
            <section className="mt-12 lg:col-span-2 lg:mt-20">
              <h2 className="mb-6 text-center text-[20px] uppercase tracking-[0.12em] font-avenir-black text-[#1d1c19] lg:text-left">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {boughtTogetherItems.map((item) => (
                  <a key={item.id} href={`/shop/${item.id}`} className="group">
                    <div className="relative aspect-4/5 w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-2 text-center lg:text-left">
                      <p className="text-[13px] uppercase tracking-wide text-[#1d1c19]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[15px] font-bold text-[#1d1c19]">
                        Coming Soon
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* PURCHASE BAR */}
      <ProductPurchaseBar
        price={CUSTOM_BUNDLE_PRICES[bundleSize]}
        colorOptions={colorOptions}
        selectedColor={currentItem.color.name}
        onSelectColor={updateColor}
        sizeOptions={sizeOptions}
        selectedSize={currentItem.size}
        onSelectSize={updateSize}
        onAddToCart={addBundleToCart}
        addDisabled={!canAddToCart}
        addDisabledReason={!canAddToCart ? "Complete all tees in bundle" : undefined}
      />
    </div>
  );
}
