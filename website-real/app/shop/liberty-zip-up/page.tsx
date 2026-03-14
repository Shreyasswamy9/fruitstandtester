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
import StPatsBanner, { StPatsNudge } from "@/components/StPatsBanner";
import { isGreenColorOnSale, getStPatsPrice, isStPatsDayActive } from "@/lib/stPatricksDay";

const PRODUCT = {
  name: "Liberty Zip-Up",
  price: 110,
  description: "The zip-up is part of our effort to introduce true staples into  — pieces we can wear all day in the workshop and still feel right stepping outside. We wanted something ultra-comfortable, heavyweight, and a go-to piece year-round.",
  details: [
    "100% Cotton",
    "Garment washed fabric",
    "Full-zip front",
    "Terry cloth interior",
    "Ribbed cuffs and hem",
    "Two front pockets",
    "Relaxed Fit",
    "Made in Guangdong, China",
    "Quality guaranteed, Free returns."
  ],
  longDescription: "Sewn from 100% cotton at 420 gsm and built for all-day wear while a custom wash process ensures every piece is unique. The construction makes it easy to layer and adjust throughout the day. It's a piece designed to work with everything — and work for you.",
};

type LibertyZipColorOption = {
  name: string;
  slug: string;
  color: string;
  images: string[];
  bg: string;
  border?: string;
};

const LIBERTY_ZIP_COLOR_OPTIONS: LibertyZipColorOption[] = [
  { name: 'Onyx', slug: 'onyx', color: '#1a1a1a', images: ['/images/products/liberty zip ups/onyx/Onyx Zip-up DS 1x1.png', '/images/products/liberty zip ups/onyx/Onyx Zip 1.png', '/images/products/liberty zip ups/onyx/Onyx Zip 2.png'], bg: '#f5f5f5', border: '#d4d4d4' },
  { name: 'Moss', slug: 'moss', color: '#556b2f', images: ['/images/products/liberty zip ups/moss/Moss DS 1x1.png', '/images/products/liberty zip ups/moss/Moss Zip 1.png', '/images/products/liberty zip ups/moss/Moss Zip 2.png'], bg: '#f5f5f5', border: '#d4d4d4' },
  { name: 'Copper', slug: 'copper', color: '#b87333', images: ['/images/products/liberty zip ups/copper/Copper DS 1x1.png', '/images/products/liberty zip ups/copper/Copper Zip 1.png', '/images/products/liberty zip ups/copper/Copper Zip 2.png'], bg: '#f5f5f5', border: '#d4d4d4' },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

export default function LibertyZipUpPage() {
  const [selectedColor, setSelectedColor] = useState<LibertyZipColorOption>(LIBERTY_ZIP_COLOR_OPTIONS[0]);
  const [selectedImage, setSelectedImage] = useState(LIBERTY_ZIP_COLOR_OPTIONS[0].images[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useTrackProductView({
    productId: "b544f080-b1b5-4dab-8e51-4208b456f73c",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
    selectedVariant: {
      color: selectedColor.name,
      sku: selectedColor.slug,
    },
  });

  const handleSelectColor = useCallback((option: LibertyZipColorOption, ctx?: { image?: string }) => {
    setSelectedColor(option);
    setSelectedImage(prev => ctx?.image ?? option.images?.[0] ?? prev);
    setCurrentImageIndex(0);
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.split('?')[0];
      const query = option.slug ? `?color=${option.slug}` : '';
      window.history.replaceState(null, '', `${basePath}${query}`);
    }
  }, []);

  // Preselect variant via query param (?color=slug) — done at runtime only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const colorSlug = params.get('color');
    if (!colorSlug) return;
    const found = LIBERTY_ZIP_COLOR_OPTIONS.find(c => c.slug === colorSlug);
    if (found && found.slug !== selectedColor.slug) {
      handleSelectColor(found);
    }
  }, [handleSelectColor, selectedColor.slug]);

  const stPatsSalePrice = getStPatsPrice("liberty-zip-up", PRODUCT.price, selectedColor.slug);
  const isOnStPats = isGreenColorOnSale("liberty-zip-up", selectedColor.slug);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      productId: "b544f080-b1b5-4dab-8e51-4208b456f73c",
      name: PRODUCT.name,
      price: isOnStPats ? stPatsSalePrice : PRODUCT.price,
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
    () => LIBERTY_ZIP_COLOR_OPTIONS.map((option) => ({
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
              options={LIBERTY_ZIP_COLOR_OPTIONS.map((variant) => ({
                name: variant.name,
                slug: variant.slug,
                images: variant.images,
              }))}
              selectedOption={{
                name: selectedColor.name,
                slug: selectedColor.slug,
                images: selectedColor.images,
              } as ProductImageGalleryOption}
              selectedImage={selectedImage}
              onOptionChange={(option, ctx) => {
                const match = LIBERTY_ZIP_COLOR_OPTIONS.find(
                  (variant) => variant.slug === option.slug || variant.name === option.name
                );
                if (match) {
                  handleSelectColor(match, ctx);
                }
              }}
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
            <p className="mt-1 text-[18px] text-[#1d1c19] font-avenir-light">
              {selectedColor.name.toUpperCase()}
            </p>
            <p className="mt-2 text-[26px] font-black text-gray-400">—</p>
            {isOnStPats && (
              <StPatsBanner colorName={selectedColor.name} />
            )}
            {!isOnStPats && isStPatsDayActive() && (
              <StPatsNudge colorName="Moss" salePrice={getStPatsPrice("liberty-zip-up", PRODUCT.price, "moss")} />
            )}
            <div className="mt-4">
              <SizeGuide productSlug="liberty-hoodie" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {LIBERTY_ZIP_COLOR_OPTIONS.map((option) => {
                const isActive = option.slug === selectedColor.slug;

                return (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => handleSelectColor(option)}
                    aria-label={option.name}
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
                        backgroundColor: option.color,
                        border: option.border ? `1px solid ${option.border}` : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* DESCRIPTION */}
            <p className="mt-6 text-sm leading-relaxed text-[#1d1c19] lg:max-w-sm">
              {PRODUCT.description}
            </p>

            {/* DETAILS */}
            <div className="mt-6 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1d1c19] mb-3">Details</p>
                <ul className="space-y-2 text-left">
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
              <h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-[#1d1c19] mb-4">About</h2>
              <p className="text-sm leading-relaxed text-[#1d1c19]">{PRODUCT.longDescription}</p>
            </div>
          </div>
        </section>

        {/* YOU MAY ALSO LIKE */}
        <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-12 py-16">
          <h2 className="text-[22px] font-black uppercase tracking-[0.32em] text-[#1d1c19] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {getFBTForPage("liberty-zip-up").map((product) => (
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
        price={isOnStPats ? stPatsSalePrice : PRODUCT.price}
        summaryLabel={selectedColor.name.toUpperCase()}
        sizeOptions={sizeOptionsForBar}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        colorOptions={purchaseColorOptions}
        selectedColor={selectedColor.slug}
        onSelectColor={(slug: string) => {
          const option = LIBERTY_ZIP_COLOR_OPTIONS.find(o => o.slug === slug);
          if (option) handleSelectColor(option);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
