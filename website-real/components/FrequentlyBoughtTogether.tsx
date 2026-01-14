"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Price from './Price';

export interface FBTProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface FrequentlyBoughtTogetherProps {
  products: FBTProduct[];
  onAddToCart?: (product: FBTProduct) => void;
  onAddAllToCart?: (products: FBTProduct[]) => void;
}

const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({ products, onAddToCart, onAddAllToCart }) => {
  return (
    <div style={{ scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', background: '#fbf6f0' }} className="py-12 px-4">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Bought Together</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <Link href={`/shop/${item.id}`} className="relative w-full h-48 mb-4 rounded-lg overflow-hidden block">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </Link>
              <h3 className="text-xl font-semibold mb-2">
                <Link href={`/shop/${item.id}`} className="hover:underline">{item.name}</Link>
              </h3>
              <div className="text-lg font-bold text-gray-800 mb-4">
                <Price price={item.price} />
              </div>
              <button
                className="w-full bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                onClick={() => onAddToCart && onAddToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            onClick={() => onAddAllToCart && onAddAllToCart(products)}
          >
            Add All to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;

// --- Centralized FBT data and helper (moved from components/fbt-products.ts) ---
export const defaultFBT: FBTProduct[] = [
  { id: 'gala-tshirt', name: 'Gala Tee', price: 40, image: '/images/products/gala-tshirt/broadwaynoir/GN4.png' },
  { id: 'wasabi-tee', name: 'Wabisabi™ Scheffel Hall Pears Tee', price: 45, image: '/images/products/Wasabi Tee/Wabasabi 1.png' },
  { id: 'forest-hills-hat', name: 'Forest Hills Hat', price: 46, image: '/images/products/Forest Hills Hat/G1.png' },
];

export const FBT_BY_PAGE: Record<string, FBTProduct[]> = {
  'forest-hills-hat': [
    { id: 'gala-tshirt', name: 'Gala Tee', price: 40, image: '/images/products/gala-tshirt/broadwaynoir/GN4.png' },
    { id: 'porcelain-hat', name: 'Porcelain FS Cap', price: 44, image: '/images/products/Porcelain Hat/FS2.png' },
    { id: 'wasabi-tee', name: 'Wabisabi™ Scheffel Hall Pears Tee', price: 45, image: '/images/products/Wasabi Tee/Wabasabi 1.png' },
  ],

  'track-pants': [
    { id: 'retro-tracksuit', name: 'Retro Track Suit', price: 165, image: '/images/products/tracksuits/ELMHURST TARO CUSTARD/TP.png' },
    { id: 'forest-hills-hat', name: 'Forest Hills Hat', price: 46, image: '/images/products/Forest Hills Hat/G1.png' },
    { id: 'gala-tshirt', name: 'Gala Tee', price: 40, image: '/images/products/gala-tshirt/broadwaynoir/GN4.png' },
  ],

  'track-top': [
    { id: 'retro-tracksuit', name: 'Retro Track Suit', price: 165, image: '/images/products/tracksuits/ELMHURST TARO CUSTARD/TP.png' },
    { id: 'porcelain-hat', name: 'Porcelain FS Cap', price: 44, image: '/images/products/Porcelain Hat/FS2.png' },
    { id: 'first-edition-tee', name: 'First Edition Tee', price: 45, image: '/images/products/First Edition Tee/FE1.png' },
  ],

  'jacket-tester': [
    { id: 'track-pants', name: 'Retro Track Pants', price: 90, image: '/images/products/Track Pants/ELMHURST TARO CUSTARD/P6.png' },
    { id: 'forest-hills-hat', name: 'Forest Hills Hat', price: 46, image: '/images/products/Forest Hills Hat/G1.png' },
    { id: 'gala-tshirt', name: 'Gala Tee', price: 40, image: '/images/products/gala-tshirt/broadwaynoir/GN4.png' },
  ],
};

export function getFBTForPage(slug?: string): FBTProduct[] {
  if (!slug) return defaultFBT;
  return FBT_BY_PAGE[slug] || defaultFBT;
}
