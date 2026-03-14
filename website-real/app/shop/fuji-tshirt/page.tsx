"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { useCart } from "../../../components/CartContext";
import SizeGuide from "@/components/SizeGuide";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import ProductPurchaseBar, { PurchaseColorOption, PurchaseSizeOption } from "@/components/ProductPurchaseBar";
import StPatsBanner, { StPatsNudge } from "@/components/StPatsBanner";
import { isGreenColorOnSale, getStPatsPrice, isStPatsDayActive } from "@/lib/stPatricksDay";
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

// Fuji Long Sleeve color image map (multiple images per color for gallery)
// Slugs: arboretum, hudson-blue, redbird, broadway-noir
type FujiColorSlug = 'arboretum' | 'hudson-blue' | 'redbird' | 'broadway-noir';

const FUJI_COLOR_IMAGE_MAP: Record<FujiColorSlug, string[]> = {
  'arboretum': [
    '/images/products/fuji-tshirt/Arboretum/F2.png',
    '/images/products/fuji-tshirt/Arboretum/F11.png',
    '/images/products/fuji-tshirt/Arboretum/F12.png'
  ],
  'hudson-blue': [
    '/images/products/fuji-tshirt/Hudson blue/F1.png',
    '/images/products/fuji-tshirt/Hudson blue/F9.png',
    '/images/products/fuji-tshirt/Hudson blue/F10.png'
  ],
  'redbird': [
    '/images/products/fuji-tshirt/Redbird/F4.png',
    '/images/products/fuji-tshirt/Redbird/F5.png',
    '/images/products/fuji-tshirt/Redbird/F6.png'
  ],
  'broadway-noir': [
    '/images/products/fuji-tshirt/Broadwaynoir/F3.png',
    '/images/products/fuji-tshirt/Broadwaynoir/F7.png',
    '/images/products/fuji-tshirt/Broadwaynoir/F8.png'
  ]
};

const isFujiColorSlug = (value: string): value is FujiColorSlug =>
  Object.prototype.hasOwnProperty.call(FUJI_COLOR_IMAGE_MAP, value);

type FujiColorOption = {
  name: string;
  slug: FujiColorSlug;
  color: string;
  images: string[];
  bg?: string;
  border?: string;
};

const PRODUCT = {
  name: "Fuji Long Sleeve",
  price: 80,
  description:
    "Crafted from 100% organic cotton in Portugal, made in a relaxed fit. At 250 GSM, it’s heavy weight, soft, and breathable — designed for effortless everyday wear.",
  details: [
    "100% organic cotton (160 GSM)",
    "Oversized, loose silhouette",
    "Breathable and soft for everyday wear",
    "Made in Portugal",
    "Ships with a custom  sticker printed in NYC",
    "Quality guaranteed, Free returns."
  ],
};

export default function FujiTshirtPage() {
  const colorOptions = useMemo<FujiColorOption[]>(() => [
    { name: 'Arboretum', slug: 'arboretum', color: '#0f5132', images: FUJI_COLOR_IMAGE_MAP['arboretum'], bg: '#e6f3ec', border: '#b6d9c6' },
    { name: 'Hudson Blue', slug: 'hudson-blue', color: '#243b5a', images: FUJI_COLOR_IMAGE_MAP['hudson-blue'], bg: '#e5edf6', border: '#c2d2e6' },
    { name: 'Redbird', slug: 'redbird', color: '#c21010', images: FUJI_COLOR_IMAGE_MAP['redbird'], bg: '#fceaea', border: '#f4bcbc' },
    { name: 'Broadway Noir', slug: 'broadway-noir', color: '#000000', images: FUJI_COLOR_IMAGE_MAP['broadway-noir'], bg: '#ededed', border: '#d4d4d4' },
  ], []);
  const [selectedColor, setSelectedColor] = useState<FujiColorOption>(colorOptions[0]);
  const [selectedImage, setSelectedImage] = useState<string>(colorOptions[0].images[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useTrackProductView({
    productId: "1dcbfbda-626c-49fb-858e-c50050b4b726",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
    selectedVariant: {
      color: selectedColor.name,
      sku: selectedColor.slug,
    },
  });

  const updateUrlForColor = useCallback((slug?: string) => {
    if (typeof window === 'undefined') return;
    const basePath = window.location.pathname.split('?')[0];
    const query = slug ? `?color=${slug}` : '';
    window.history.replaceState(null, '', `${basePath}${query}`);
  }, []);

  const handleSelectColor = useCallback((option: FujiColorOption, ctx?: { image?: string }) => {
    setSelectedColor(option);
    setSelectedImage(prev => ctx?.image ?? option.images?.[0] ?? prev);
    setCurrentImageIndex(0);
    updateUrlForColor(option.slug);
  }, [updateUrlForColor]);
  
  // useSearchParams can cause build-time suspense issues; read from window.location in an effect instead

  const stPatsSalePrice = getStPatsPrice("fuji-tshirt", PRODUCT.price, selectedColor.slug);
  const isOnStPats = isGreenColorOnSale("fuji-tshirt", selectedColor.slug);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      productId: "1dcbfbda-626c-49fb-858e-c50050b4b726",
      name: PRODUCT.name,
      price: isOnStPats ? stPatsSalePrice : PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
      color: selectedColor.name,
    });
  };

  // Preselect variant via query param (?color=slug)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const colorSlugParam = params.get('color');
    if (!colorSlugParam || !isFujiColorSlug(colorSlugParam)) return;
    const colorSlug = colorSlugParam;
    const found = colorOptions.find(c => c.slug === colorSlug);
    if (found && found.slug !== selectedColor.slug) {
      handleSelectColor(found);
    }
  }, [colorOptions, handleSelectColor, selectedColor.slug]);

  const boughtTogetherItems = getFBTForPage('fuji-tshirt');

  const sizeOptions: PurchaseSizeOption[] = useMemo(
    () => ["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => ({ value: size, label: size })),
    []
  );

  const purchaseColorOptions: PurchaseColorOption[] = useMemo(
    () => colorOptions.map((option) => ({ value: option.slug, label: option.name, swatch: option.color })),
    [colorOptions]
  );

  

  return (
    <div>
      <ProductPageBrandHeader />

      <main className="bg-[#fbf5ed] pb-52.5 pt-16 md:pt-20 lg:pt-24">
        {/* HERO SECTION - Top 75% */}
        <div className="mx-auto w-full max-w-300 px-6 text-center lg:px-12 lg:text-left lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-12" style={{ minHeight: '75vh' }}>
          {/* IMAGE */}
          <div className="relative mx-auto aspect-4/5 w-full lg:mx-0 lg:max-w-130 lg:row-span-3">
            <ProductImageGallery
              productName={PRODUCT.name}
              options={colorOptions.map((color) => ({
                name: color.name,
                images: color.images,
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

          {/* TITLE / PRICE - Single Line */}
          <div className="mt-8 flex flex-col items-center lg:col-start-2 lg:items-start lg:mt-6">
            <h1 className="text-[24px] uppercase tracking-[0.08em] leading-tight text-[#1d1c19] font-avenir-black">
              {PRODUCT.name}
            </h1>
            <p className="mt-1 text-[18px] text-[#1d1c19] font-avenir-light">
              {selectedColor.name.toUpperCase()}
            </p>

            {isOnStPats ? (
              <>
                <p className="mt-2 text-[26px] font-black text-[#1d1c19] line-through opacity-40">Coming Soon</p>
                <p className="text-[26px] font-black text-[#2e8b2e]">Coming Soon</p>
              </>
            ) : (
              <p className="mt-2 text-[26px] font-black text-[#1d1c19]">Coming Soon</p>
            )}
            {isOnStPats && (
              <StPatsBanner colorName={selectedColor.name} />
            )}
            {!isOnStPats && isStPatsDayActive() && (
              <StPatsNudge colorName="Arboretum" salePrice={getStPatsPrice("fuji-tshirt", PRODUCT.price, "arboretum")} />
            )}
          </div>

          {/* SWATCHES */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:col-start-2 lg:justify-start">
            {colorOptions.map((option) => {
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
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* SIZE GUIDE */}
          <div className="mt-2 text-[13px] font-semibold uppercase tracking-[0.34em] text-[#1d1c19] lg:col-start-2 lg:text-left">
            <SizeGuide
              productSlug="fuji-tshirt"
              imagePath="/images/size-guides/Size Guide/Fuji Table.png"
              buttonLabel="SIZE GUIDE"
              className="text-[13px] font-semibold uppercase tracking-[0.34em]"
            />
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="mx-auto w-full max-w-225 px-6 text-center lg:px-12 lg:text-left mt-5">
          <p className="px-1 text-[14px] leading-relaxed text-[#3d372f]">
            {formatText(PRODUCT.description, "Fuji Long Sleeve", ["Fuji", "Portugal"])}
          </p>
        </div>

        {/* DETAILS SECTION */}
        <div className="mx-auto w-full max-w-225 px-6 text-left lg:px-12">
          <div className="mt-8">
            <p className="text-base font-semibold text-[#1d1c19]">Details</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1d1c19]">
              {PRODUCT.details.map((detail) => (
                <li key={detail}>{formatText(detail, "Fuji Long Sleeve", ["Fuji", "Portugal"])}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE SECTION */}
        <div className="mx-auto w-full max-w-300 px-6 text-center lg:px-12">
          <div className="mt-12">
            <p className="text-[22px] font-black uppercase tracking-[0.32em] text-[#1d1c19]">
              You May Also Like
            </p>
            <div className="mt-6 grid w-full grid-cols-2 gap-x-5 gap-y-10 text-left sm:grid-cols-3 lg:grid-cols-4">
              {boughtTogetherItems.map((product) => (
                <Link
                  key={`${product.name}-${product.image}`}
                  href={`/shop/${product.id}`}
                  className="flex flex-col hover:shadow-lg transition-shadow rounded-lg"
                  style={{ textDecoration: 'none' }}
                >
                    <div className="relative aspect-4/5 w-full overflow-hidden border border-[#1d1c19] bg-white">
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
        price={isOnStPats ? stPatsSalePrice : PRODUCT.price}
        summaryLabel={selectedColor.name.toUpperCase()}
        sizeOptions={sizeOptions}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        colorOptions={purchaseColorOptions}
        selectedColor={selectedColor.slug}
        onSelectColor={(value) => {
          const next = colorOptions.find((option) => option.slug === value as FujiColorSlug);
          if (next) {
            handleSelectColor(next);
          }
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
