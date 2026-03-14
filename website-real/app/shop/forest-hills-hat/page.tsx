"use client";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { useCart } from "../../../components/CartContext";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import ProductPurchaseBar, { type PurchaseSizeOption } from "@/components/ProductPurchaseBar";
import { useTrackProductView } from "@/hooks/useTrackProductView";
import StPatsBanner from "@/components/StPatsBanner";
import { isGreenColorOnSale, getStPatsPrice } from "@/lib/stPatricksDay";
import { useSurveyMode } from "@/hooks/useSurveyMode";

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

const FOREST_HILLS_HAT_IMAGES = [
  "/images/products/Forest Hills Hat/Forest Hills Hat Final.png",
  "/images/products/Forest Hills Hat/Green Hat.png",
  "/images/products/Forest Hills Hat/G1.png",
  "/images/products/Forest Hills Hat/G2.png",
  "/images/products/Forest Hills Hat/G3.png",
  "/images/products/Forest Hills Hat/G4.png",
];

const PRODUCT = {
  name: "Forest Hills Hat",
  price: 46,
  description: "Lime green cotton twill with tonal  embroidery front and back.",
  details: [
    "6-panel camp silhouette",
    "Lime green crown with matching under-brim",
    "Detailed embroidery on front and back",
    "Adjustable strap, one size fits most",
    "Made in Fujian, China",
    "Quality guaranteed, Free returns."
  ],
};

export default function ForestHillsHatPage() {
  const isSurveyMode = useSurveyMode();
  const [selectedImage, setSelectedImage] = useState(FOREST_HILLS_HAT_IMAGES[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sizeOptions = useMemo<PurchaseSizeOption[]>(
    () => [{ value: "ONE_SIZE", label: "One Size" }],
    []
  );
  const [selectedSize, setSelectedSize] = useState<string>(() => sizeOptions[0]?.value ?? "");
  const { addToCart } = useCart();

  useTrackProductView({
    productId: "8d1d5080-2106-420d-b7ea-babc2fba5457",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
  });

  const stPatsSalePrice = getStPatsPrice("forest-hills-hat", PRODUCT.price, null);
  const isOnStPats = isGreenColorOnSale("forest-hills-hat", null);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) return;
    addToCart({
      productId: "8d1d5080-2106-420d-b7ea-babc2fba5457",
      name: PRODUCT.name,
      price: isOnStPats ? stPatsSalePrice : PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
    });
  }, [addToCart, selectedImage, selectedSize]);

  const boughtTogetherItems = getFBTForPage("forest-hills-hat");

  return (
    <div>
      <ProductPageBrandHeader />


      <main className="bg-[#fbf5ed] pb-[60px] pt-16 md:pt-20 lg:pt-24">
        <div className="mx-auto w-full max-w-[1280px] px-6 text-center lg:px-12 lg:text-left lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-14" style={{ minHeight: '75vh' }}>
          {/* IMAGE COLUMN */}
          <div className="relative mx-auto aspect-[4/5] w-full lg:mx-0 lg:max-w-[620px] lg:row-span-3">
            <ProductImageGallery
              productName={PRODUCT.name}
              options={[
                {
                  name: "Default",
                  images: FOREST_HILLS_HAT_IMAGES,
                },
              ]}
              selectedOption={{
                name: "Default",
                images: FOREST_HILLS_HAT_IMAGES,
              } as ProductImageGalleryOption}
              selectedImage={selectedImage}
              onImageChange={(image) => {
                setSelectedImage(image);
                setCurrentImageIndex(FOREST_HILLS_HAT_IMAGES.indexOf(image));
              }}
              className="h-full w-full"
              frameBackground="transparent"
            />
          </div>

          {/* INFO COLUMN */}
          <div className="mt-8 flex flex-col items-center lg:col-start-2 lg:items-start lg:mt-0">
            <h1 className="text-[24px] uppercase tracking-[0.08em] leading-tight text-[#1d1c19] font-avenir-black">
              {PRODUCT.name}
            </h1>

            {!isSurveyMode && (
              <>
                {isOnStPats ? (
                  <>
                    <p className="mt-2 text-[26px] font-black text-gray-400">—</p>
                  </>
                ) : (
                  <p className="mt-2 text-[26px] font-black text-[#1d1c19]">Coming Soon</p>
                )}
                {isOnStPats && (
                  <StPatsBanner colorName="Lime Green" />
                )}
              </>
            )}

            {/* DESCRIPTION SECTION */}
            <div className="w-full text-center lg:text-left mt-5">
              <p className="px-1 text-[14px] leading-relaxed text-[#3d372f]">
                {formatText(PRODUCT.description, "Forest Hills Hat", ["Forest", "Hills", "Lime", "Green", ""])}
              </p>
            </div>

            {/* DETAILS SECTION */}
            <div className="w-full text-left mt-8">
              <p className="text-base font-semibold text-[#1d1c19]">Details</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1d1c19]">
                {PRODUCT.details.map((detail) => (
                  <li key={detail}>{formatText(detail, "Forest Hills Hat", ["Forest", "Hills", "Lime", "Green", ""])}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE SECTION */}
        <div className="mx-auto w-full max-w-[1200px] px-6 text-center lg:px-12">
          <div className="mt-12">
            <p className="text-[22px] font-black uppercase tracking-[0.32em] text-[#1d1c19]">
              You May Also Like
            </p>
            <div className="mt-6 grid w-full grid-cols-2 gap-x-5 gap-y-10 text-left sm:grid-cols-3 lg:grid-cols-4">
              {boughtTogetherItems.map((product) => (
                <div key={`${product.name}-${product.image}`} className="flex flex-col hover:shadow-lg transition-shadow rounded-lg">
                  <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#1d1c19] bg-white">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-[0.34em] text-[#1d1c19]">
                    {product.name}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#1d1c19]">
                    Coming Soon
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {!isSurveyMode ? (
        <ProductPurchaseBar
          price={isOnStPats ? stPatsSalePrice : PRODUCT.price}
          summaryLabel="LIME GREEN"
          sizeOptions={sizeOptions}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-[10004]">
          <div className="w-full pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
            <div className="relative flex overflow-hidden border-t border-white bg-gray-800 text-white shadow-[0_-14px_40px_rgba(0,0,0,0.35)]">
              <div className="flex h-full w-full items-center justify-center py-4 px-6">
                <span className="text-[13px] font-semibold uppercase tracking-[0.18em]">
                  More Information Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
