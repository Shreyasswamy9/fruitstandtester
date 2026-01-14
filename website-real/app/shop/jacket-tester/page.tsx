"use client";

import Image from "next/image";
import React, { useState } from "react";
import SizeGuide from "@/components/SizeGuide";
import CustomerReviews from "@/components/CustomerReviews";
import FrequentlyBoughtTogether, { getFBTForPage } from "@/components/FrequentlyBoughtTogether";
import Price from "@/components/Price";
import { useRouter } from "next/navigation";
import { useCart } from "../../../components/CartContext";

const jacketTesterImages = [
  "/images/products/Track Top/Greenpoint Patina Crew/J1.png",
  "/images/products/Track Top/VICE CITY RUNNERS/J3.png",
];

const PRODUCT = {
  name: "Jacket Tester",
  price: 150,
  description:
    "A lightweight test jacket built from our production fabrics so we can dial in fit, trim, and finishing before a full run. Same hand-feel as the Retro Track Jacket, but in an early sample make.",
  details: [
    "100% Nylon shell with mesh lining",
    "Mock neck with tonal zipper",
    "Adjustable elastic hem",
    "Two welt pockets",
    "Made in Sialkot, Pakistan",
  ],
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function JacketTesterPage() {
  const [selectedImage, setSelectedImage] = useState(jacketTesterImages[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart, items } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      productId: "jacket-tester",
      name: PRODUCT.name,
      price: PRODUCT.price,
      image: selectedImage,
      quantity: 1,
      size: selectedSize,
    });
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1500);
  };

  const boughtTogetherItems = getFBTForPage("jacket-tester");
  const taskbarHeight = items.length > 0 && !showPopup ? 64 : 0;

  return (
    <div>
      <span
        onClick={() => {
          try {
            router.back();
          } catch (err) {
            window.history.back();
          }
        }}
        style={{
          position: "fixed",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 16,
          color: "#232323",
          cursor: "pointer",
          fontWeight: 500,
          zIndex: 10005,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #e0e0e0",
          borderRadius: "20px",
          padding: "8px 16px",
          textDecoration: "none",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
          pointerEvents: "auto",
        }}
      >
        ← Go Back
      </span>
      <div
        className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto py-12 px-4"
        style={{ paddingTop: 120, paddingBottom: taskbarHeight }}
      >
        <div className="flex w-full md:w-1/2 flex-col items-center gap-4">
          <div className="relative w-full max-w-sm md:max-w-full aspect-square rounded-xl overflow-hidden shadow-sm" style={{ background: "#f7f6f2" }}>
            <Image
              src={selectedImage}
              alt={PRODUCT.name}
              fill
              sizes="(max-width: 768px) 90vw, 420px"
              style={{ objectFit: "contain", background: "#f7f6f2" }}
              priority
            />
          </div>
          <div className="flex gap-2 mt-4">
            {jacketTesterImages.map((img) => (
              <button
                key={img}
                onClick={() => setSelectedImage(img)}
                style={{
                  border: selectedImage === img ? "2px solid #232323" : "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: 0,
                  background: "none",
                  outline: "none",
                  cursor: "pointer",
                }}
                aria-label="Select product image"
              >
                <Image src={img} alt={PRODUCT.name} width={56} height={56} style={{ objectFit: "cover", borderRadius: 8 }} />
              </button>
            ))}
          </div>
        </div>
        <div className="md:w-1/2 flex flex-col justify-start">
          <h1 className="text-3xl font-bold mb-2">{PRODUCT.name}</h1>
          <p className="text-lg text-gray-700 mb-4">{PRODUCT.description}</p>
          <div style={{ marginBottom: 18 }}>
            <p className="text-sm font-medium text-gray-700 mb-3">Size:</p>
            <div className="size-single-line">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  className={`size-button px-3 rounded-lg font-semibold border-2 transition-all ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-black hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedSize(size)}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <SizeGuide productSlug="track-top" imagePath="/images/size-guides/Size Guide/Track Jacket.png" />
            </div>
          </div>
          {PRODUCT.details && (
            <div className="mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Details</span>
              <ul className="mt-2 list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                {PRODUCT.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-2xl font-semibold mb-6">
            <Price price={PRODUCT.price} />
          </div>
          <button
            className={`bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 mb-2 ${
              !selectedSize ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleAddToCart}
            disabled={!selectedSize}
          >
            {!selectedSize ? "Pick a size to add to cart" : "Add to Cart"}
          </button>
        </div>
      </div>

      <FrequentlyBoughtTogether
        products={boughtTogetherItems}
        onAddToCart={(item) => {
          addToCart({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            size: selectedSize || "M",
          });
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 1500);
        }}
        onAddAllToCart={(itemsToAdd) => {
          itemsToAdd.forEach((item) => {
            addToCart({
              productId: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: 1,
              size: selectedSize || "M",
            });
          });
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 1500);
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fbf6f0",
        }}
        className="py-12 px-4"
      >
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-center mb-8">Customer Reviews</h2>
          <CustomerReviews productId="jacket-tester" />
        </div>
      </div>

      {items.length > 0 && !showPopup && (
        <div
          className="fixed left-0 right-0 bottom-0 z-50 bg-black text-white px-2 py-3 md:px-4 md:py-4 flex items-center justify-between"
          style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)", borderBottom: "none" }}
        >
          <span className="font-medium text-sm md:text-base">Cart</span>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="inline-block bg-white text-black rounded px-2 py-1 md:px-3 font-bold text-sm md:text-base">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
            <a
              href="/cart"
              className="ml-1 md:ml-2 px-3 py-2 md:px-4 md:py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 text-xs md:text-base"
              style={{ textDecoration: "none" }}
            >
              Head to Cart
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
