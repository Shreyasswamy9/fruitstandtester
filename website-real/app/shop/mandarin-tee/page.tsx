"use client";
import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SizeGuide from "@/components/SizeGuide";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import { useCart } from "../../../components/CartContext";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import ProductPurchaseBar, { type PurchaseSizeOption } from "@/components/ProductPurchaseBar";
import { useTrackProductView } from "@/hooks/useTrackProductView";

// Simple formatter for highlighting keywords in the description
// Formatter: lowercase except product/color names uppercased
function formatText(text: string, productName: string, colorNames: string[]): string {
  let lower = text.toLowerCase();
  // Uppercase product name
  const nameRegex = new RegExp(productName, "gi");
  lower = lower.replace(nameRegex, productName.toUpperCase());
  // Uppercase color names
  colorNames.forEach(color => {
    const colorRegex = new RegExp(color, "gi");
    lower = lower.replace(colorRegex, color.toUpperCase());
  });
  // Capitalize first word of each sentence
  lower = lower.replace(/(?:^|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());
  return lower;
}

const MANDARIN_IMAGES = [
  "/images/products/Mandarin Tee/Mandarin Tee.png",
  "/images/products/Mandarin Tee/Mandarin 2.png",
  "/images/products/Mandarin Tee/Mandarin 3.png",
  "/images/products/Mandarin Tee/Mandarin 4.png",
];

const PRODUCT = {
  name: "Mandarin 橘子 [JUZI] Tee",
  price: 68,
  description:
    "Cut from heavyweight 300 GSM cotton, the Mandarin Tee brings structure to a relaxed, cropped silhouette. Minimal seams keep the oversized fruit graphic uninterrupted front and back.",
  details: [
    "100% premium heavyweight cotton (300 GSM)",
    "Two-panel construction for a seamless print",
    "Cropped, boxy silhouette",
    '32" screen-printed artwork front and back',
    "Made in Dongguan, Guangdong, China",
    "Ships with a custom  sticker printed in NYC",
    "Quality guaranteed, Free returns."
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
};

const OUT_OF_STOCK_SIZES = [
  "XS", "S", "XXXL"] as const;

export default function MandarinTeePage() {
  const [selectedImage, setSelectedImage] = useState(MANDARIN_IMAGES[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sizeOptions = useMemo<PurchaseSizeOption[]>(
    () =>
      PRODUCT.sizes.map((size) => ({
        value: size,
        label: size,
        soldOut: OUT_OF_STOCK_SIZES.includes(size as (typeof OUT_OF_STOCK_SIZES)[number]),
      })),
    []
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    const firstAvailable = sizeOptions.find((option) => !option.soldOut)?.value;
    return firstAvailable ?? null;
  });
  const { addToCart } = useCart();

  useTrackProductView({
    productId: "f47a07e4-6470-49b2-ace6-a60e70ee3737",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
  });

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) return;
    addToCart({
      productId: "f47a07e4-6470-49b2-ace6-a60e70ee3737",
      name: PRODUCT.name,
      price: PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
    });
  }, [addToCart, selectedImage, selectedSize]);

  const boughtTogetherItems = getFBTForPage("mandarin-tee");

  const selectedSizeSoldOut = selectedSize
    ? sizeOptions.find((option) => option.value === selectedSize)?.soldOut
    : false;

  return (
    <div>
      <ProductPageBrandHeader />

      <main className="bg-[#fbf5ed] pb-15 pt-16 md:pt-20 lg:pt-24">
        {/* HERO SECTION - Top 75% */}
        <div className="mx-auto w-full max-w-7xl px-6 text-center lg:px-12 lg:text-left lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-14" style={{ minHeight: '75vh' }}>
          {/* IMAGE */}
          <div className="relative mx-auto aspect-4/5 w-full lg:mx-0 lg:max-w-155 lg:row-span-3">
            <ProductImageGallery
              productName={PRODUCT.name}
              options={[
                {
                  name: "Default",
                  images: MANDARIN_IMAGES,
                },
              ]}
              selectedOption={{
                name: "Default",
                images: MANDARIN_IMAGES,
              } as ProductImageGalleryOption}
              selectedImage={selectedImage}
              onImageChange={(image) => {
                setSelectedImage(image);
                setCurrentImageIndex(MANDARIN_IMAGES.indexOf(image));
              }}
              className="h-full w-full"
              frameBackground="transparent"
            />
          </div>

          {/* TITLE / PRICE */}
          <div className="mt-8 flex flex-col items-center lg:col-start-2 lg:items-start lg:mt-45">
            <h1 className="text-[24px] uppercase tracking-[0.08em] leading-tight text-[#1d1c19] font-avenir-black">
              {PRODUCT.name}
            </h1>


            <p className="mt-2 text-[26px] font-black text-[#1d1c19]">Coming Soon</p>

            {/* SIZE GUIDE */}
            <div className="mt-2 text-[13px] font-semibold uppercase tracking-[0.34em] text-[#1d1c19] lg:col-start-2 lg:text-left">
              <SizeGuide
                productSlug="mandarin-tee"
                imagePath="/images/size-guides/Size Guide/Mandarin Tee Table.png"
                buttonLabel="SIZE GUIDE"
                className="text-[13px] font-semibold uppercase tracking-[0.34em]"
              />
            </div>
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="mx-auto w-full max-w-225 px-6 text-center lg:px-12 mt-5">
          <p className="px-1 text-[14px] leading-relaxed text-[#3d372f]">
            {formatText(PRODUCT.description, PRODUCT.name, ["Mandarin", "JUZI"])}
          </p>
        </div>

        {/* DETAILS SECTION */}
        <div className="mx-auto w-full max-w-225 px-6 text-left lg:px-12">
          <div className="mt-8">
            <p className="text-base font-semibold text-[#1d1c19]">Details</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1d1c19]">
              {PRODUCT.details.map((detail) => (
                <li key={detail}>{formatText(detail, PRODUCT.name, ["Mandarin", "JUZI"])} </li>
              ))}
            </ul>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE SECTION */}
        <div className="mx-auto w-full max-w-300 px-6 text-center lg:px-12">
          <div className="mt-8">
            <p className="text-[22px] font-black uppercase tracking-[0.32em] text-[#1d1c19]">
              You May Also Like
            </p>
            <div className="mt-5 grid w-full grid-cols-2 gap-x-4 gap-y-6 text-left sm:grid-cols-3 lg:grid-cols-4">
              {boughtTogetherItems.map((product) => (
                <Link
                  key={`${product.name}-${product.image}`}
                  href={`/shop/${product.id}`}
                  className="flex flex-col hover:shadow-lg transition-shadow rounded-lg"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="relative aspect-4/5 w-full overflow-hidden border border-[#1d1c19] bg-white">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="200px" />
                  </div>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-[0.34em] text-[#1d1c19]">
                    {product.name}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#1d1c19]">
                    Coming Soon
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ProductPurchaseBar
        price={PRODUCT.price}
        summaryLabel="MANDARIN 橘子"
        sizeOptions={sizeOptions}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        onAddToCart={handleAddToCart}
        addDisabled={!selectedSize || Boolean(selectedSizeSoldOut)}
        addDisabledReason={selectedSizeSoldOut ? "Sold out" : undefined}
      />
    </div>
  );
}
