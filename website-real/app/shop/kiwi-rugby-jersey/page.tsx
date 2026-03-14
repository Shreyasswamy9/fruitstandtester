"use client";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useCart } from "../../../components/CartContext";
import SizeGuide from "@/components/SizeGuide";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import ProductPurchaseBar, { PurchaseSizeOption, PurchaseColorOption } from "@/components/ProductPurchaseBar";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { useTrackProductView } from "@/hooks/useTrackProductView";

const PRODUCT = {
  name: "Kiwi Rugby Jersey",
  price: 125,
  description: "The color scheme draws from the silver fern, famous in New Zealand and synonymous with their rugby team. Knit from 100% cotton, these jerseys are the most comfortable statement pieces we have made to date. A vintage laced-neck collar makes for a one-of-a-kind look. With 12 gauge knitting, this jersey was made for both comfort and function.",
  details: [
    "100% Cotton",
    "12-gauge knitting",
    "Birdseye jacquard pattern",
    "1x1 rib knit cuffs and hem",
    "Vintage laced-neck collar",
    "Relaxed Fit",
    "Made in Dongguan, China",
    "Quality guaranteed, Free returns."
  ],
  longDescription: "The Kiwi Rugby Jersey pays homage to the triumphant New Zealand Rugby Team — famed for their international success, and known as the country's national sport. As a three-time world champion, New Zealand Rugby signifies success.",
};

type KiwiColorOption = {
  name: string;
  slug: string;
  color: string;
  images: string[];
  bg: string;
  border?: string;
};

const KIWI_COLOR_OPTIONS: KiwiColorOption[] = [
  { name: 'Default', slug: 'default', color: '#2d5016', images: ['/images/products/kiwi rugby jersey/Kiwi DS 1x1.png', '/images/products/kiwi rugby jersey/Kiwi 1.png', '/images/products/kiwi rugby jersey/Kiwi 2.png'], bg: '#f5f5f5', border: '#d4d4d4' },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

export default function KiwiRugbyJerseyPage() {
  const [selectedColor, setSelectedColor] = useState<KiwiColorOption>(KIWI_COLOR_OPTIONS[0]);
  const [selectedImage, setSelectedImage] = useState(KIWI_COLOR_OPTIONS[0].images[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useTrackProductView({
    productId: "4ffbb5f9-3e30-46d5-8d9b-8667d7e2b0da",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
    selectedVariant: {
      color: selectedColor.name,
      sku: selectedColor.slug,
    },
  });

  const handleSelectColor = useCallback((option: KiwiColorOption, ctx?: { image?: string }) => {
    setSelectedColor(option);
    setSelectedImage(prev => ctx?.image ?? option.images?.[0] ?? prev);
    setCurrentImageIndex(0);
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.split('?')[0];
      const query = option.slug ? `?color=${option.slug}` : '';
      window.history.replaceState(null, '', `${basePath}${query}`);
    }
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      productId: "4ffbb5f9-3e30-46d5-8d9b-8667d7e2b0da",
      name: PRODUCT.name,
      price: PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
      color: selectedColor.name,
    });
  };

  const sizeOptionsForBar: PurchaseSizeOption[] = useMemo(
    () => SIZE_OPTIONS.map((size) => ({ value: size, label: size })),
    []
  );

  const purchaseColorOptions: PurchaseColorOption[] = useMemo(
    () => KIWI_COLOR_OPTIONS.map((option) => ({
      value: option.slug,
      label: option.name,
      swatch: option.color,
    })),
    []
  );

  return (
    <div>
      <ProductPageBrandHeader />

      <main className="bg-[#fbf5ed] pb-[210px] pt-16 md:pt-20 lg:pt-24">
        <div className="mx-auto w-full max-w-[1280px] px-6 text-center lg:px-12 lg:text-left lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-14" style={{ minHeight: '75vh' }}>
          {/* IMAGE */}
          <div className="relative mx-auto aspect-[4/5] w-full lg:mx-0 lg:max-w-[620px] lg:row-span-3">
            <ProductImageGallery
              productName={PRODUCT.name}
              options={KIWI_COLOR_OPTIONS.map((variant) => ({
                name: variant.name,
                images: variant.images,
              }))}
              selectedOption={{
                name: selectedColor.name,
                images: selectedColor.images,
              } as ProductImageGalleryOption}
              selectedImage={selectedImage}
              onImageChange={(image) => {
                setSelectedImage(image);
                setCurrentImageIndex(selectedColor.images.indexOf(image));
              }}
              className="h-full w-full"
              frameBackground="transparent"
            />
          </div>

          {/* TITLE / PRICE */}
          <div className="mt-8 flex flex-col lg:col-start-2 lg:items-start lg:mt-6">
            <h1 className="text-[24px] uppercase tracking-[0.08em] leading-tight text-[#1d1c19] font-avenir-black">
              {PRODUCT.name}
            </h1>
            <p className="mt-2 text-[26px] font-black text-[#1d1c19]">Coming Soon</p>
            <div className="mt-4">
              <SizeGuide productSlug="rugby-jersey" />
            </div>

            {/* DESCRIPTION */}
            <p className="mt-6 text-sm leading-relaxed text-[#1d1c19] lg:max-w-sm">
              {PRODUCT.description}
            </p>

            {/* DETAILS */}
            <div className="mt-6 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1d1c19] mb-3">Details</p>
                <ul className="space-y-2 !text-left">
                  {PRODUCT.details.map((detail, idx) => (
                    <li key={idx} className="text-[11px] text-[#1d1c19] text-left !text-left !text-[11px]">● {detail}</li>
                  ))}
              </ul>
            </div>

            {/* SIZE GUIDE */}
          </div>
        </div>

        {/* LONG DESCRIPTION */}
        <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-12 py-16 border-t border-[#1d1c19]/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-[#1d1c19] mb-4">Heritage</h2>
              <p className="text-sm leading-relaxed text-[#1d1c19]">{PRODUCT.longDescription}</p>
            </div>
          </div>
        </section>

        {/* YOU MAY ALSO LIKE */}
        <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-12 py-16">
          <h2 className="text-[22px] font-black uppercase tracking-[0.32em] text-[#1d1c19] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {getFBTForPage("kiwi-rugby-jersey").map((product) => (
              <Link key={`${product.name}-${product.image}`} href={`/shop/${product.id}`} className="flex flex-col hover:shadow-lg transition-shadow rounded-lg">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#1d1c19] bg-white">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="200px" />
                </div>
                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.34em] text-[#1d1c19]">{product.name}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#1d1c19]">Coming Soon</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <ProductPurchaseBar
        price={PRODUCT.price}
        summaryLabel={selectedColor.name.toUpperCase()}
        sizeOptions={sizeOptionsForBar}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        colorOptions={purchaseColorOptions}
        selectedColor={selectedColor.slug}
        onSelectColor={(slug: string) => {
          const option = KIWI_COLOR_OPTIONS.find(o => o.slug === slug);
          if (option) handleSelectColor(option);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
