"use client";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import ProductImageGallery, { type ProductImageGalleryOption } from "@/components/ProductImageGallery";
import { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import { useCart } from "../../../components/CartContext";
import ProductPurchaseBar, { PurchaseSizeOption } from "@/components/ProductPurchaseBar";
import SizeGuide from "@/components/SizeGuide";
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

const wasabiImages = [
  "/images/products/Wasabi Tee/Wabasabi 1.png",
  "/images/products/Wasabi Tee/Wabasabi 2.png",
  "/images/products/Wasabi Tee/Wabsabi 3.png",
  "/images/products/Wasabi Tee/Wabsabi 4.png",
];

const PRODUCT = {
  name: "Wabisabi™ Scheffel Hall Pears Tee",
  price: 45,
  description: "100% Heavyweight Cotton. Custom cut and sewn fit. Designed in NYC and crafted in Portugal.\n\n***\n\nWe spent over a year and a half working researching, traveling and touring to source the best materials and people to work with. With this and future WABISABI designs, we look to feature motifs that study the effects of the passage of time in our City, culture and history.\n\nBuilt in 1895, Scheffel Hall remains an important part of the cultural and architectural history of the City. More can be read about here: http://s-media.nyc.gov/agencies/lpc/lp/1959.pdf\n\nThe WABISABI SCHEFFEL HALL PEARS T features an image we took of Scheffel Hall in December 2021, inside of our golden pear design.\n\nComes with uniquely made and universally loved hang tags. All of the hang tags were 100% made in NYC.\n\nYour purchase will arrive in a one of a kind, locally sourced sustainable burlap bag that features a custom Americana design.",
  details: [
    "100% Heavyweight Cotton",
    "Custom cut and sewn fit",
    "Designed in NYC and crafted in Portugal",
    "Includes NYC-made hang tags and sustainable burlap bag",
    "Image of Scheffel Hall (photo taken Dec 2021) inside our golden pear motif",
    "Quality guaranteed, Free returns."
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
};

export default function WasabiTeePage() {
  const [selectedImage, setSelectedImage] = useState(wasabiImages[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();

  useTrackProductView({
    productId: "51977ef7-ae8f-486f-9dd7-7620e3b6e70a",
    productName: PRODUCT.name,
    price: PRODUCT.price,
    currency: "USD",
  });

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      productId: "51977ef7-ae8f-486f-9dd7-7620e3b6e70a",
      name: PRODUCT.name,
      price: PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
    });
  };

  const boughtTogetherItems = getFBTForPage('wasabi-tee');

  const sizeOptions: PurchaseSizeOption[] = PRODUCT.sizes.map((size) => ({
    value: size,
    label: size,
  }));

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
                  images: wasabiImages,
                },
              ]}
              selectedOption={{
                name: "Default",
                images: wasabiImages,
              } as ProductImageGalleryOption}
              selectedImage={selectedImage}
              onImageChange={(image) => {
                setSelectedImage(image);
                setCurrentImageIndex(wasabiImages.indexOf(image));
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
                productSlug="wasabi-tee"
                imagePath="/images/size-guides/Size Guide/Wabasabi Tee Table.png"
                buttonLabel="SIZE GUIDE"
                className="text-[13px] font-semibold uppercase tracking-[0.34em]"
              />
            </div>
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="mx-auto w-full max-w-225 px-6 text-center lg:px-12 lg:text-left mt-5">
          <p className="px-1 text-[14px] leading-relaxed text-[#3d372f]">
            {formatText(PRODUCT.description, "Wabisabi™ Scheffel Hall Pears Tee", ["Wabisabi", "Scheffel", "Hall", "Pears", "Portugal"])}
          </p>
        </div>

        {/* DETAILS SECTION */}
        <div className="mx-auto w-full max-w-225 px-6 text-left lg:px-12">
          <div className="mt-8">
            <p className="text-base font-semibold text-[#1d1c19]">Details</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1d1c19]">
              {PRODUCT.details.map((detail) => (
                <li key={detail}>{formatText(detail, "Wabisabi™ Scheffel Hall Pears Tee", ["Wabisabi", "Scheffel", "Hall", "Pears", "Portugal"])}</li>
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
        summaryLabel="WABISABI™ SCHEFFEL HALL PEARS TEE"
        sizeOptions={sizeOptions}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
}
