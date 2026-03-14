"use client";
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { useCart } from "../../../components/CartContext";
import SizeGuide from "@/components/SizeGuide";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import { type ColorOption } from '@/components/ColorPicker';
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import ProductPurchaseBar, { PurchaseColorOption, PurchaseSizeOption } from "@/components/ProductPurchaseBar";
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

// Per-color image map for gallery display
const CAMEO_COLOR_IMAGE_MAP: Record<string, string[]> = {
  'broadway-noir': [
    '/images/products/cameo-tshirt/broadwaynoir/MN.png',
    '/images/products/cameo-tshirt/broadwaynoir/MN3.png',
    '/images/products/cameo-tshirt/broadwaynoir/MN4.png'
  ],
  'sutton-place-snow': [
    '/images/products/cameo-tshirt/suttonplacesnow/MN1.png',
    '/images/products/cameo-tshirt/suttonplacesnow/MN2.png',
    '/images/products/cameo-tshirt/suttonplacesnow/MN5.png'
  ]
};

type CameoColorOption = ColorOption & {
  images: string[];
  slug: keyof typeof CAMEO_COLOR_IMAGE_MAP;
};

const PRODUCT = {
  name: "Cameo Tee",
  price: 40,
  description: "Crafted from 100% organic cotton in Portugal, made in a relaxed fit. At 200 GSM, it’s heavy weight, soft, and breathable — designed for effortless everyday wear. The CAMEO Tee takes inspiration from our previous best sellers — Golden Delicious and Red Delicious — updated this time with a wider collar opening for more room at the neck and a relaxed, oversized silhouette.",
  details: [
    "100% organic cotton (200 GSM)",
    "Oversized, loose silhouette",
    "Breathable and soft for everyday wear",
    "Made in Portugal",
    "Ships with a custom  sticker printed in NYC",
    "Quality guaranteed, Free returns."
  ],
};

export default function CameoTshirtPage() {
  const colorOptions = useMemo<CameoColorOption[]>(() => [
    { name: 'Broadway Noir', slug: 'broadway-noir', color: '#000000', images: CAMEO_COLOR_IMAGE_MAP['broadway-noir'], bg: '#0a0a0a' },
    { name: 'Sutton Place Snow', slug: 'sutton-place-snow', color: '#ffffff', images: CAMEO_COLOR_IMAGE_MAP['sutton-place-snow'], bg: '#ffffff', border: '#e5e7eb' },
  ], []);
  const [selectedColor, setSelectedColor] = useState<CameoColorOption>(colorOptions[0]);
  const [selectedImage, setSelectedImage] = useState<string>(colorOptions[0].images[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useTrackProductView({
    productId: "1ad5fc4b-898d-4e86-ada6-c4787ba20add",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
    selectedVariant: {
      color: selectedColor.name,
      sku: selectedColor.slug,
    },
  });

  const handleSelectColor = useCallback((option: CameoColorOption, ctx?: { image?: string }) => {
    setSelectedColor(option);
    setSelectedImage(prev => ctx?.image ?? option.images?.[0] ?? prev);
    setCurrentImageIndex(0);
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.split('?')[0];
      const query = option.slug ? `?color=${option.slug}` : '';
      window.history.replaceState(null, '', `${basePath}${query}`);
    }
  }, []);
  
  // read from window.location in effect to avoid useSearchParams prerender/suspense issues

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      productId: "1ad5fc4b-898d-4e86-ada6-c4787ba20add",
      name: PRODUCT.name,
      price: PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
      color: selectedColor.name,
    });
  };

  // Preselect color from query param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const colorSlug = params.get('color');
    if (!colorSlug) return;
    const found = colorOptions.find(c => c.slug === colorSlug as CameoColorOption['slug']);
    if (found && found.slug !== selectedColor.slug) {
      handleSelectColor(found);
    }
  }, [colorOptions, handleSelectColor, selectedColor.slug]);

  const boughtTogetherItems = getFBTForPage('cameo-tshirt');

  const sizeOptions: PurchaseSizeOption[] = useMemo(
    () => ["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => ({ value: size, label: size })),
    []
  );

  const purchaseColorOptions: PurchaseColorOption[] = useMemo(
    () => colorOptions.map((option) => ({ value: option.slug, label: option.name, swatch: option.color, border: option.border })),
    [colorOptions]
  );

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
          <div className="mt-8 flex flex-col items-center lg:col-start-2 lg:items-start lg:mt-45">
            <h1 className="text-[24px] uppercase tracking-[0.08em] leading-tight text-[#1d1c19] font-avenir-black">
              {PRODUCT.name}
            </h1>
            <p className="mt-1 text-[18px] text-[#1d1c19] font-avenir-light">
              {selectedColor.name.toUpperCase()}
            </p>

            <p className="mt-2 text-[26px] font-black text-gray-400">—</p>
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
                      border: option.border ? `1px solid ${option.border}` : undefined,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* SIZE GUIDE */}
          <div className="mt-2 text-[13px] font-semibold uppercase tracking-[0.34em] text-[#1d1c19] lg:col-start-2 lg:text-left">
            <SizeGuide
              productSlug="cameo-tshirt"
              imagePath="/images/size-guides/Size Guide/Cameo Table.png"
              buttonLabel="SIZE GUIDE"
              className="text-[13px] font-semibold uppercase tracking-[0.34em]"
            />
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="mx-auto w-full max-w-225 px-6 text-center lg:px-12 lg:text-left mt-5">
          <p className="px-1 text-[14px] leading-relaxed text-[#3d372f]">
            {formatText(PRODUCT.description, "Cameo Tee", ["Cameo", "Portugal"])}
          </p>
        </div>

        {/* DETAILS SECTION */}
        <div className="mx-auto w-full max-w-[900px] px-6 text-left lg:px-12">
          <div className="mt-8">
            <p className="text-base font-semibold text-[#1d1c19]">Details</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1d1c19]">
              {PRODUCT.details.map((detail) => (
                <li key={detail}>{formatText(detail, "Cameo Tee", ["Cameo", "Portugal"])}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE SECTION */}
        <div className="mx-auto w-full max-w-[1200px] px-6 text-center lg:px-12">
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
        summaryLabel={selectedColor.name.toUpperCase()}
        sizeOptions={sizeOptions}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        colorOptions={purchaseColorOptions}
        selectedColor={selectedColor.slug}
        onSelectColor={(value) => {
          const next = colorOptions.find((option) => option.slug === value as CameoColorOption['slug']);
          if (next) {
            handleSelectColor(next);
          }
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
