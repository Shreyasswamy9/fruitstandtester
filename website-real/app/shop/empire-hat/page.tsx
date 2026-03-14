"use client";
import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { useCart } from "../../../components/CartContext";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import ProductPurchaseBar, { type PurchaseSizeOption } from "@/components/ProductPurchaseBar";
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

const EMPIRE_HAT_IMAGES = [
  "/images/products/empire-hat/Apple Hat.png",
  "/images/products/empire-hat/A1.png",
  "/images/products/empire-hat/A2.png",
  "/images/products/empire-hat/A3.png",
  "/images/products/empire-hat/A4.png",
  "/images/products/empire-hat/A5.png",
];

const PRODUCT = {
  name: "Empire Corduroy Hat",
  price: 49,
  description: "Premium corduroy finished with apple red embroidery front, back, and brim.",
  details: [
    "Deep red corduroy 6-panel camp hat",
    "Embroidered hits across the crown and brim",
    "Flexible brim with contrast under-bill",
    "Adjustable strap, one size fits most",
    "Made in Fujian, China",
    "Quality guaranteed, Free returns."
  ],
};

export default function EmpireHatPage() {
  const [selectedImage, setSelectedImage] = useState(EMPIRE_HAT_IMAGES[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sizeOptions = useMemo<PurchaseSizeOption[]>(
    () => [{ value: "ONE_SIZE", label: "One Size" }],
    []
  );
  const [selectedSize, setSelectedSize] = useState<string>(() => sizeOptions[0]?.value ?? "");
  const { addToCart } = useCart();

  useTrackProductView({
    productId: "98da26f5-be40-4f35-a8ad-b26dd9ae01f9",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
  });

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) return;
    addToCart({
      productId: "98da26f5-be40-4f35-a8ad-b26dd9ae01f9",
      name: PRODUCT.name,
      price: PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
    });
  }, [addToCart, selectedImage, selectedSize]);

  const boughtTogetherItems = getFBTForPage("empire-hat");

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
                  images: EMPIRE_HAT_IMAGES,
                },
              ]}
              selectedOption={{
                name: "Default",
                images: EMPIRE_HAT_IMAGES,
              } as ProductImageGalleryOption}
              selectedImage={selectedImage}
              onImageChange={(image) => {
                setSelectedImage(image);
                setCurrentImageIndex(EMPIRE_HAT_IMAGES.indexOf(image));
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
            <p className="mt-2 text-[26px] font-black text-[#1d1c19]">Coming Soon</p>
            {/* DESCRIPTION SECTION */}
            <div className="w-full text-center lg:text-left mt-5">
              <p className="px-1 text-[14px] leading-relaxed text-[#3d372f]">
                {formatText(PRODUCT.description, "Empire Corduroy Hat", ["Empire", "Corduroy", "Apple", "Red"])}
              </p>
            </div>
            {/* DETAILS SECTION */}
            <div className="w-full text-left mt-8">
              <p className="text-base font-semibold text-[#1d1c19]">Details</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1d1c19]">
                {PRODUCT.details.map((detail) => (
                  <li key={detail}>{formatText(detail, "Empire Corduroy Hat", ["Empire", "Corduroy", "Apple", "Red"])}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="mx-auto w-full max-w-100 px-6 text-center mt-5">
          <p className="px-1 text-[14px] leading-relaxed text-[#3d372f]">
            {formatText(PRODUCT.description, "Empire Corduroy Hat", ["Empire", "Corduroy", "Apple", "Red"])}
          </p>
        </div>

        {/* DETAILS SECTION */}
        <div className="mx-auto w-full max-w-100 px-6 text-left">
          <div className="mt-8">
            <p className="text-base font-semibold text-[#1d1c19]">Details</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1d1c19]">
              {PRODUCT.details.map((detail) => (
                <li key={detail}>{formatText(detail, "Empire Corduroy Hat", ["Empire", "Corduroy", "Apple", "Red"])}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE SECTION */}
        <div className="mx-auto w-full max-w-100 px-6 text-center">
          <div className="mt-12">
            <p className="text-[22px] font-black uppercase tracking-[0.32em] text-[#1d1c19]">
              You May Also Like
            </p>
            <div className="mt-6 grid w-full grid-cols-2 gap-x-5 gap-y-10 text-left">
              {boughtTogetherItems.map((product) => (
                  <Link
                    key={`${product.name}-${product.image}`}
                    href={`/shop/${product.id}`}
                    className="flex flex-col hover:shadow-lg transition-shadow rounded-lg"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#1d1c19] bg-white">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
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
        summaryLabel="APPLE RED CORDUROY"
        sizeOptions={sizeOptions}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
