"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Price from './Price'
import { isStPatsDayActive } from "@/lib/stPatricksDay"
import { useSurveyMode } from "@/hooks/useSurveyMode";

export interface Product {
  id: number;
  name: string;
  price: string;
  salePrice?: number | string;
  image: string;
  hoverImage?: string;
  category?: string;
  variantColor?: string; // For tee color variants or promotional copy
  variantSlug?: string; // slugified color for query param preselection
  isBundle?: boolean;
  bundleId?: string | null;
  displayPrice?: string;
  badgeLabel?: string;
  stPatsBadge?: boolean; // marks this card as a St. Patrick's Day green deal
  stPatsOriginalPrice?: number; // original numeric price for discount calc
}

// Editable product list for the homepage grid
export const products: Product[] = [
  // NEW ITEMS - Featured First
  // Kiwi Rugby Jersey
    { id: 2, name: "Kiwi Rugby Jersey", price: "$125", image: "/images/products/kiwi rugby jersey/Kiwi DS 1x1.png", hoverImage: "/images/products/kiwi rugby jersey/Kiwi 2.png", category: "Jerseys", variantSlug: "kiwi-rugby-jersey", badgeLabel: "NEW" },
  // Liberty Zip-Up
  { id: 3, name: "Liberty Zip-Up", price: "$110", image: "/images/products/liberty zip ups/copper/Copper DS 1x1.png", hoverImage: "/images/products/liberty zip ups/copper/Copper Zip 1.png", category: "Tops", variantSlug: "liberty-zip-up", badgeLabel: "NEW" },
  { id: 31, name: "Liberty Zip-Up", price: "$110", image: "/images/products/liberty zip ups/moss/Moss DS 1x1.png", hoverImage: "/images/products/liberty zip ups/moss/Moss Zip 1.png", category: "Tops", variantColor: "Moss", variantSlug: "moss", stPatsBadge: true, stPatsOriginalPrice: 110 },
  // Liberty Hoodie
  { id: 4, name: "Liberty Hoodie", price: "$110", image: "/images/products/liberty hoodies/mauve/Mauve DS 1x1.png", hoverImage: "/images/products/liberty hoodies/mauve/Mauve Hoodie 1 copy.png", category: "Tops", variantSlug: "liberty-hoodie", badgeLabel: "NEW" },
  // Jozi Rugby Jersey
  { id: 5, name: "Jozi Rugby Jersey", price: "$125", image: "/images/products/jozi rugby jersey/Jozi DS 1x1.png", hoverImage: "/images/products/jozi rugby jersey/Jozi 1.png", category: "Jerseys", variantSlug: "jozi-rugby-jersey", badgeLabel: "NEW", stPatsBadge: true, stPatsOriginalPrice: 125 },
  // Stamped Waffle Knit
  { id: 1081, name: "Stamped Waffle Knit", price: "$65", image: "/images/products/waffle knit/Stamped Waffle Knit 1.png", hoverImage: "/images/products/waffle knit/Stamped Waffle Knit 2.png", category: "Tops", variantSlug: "stamped-waffle-knit", badgeLabel: "NEW" },
  // Retro Track Suit Collection (spotlight second)
  { id: 2001, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TP.png", hoverImage: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TS7.png", category: "Tracksuits", variantColor: "Elmhurst Taro Custard", variantSlug: "elmhurst-taro-custard" },
  { id: 2002, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/Greenpoint Patina Crew/GB.png", hoverImage: "/images/products/tracksuits/Greenpoint Patina Crew/TS2.png", category: "Tracksuits", variantColor: "Greenpoint Patina Crew", variantSlug: "greenpoint-patina-crew", stPatsBadge: true, stPatsOriginalPrice: 165 },
  { id: 2003, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/NOHO NAPOLETANOS/TB.png", hoverImage: "/images/products/tracksuits/NOHO NAPOLETANOS/TS3.png", category: "Tracksuits", variantColor: "Noho Napoletanos", variantSlug: "noho-napoletanos" },
  { id: 2004, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/THE FACTORY FLOOR/BG.png", hoverImage: "/images/products/tracksuits/THE FACTORY FLOOR/TS4.png", category: "Tracksuits", variantColor: "The Factory Floor", variantSlug: "the-factory-floor" },
  { id: 2005, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/VICE CITY RUNNERS/PB.png", hoverImage: "/images/products/tracksuits/VICE CITY RUNNERS/TS5.png", category: "Tracksuits", variantColor: "Vice City Runners", variantSlug: "vice-city-runners" },
  { id: 2006, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/Victory Liberty Club/RB.png", hoverImage: "/images/products/tracksuits/Victory Liberty Club/TS6.png", category: "Tracksuits", variantColor: "Victory Liberty Club", variantSlug: "victory-liberty-club" },
  { id: 2007, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/BW.png", hoverImage: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/TS1.png", category: "Tracksuits", variantColor: "Yorkville Black and White Cookies", variantSlug: "yorkville-black-and-white-cookies" },
  // Broadway Blueberry Jersey (merch slot before tees)
  { id: 1, name: "Broadway Blueberry Jersey", price: "$180", image: "/images/products/hockey Jersey/JN.png", hoverImage: "/images/products/hockey Jersey/JN1.png", category: "Jerseys", variantColor: "Black Ice", variantSlug: "hockey-jersey" },
  {
    id: 9001,
    name: " Tee Bundle",
    price: "$125",
    displayPrice: "$106.25 bundle",
    image: "/images/products/Teebundle/Five T-Shirts.png",
    hoverImage: "/images/products/Teebundle/Five T-Shirts.png",
    category: "Tops",
    variantColor: "Curated trio · Save 15%",
    isBundle: true,
    bundleId: "tshirt-bundle",
    badgeLabel: "Bundle",
  },
  // New Tee lineup
  // Gala Tee – each color variant surfaced individually
  { id: 1011, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/broadwaynoir/GN4.png", hoverImage: "/images/products/gala-tshirt/broadwaynoir/GN5.png", category: "Tops", variantColor: "Broadway Noir", variantSlug: "broadway-noir" },
  { id: 1012, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/suttonplacesnow/GN6.png", hoverImage: "/images/products/gala-tshirt/suttonplacesnow/GN11.png", category: "Tops", variantColor: "Sutton Place Snow", variantSlug: "sutton-place-snow" },
  { id: 1013, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/Grasshopper/GN3.png", hoverImage: "/images/products/gala-tshirt/Grasshopper/GN8.png", category: "Tops", variantColor: "Grasshopper", variantSlug: "grasshopper", stPatsBadge: true, stPatsOriginalPrice: 40 },
  { id: 1014, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/frostedlemonade/GN10.png", hoverImage: "/images/products/gala-tshirt/frostedlemonade/GN9.png", category: "Tops", variantColor: "Frosted Lemonade", variantSlug: "frosted-lemonade" },
  { id: 1015, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/italianice/GN1.png", hoverImage: "/images/products/gala-tshirt/italianice/GN2.png", category: "Tops", variantColor: "Italian Ice", variantSlug: "italian-ice" },
  { id: 1016, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/ruby red/GN.png", hoverImage: "/images/products/gala-tshirt/ruby red/GN7.png", category: "Tops", variantColor: "Ruby Red", variantSlug: "ruby-red" },
  // Cameo variants
  { id: 1021, name: "Cameo Tee", price: "$40", image: "/images/products/cameo-tshirt/broadwaynoir/MN.png", hoverImage: "/images/products/cameo-tshirt/broadwaynoir/MN3.png", category: "Tops", variantColor: "Broadway Noir", variantSlug: "broadway-noir" },
  { id: 1022, name: "Cameo Tee", price: "$40", image: "/images/products/cameo-tshirt/suttonplacesnow/MN1.png", hoverImage: "/images/products/cameo-tshirt/suttonplacesnow/MN2.png", category: "Tops", variantColor: "Sutton Place Snow", variantSlug: "sutton-place-snow" },
  // Mutsu variants
  { id: 1031, name: "Mutsu Tee", price: "$45.00", image: "/images/products/mutsu-tshirt/broadwaynoir/N1.png", hoverImage: "/images/products/mutsu-tshirt/broadwaynoir/N2.png", category: "Tops", variantColor: "Broadway Noir", variantSlug: "broadway-noir" },
  { id: 1032, name: "Mutsu Tee", price: "$45.00", image: "/images/products/mutsu-tshirt/suttonplacesnow/N3.png", hoverImage: "/images/products/mutsu-tshirt/suttonplacesnow/N4.png", category: "Tops", variantColor: "Sutton Place Snow", variantSlug: "sutton-place-snow" },
  // Fuji Long Sleeve variants (updated colors & images)
  { id: 1041, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Arboretum/F2.png", hoverImage: "/images/products/fuji-tshirt/Arboretum/F11.png", category: "Tops", variantColor: "Arboretum", variantSlug: "arboretum", stPatsBadge: true, stPatsOriginalPrice: 80 },
  { id: 1042, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Hudson blue/F1.png", hoverImage: "/images/products/fuji-tshirt/Hudson blue/F9.png", category: "Tops", variantColor: "Hudson Blue", variantSlug: "hudson-blue" },
  { id: 1043, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Redbird/F4.png", hoverImage: "/images/products/fuji-tshirt/Redbird/F5.png", category: "Tops", variantColor: "Redbird", variantSlug: "redbird" },
  { id: 1044, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Broadwaynoir/F3.png", hoverImage: "/images/products/fuji-tshirt/Broadwaynoir/F7.png", category: "Tops", variantColor: "Broadway Noir", variantSlug: "broadway-noir" },
  // New additions: Wasabi Tee and First Edition Tee
  { id: 1071, name: "Wabisabi™ Scheffel Hall Pears Tee", price: "$45", image: "/images/products/Wasabi Tee/Wabasabi 1.png", hoverImage: "/images/products/Wasabi Tee/Wabasabi 2.png", category: "Tops", variantSlug: "wasabi-tee" },
  { id: 1072, name: "First Edition Tee", price: "$45", image: "/images/products/First Edition Tee/FE1.png", hoverImage: "/images/products/First Edition Tee/FE2.png", category: "Tops", variantColor: "White", variantSlug: "white" },
  { id: 1073, name: "First Edition Tee", price: "$45", image: "/images/products/First Edition Tee/FE3.png", hoverImage: "/images/products/First Edition Tee/FE4.png", category: "Tops", variantColor: "Black", variantSlug: "black" },

  // Forest Hills Hat (Green)
  { id: 3001, name: "Forest Hills Hat", price: "$46", image: "/images/products/Forest Hills Hat/Forest Hills Hat Final.png", hoverImage: "/images/products/Forest Hills Hat/G1.png", category: "Hats", stPatsBadge: true, stPatsOriginalPrice: 46 },

  // Porcelain FS Cap (White)
  { id: 3002, name: "Porcelain FS Cap", price: "$44", image: "/images/products/Porcelain Hat/Fruitscale Hat.png", hoverImage: "/images/products/Porcelain Hat/FS2.png", category: "Hats", variantSlug: "porcelain-hat" },

  // Ecru FS Cap (Beige)
  { id: 3003, name: "Ecru FS Cap", price: "$44", image: "/images/products/Ecru Hat/Beige Hat.png", hoverImage: "/images/products/Ecru Hat/B1.png", category: "Hats", variantSlug: "ecru-hat" },

  // Empire Corduroy Hat
  { id: 3004, name: "Empire Corduroy Hat", price: "$49", image: "/images/products/empire-hat/Apple Hat.png", hoverImage: "/images/products/empire-hat/A2.png", category: "Hats" },

  // Indigo FS Cap (Denim)
  { id: 3005, name: "Indigo FS Cap", price: "$44", image: "/images/products/denim-hat/Denim Hat.png", hoverImage: "/images/products/denim-hat/D1.png", category: "Hats" },

  // Mandarin Tee
  { id: 4001, name: "Mandarin 橘子 [JUZI] Tee", price: "$68.00", image: "/images/products/Mandarin Tee/Mandarin Tee.png", hoverImage: "/images/products/Mandarin Tee/Mandarin 2.png", category: "Tops", variantSlug: "mandarin-tee", },

  // Track Pants (variants)
  { id: 5001, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/ELMHURST TARO CUSTARD/P6.png", hoverImage: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TS7.png", category: "Tracksuits", variantColor: "Elmhurst Taro Custard", variantSlug: "elmhurst-taro-custard" },
  { id: 5002, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/Greenpoint Patina Crew/P4.png", hoverImage: "/images/products/tracksuits/Greenpoint Patina Crew/TS2.png", category: "Tracksuits", variantColor: "Greenpoint Patina Crew", variantSlug: "greenpoint-patina-crew", stPatsBadge: true, stPatsOriginalPrice: 90 },
  { id: 5003, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/NOHO NAPOLETANOS/P7.png", hoverImage: "/images/products/tracksuits/NOHO NAPOLETANOS/TS3.png", category: "Tracksuits", variantColor: "Noho Napoletanos", variantSlug: "noho-napoletanos" },
  { id: 5004, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/THE FACTORY FLOOR/P1.png", hoverImage: "/images/products/tracksuits/THE FACTORY FLOOR/TS4.png", category: "Tracksuits", variantColor: "The Factory Floor", variantSlug: "the-factory-floor" },
  { id: 5005, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/VICE CITY RUNNERS/P2.png", hoverImage: "/images/products/tracksuits/VICE CITY RUNNERS/TS5.png", category: "Tracksuits", variantColor: "Vice City Runners", variantSlug: "vice-city-runners" },
  { id: 5006, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/Victory Liberty Club/P3.png", hoverImage: "/images/products/tracksuits/Victory Liberty Club/TS6.png", category: "Tracksuits", variantColor: "Victory Liberty Club", variantSlug: "victory-liberty-club" },
  { id: 5007, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/YORKVILLE BLACK AND WHITE COOKIES/P5.png", hoverImage: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/TS1.png", category: "Tracksuits", variantColor: "Yorkville Black and White Cookies", variantSlug: "yorkville-black-and-white-cookies" },

  // Track Top (variants)
  { id: 6001, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/ELMHURST TARO CUSTARD/J6.png", hoverImage: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TS7.png", category: "Tracksuits", variantColor: "Elmhurst Taro Custard", variantSlug: "elmhurst-taro-custard" },
  { id: 6002, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/Greenpoint Patina Crew/J1.png", hoverImage: "/images/products/tracksuits/Greenpoint Patina Crew/TS2.png", category: "Tracksuits", variantColor: "Greenpoint Patina Crew", variantSlug: "greenpoint-patina-crew", stPatsBadge: true, stPatsOriginalPrice: 110 },
  { id: 6003, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/NOHO NAPOLETANOS/J7.png", hoverImage: "/images/products/tracksuits/NOHO NAPOLETANOS/TS3.png", category: "Tracksuits", variantColor: "Noho Napoletanos", variantSlug: "noho-napoletanos" },
  { id: 6004, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/THE FACTORY FLOOR/J4.png", hoverImage: "/images/products/tracksuits/THE FACTORY FLOOR/TS4.png", category: "Tracksuits", variantColor: "The Factory Floor", variantSlug: "the-factory-floor" },
  { id: 6005, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/VICE CITY RUNNERS/J3.png", hoverImage: "/images/products/tracksuits/VICE CITY RUNNERS/TS5.png", category: "Tracksuits", variantColor: "Vice City Runners", variantSlug: "vice-city-runners" },
  { id: 6006, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/Victory Liberty Club/J2.png", hoverImage: "/images/products/tracksuits/Victory Liberty Club/TS6.png", category: "Tracksuits", variantColor: "Victory Liberty Club", variantSlug: "victory-liberty-club" },
  { id: 6007, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/YORKVILLE BLACK AND WHITE COOKIES/J5.png", hoverImage: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/TS1.png", category: "Tracksuits", variantColor: "Yorkville Black and White Cookies", variantSlug: "yorkville-black-and-white-cookies" },
];

const stableShuffleKey = (product: Product): number => {
  const base = typeof product.id === 'number' ? product.id : Number.parseInt(String(product.id).replace(/[^0-9-]/g, ''), 10) || 0;
  const mixed = Math.imul(base ^ 0x45d9f3b, 0x45d9f3b);
  const furtherMixed = Math.imul(mixed ^ (mixed >>> 13), 0x45d9f3b);
  return (furtherMixed ^ (furtherMixed >>> 16)) >>> 0;
};

const roundRobinByProductName = (items: Product[]): Product[] => {
  if (!items.length) return [];

  const grouped = items.reduce((map, product) => {
    const name = product.name;
    const queue = map.get(name);
    if (queue) {
      queue.push(product);
    } else {
      map.set(name, [product]);
    }
    return map;
  }, new Map<string, Product[]>());

  grouped.forEach(queue => {
    queue.sort((a, b) => stableShuffleKey(a) - stableShuffleKey(b));
  });

  const nameOrder = Array.from(grouped.keys());
  const result: Product[] = [];
  let index = 0;

  while (nameOrder.length) {
    if (index >= nameOrder.length) index = 0;
    const currentName = nameOrder[index];
    const queue = grouped.get(currentName);

    if (!queue || !queue.length) {
      grouped.delete(currentName);
      nameOrder.splice(index, 1);
      continue;
    }

    result.push(queue.shift()!);

    if (!queue.length) {
      grouped.delete(currentName);
      nameOrder.splice(index, 1);
      continue;
    }

    index++;
  }

  return result;
};

const aestheticallyShuffleProducts = (items: Product[]): Product[] => {
  if (!items.length) return [];

  // Keep the first 5 items fixed at the top (new products)
  const pinnedItems = items.slice(0, 5);
  const restItems = items.slice(5);

  if (restItems.length === 0) return pinnedItems;

  const byCategory = restItems.reduce((acc, product) => {
    const key = product.category ?? "Misc";
    (acc[key] ||= []).push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Sprinkle hats throughout the grid instead of placing them all at the end
  const hats = roundRobinByProductName([...(byCategory["Hats"] ?? [])]);
  delete byCategory["Hats"];

  const sequences = Object.entries(byCategory).reduce((acc, [category, list]) => {
    acc[category] = roundRobinByProductName([...list]);
    return acc;
  }, {} as Record<string, Product[]>);

  const rotationTemplate = [
    "Tracksuits",
    "Tops",
    "Tracksuits",
    "Tops",
    "Jerseys",
    "Tops",
    "Tracksuits",
    "Tops",
  ];
  const dynamicRotation = Array.from(new Set([...rotationTemplate, ...Object.keys(sequences)]));

  const blended: Product[] = [];
  let rotationIndex = 0;
  let lastCategory: string | undefined;
  let hatIndex = 0;
  const hatInterval = 3; // Sprinkle a hat every 3 products

  const hasInventory = () => Object.values(sequences).some(queue => queue.length);
  let productCounter = 0;

  while (hasInventory() || hatIndex < hats.length) {
    // Sprinkle a hat every N products
    if (hatIndex < hats.length && productCounter > 0 && productCounter % hatInterval === 0) {
      blended.push(hats[hatIndex++]);
      productCounter++;
      continue;
    }

    let chosenCategory: string | undefined;

    for (let attempt = 0; attempt < dynamicRotation.length; attempt++) {
      const candidate = dynamicRotation[(rotationIndex + attempt) % dynamicRotation.length];
      const queue = sequences[candidate];
      if (!queue || !queue.length) continue;
      if (candidate === lastCategory) continue;

      chosenCategory = candidate;
      rotationIndex = (rotationIndex + attempt + 1) % dynamicRotation.length;
      break;
    }

    if (!chosenCategory) {
      const fallback = Object.keys(sequences).find(category => sequences[category]?.length);
      if (!fallback) break;
      chosenCategory = fallback;
      const fallbackIndex = dynamicRotation.indexOf(fallback);
      rotationIndex = fallbackIndex === -1 ? 0 : (fallbackIndex + 1) % dynamicRotation.length;
    }

    const queue = sequences[chosenCategory];
    const item = queue?.shift();
    if (item) {
      blended.push(item);
      lastCategory = chosenCategory;
      productCounter++;
    }

    if (!queue?.length) {
      delete sequences[chosenCategory];
    }
  }

  // If any hats remain, sprinkle them in at the end
  while (hatIndex < hats.length) {
    blended.push(hats[hatIndex++]);
  }

  return [...pinnedItems, ...blended];
};

interface ProductsGridProps {
  categoryFilter?: string | null;
  showBackgroundVideo?: boolean; // render the fixed background video (home only)
  collapseVariantsByName?: boolean;
  stPatsOnly?: boolean;
  onStPatsToggle?: () => void;
  onRequestBundleSheet?: (options?: { initialTab?: 'curated' | 'custom'; selectedId?: string | null }) => void;
}

export default function ProductsGrid({ categoryFilter, showBackgroundVideo = true, collapseVariantsByName = true, stPatsOnly = false, onStPatsToggle, onRequestBundleSheet }: ProductsGridProps = {}) {
  const isSurveyMode = useSurveyMode();
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  // Track swatch selection per product name (id of the chosen variant)
  const [selectedVariantByName, setSelectedVariantByName] = useState<Record<string, number>>({});
  const CARD_RADIUS = 7; // subtle curvature for grid cards
  const collapseVariants = collapseVariantsByName;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Filter products based on category then collapse variants so only one card per product name
  const filteredProducts = useMemo(() => {
    let base = categoryFilter
      ? products.filter(p => {
          if (!p.category) return false;
          if (categoryFilter === 'Tops') {
            return ['Tops', 'T-Shirts'].includes(p.category);
          }
          return p.category === categoryFilter;
        })
      : products;
    if (stPatsOnly) {
      base = base.filter(p => p.stPatsBadge === true);
    }
    return base;
  }, [categoryFilter, stPatsOnly]);
  // For each product name, bucket all variants together for representative selection
  const variantGroups = useMemo(() => (
    filteredProducts.reduce((acc, p) => {
      (acc[p.name] ||= []).push(p);
      return acc;
    }, {} as Record<string, Product[]>)
  ), [filteredProducts]);
  // Randomized representative variant per product name to avoid uniform default colors
  const [representativeByName, setRepresentativeByName] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!collapseVariants) {
      setRepresentativeByName({});
      return;
    }
    if (typeof window === 'undefined') return;
    const nextMap: Record<string, number> = {};
    Object.entries(variantGroups).forEach(([name, group]) => {
      if (!group.length) return;
      if (group.length === 1) {
        nextMap[name] = group[0].id;
        sessionStorage.setItem(`rep_variant_${name}`, String(group[0].id));
        return;
      }
      const key = `rep_variant_${name}`;
      const storedId = sessionStorage.getItem(key);
      const storedVariant = storedId ? group.find(g => String(g.id) === storedId) : undefined;
      const chosen = storedVariant || group[Math.floor(Math.random() * group.length)];
      nextMap[name] = chosen.id;
      sessionStorage.setItem(key, String(chosen.id));
    });
    setRepresentativeByName(nextMap);
  }, [collapseVariants, variantGroups]);

  const displayProducts: Product[] = useMemo(() => {
    const sortWithHatsLast = (items: Product[]) => items.slice().sort((a, b) => {
      const isHatA = a?.category === "Hats";
      const isHatB = b?.category === "Hats";
      if (isHatA === isHatB) return 0;
      return isHatA ? 1 : -1;
    });

    if (!collapseVariants) {
      if (!categoryFilter) {
        return aestheticallyShuffleProducts(filteredProducts);
      }
      return sortWithHatsLast(filteredProducts);
    }

    const reps = Object.entries(variantGroups).map(([name, group]) => {
      if (!group.length) return group[0];
      if (group.length === 1) return group[0];
      const repId = representativeByName[name];
      return group.find(item => item.id === repId) || group[0];
    });

    return sortWithHatsLast(reps);
  }, [collapseVariants, filteredProducts, variantGroups, representativeByName]);
  // Store touch state for each product card
  const touchState = useRef<{ [key: number]: { start: number; moved: boolean } }>({});
  const lastNavigationRef = useRef(0); // suppress duplicate click navigation after touch events
  // Track which product is showing hover image on mobile
  const [mobileHover, setMobileHover] = useState<number | null>(null);
  const formatPrice = (p: string) => {
    const n = Number(String(p).replace(/[^0-9.]/g, ''))
    return isFinite(n)
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : String(p)
  }
  const stPatsActive = isStPatsDayActive();

  // Map variant color names to hex for swatch display
  const COLOR_HEX: Record<string, string> = {
    // Common basics
    'White': '#ffffff',
    'Black': '#000000',
    // Gala
    'Broadway Noir': '#000000',
    'Sutton Place Snow': '#ffffff',
    'Grasshopper': '#85c96e',
    'Frosted Lemonade': '#fff7a8',
  'Ruby Red': '#fd8987',
    'Italian Ice': '#c7eaff',
    // Cameo/Mutsu safety
    'Broadway Noir ': '#000000',
    'Broadway noir': '#000000',
  // Fuji Long Sleeve palette
    'Arboretum': '#0f5132',
    'Hudson Blue': '#243b5a',
    'Redbird': '#c21010',
  // Retro Track Suit palette (updated)
    'Elmhurst Taro Custard': '#8271c2',
    'Greenpoint Patina Crew': '#58543a',
    'Noho Napoletanos': '#ab8c65',
    'The Factory Floor': '#1e2744',
    'Vice City Runners': '#fddde9',
    'Victory Liberty Club': '#7a273b',
    'Yorkville Black and White Cookies': '#000000',
  // Broadway Blueberry Jersey
    'Black Ice': '#101010',
  };
  return (
    <>
      {/* Optional fixed background video (default true for home) */}
      {showBackgroundVideo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          <video
            className="home-grid-video"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              objectPosition: isMobile ? 'center center' : 'right center',
              pointerEvents: 'none',
            }}
            src="/Videos/homevideo.mp4"
          />
        </div>
      )}
      <style>{`
        @media (max-width: 600px) {
          .home-grid-video {
            object-position: center center !important;
          }
        }
      `}</style>
      {stPatsActive && (
        <div
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto',
            padding: isMobile ? '0 16px 16px' : '0 20px 20px',
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={onStPatsToggle}
            style={{
              width: '100%',
              background: stPatsOnly
                ? 'linear-gradient(135deg, #0d3b0d 0%, #1f6b1f 40%, #0a2e0a 100%)'
                : 'linear-gradient(135deg, #0a2e0a 0%, #1a4d1a 40%, #0d3b0d 100%)',
              border: stPatsOnly ? '1.5px solid rgba(74,183,74,0.7)' : '1px solid rgba(74,183,74,0.35)',
              borderRadius: 16,
              padding: isMobile ? '12px 16px' : '14px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: stPatsOnly ? '0 0 0 3px rgba(74,183,74,0.2)' : 'none',
              transition: 'box-shadow 0.2s, border 0.2s',
            }}
          >
            {/* Watermark clover */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: -8,
                top: -8,
                fontSize: 80,
                opacity: 0.06,
                pointerEvents: 'none',
                lineHeight: 1,
                filter: 'blur(1px)',
              }}
            >☘️</span>
            <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>☘️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: isMobile ? '0.82rem' : '0.9rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                lineHeight: 1.3,
              }}>
                St. Patrick&apos;s Day Sale
                <span style={{
                  marginLeft: 10,
                  background: 'linear-gradient(90deg,#4ab74a,#2e8b2e)',
                  color: '#fff',
                  borderRadius: 999,
                  padding: '2px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  verticalAlign: 'middle',
                }}>50% OFF</span>
              </p>
              <p style={{
                margin: '3px 0 0',
                color: 'rgba(160,255,160,0.75)',
                fontSize: isMobile ? '0.72rem' : '0.78rem',
                letterSpacing: '0.04em',
                lineHeight: 1.4,
              }}>
                {stPatsOnly ? 'Showing green deals only — tap to clear' : 'Tap to shop green colorways · Ends March 17th'}
              </p>
            </div>
            {stPatsOnly && (
              <span style={{
                flexShrink: 0,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                borderRadius: 999,
                padding: '3px 10px',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>✕ Clear</span>
            )}
          </button>
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gap: isMobile ? 22 : 28,
          width: '100%',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto',
          padding: isMobile ? '12px 16px' : '0 20px',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, minmax(0, 1fr))',
          gridAutoRows: 'auto',
          gridAutoFlow: 'row dense',
          alignItems: 'start',
          background: 'transparent',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
      {displayProducts.map((product, idx) => {
    const isActive = isMobile ? mobileHover === product.id : hovered === product.id;
        const isBundleCard = Boolean(product.isBundle);
        const openBundleSheet = () => {
          if (!onRequestBundleSheet) {
            return;
          }
          onRequestBundleSheet({
            initialTab: 'custom',
            selectedId: product.bundleId ?? null,
          });
        };
        // All variants for this product name (for swatches)
        const variants = collapseVariants ? (variantGroups[product.name] || [product]) : [product];
        const chosenId = selectedVariantByName[product.name];
        const activeVariant = collapseVariants && chosenId ? (variants.find(v => v.id === chosenId) || product) : product;
        // Custom link mapping for named PDPs
        const getProductLink = () => {
          if (isBundleCard) {
            return '#';
          }
          const basePathMap: Record<string, string> = {
            'Empire Cordury hat': '/shop/empire-hat',
            'Empire Corduroy Hat': '/shop/empire-hat',
            'Denim Hat': '/shop/denim-hat',
            'Indigo FS Cap': '/shop/denim-hat',
            'Forest Hills Hat': '/shop/forest-hills-hat',
            'Broadway Blueberry Jersey': '/shop/hockey-jersey',
            'Gala Tee': '/shop/gala-tshirt',
            'Cameo Tee': '/shop/cameo-tshirt',
            'Mutsu Tee': '/shop/mutsu-tshirt',
            'Fuji Long Sleeve': '/shop/fuji-tshirt',
            'Retro Track Suit': '/shop/tracksuit',
            'White Hat': '/shop/white-hat',
            'Beige Hat': '/shop/beige-hat',
            'Porcelain FS Cap': '/shop/porcelain-hat',
            'Ecru FS Cap': '/shop/ecru-hat',
            'Mandarin 橘子 [JUZI] Tee': '/shop/mandarin-tee',
            'Retro Track Pants': '/shop/track-pants',
            'Retro Track Jacket': '/shop/track-top',
            'Wabisabi™ Scheffel Hall Pears Tee': '/shop/wasabi-tee',
            'First Edition Tee': '/shop/first-edition-tee',
            'Kiwi Rugby Jersey': '/shop/kiwi-rugby-jersey',
            'Liberty Zip-Up': '/shop/liberty-zip-up',
            'Liberty Hoodie': '/shop/liberty-hoodie',
            'Jozi Rugby Jersey': '/shop/jozi-rugby-jersey',
            'Stamped Waffle Knit': '/shop/stamped-waffle-knit',
          };
          const base = basePathMap[product.name] || `/products/${product.id}`;
          const slug = activeVariant.variantSlug;
          return slug ? `${base}?color=${encodeURIComponent(slug)}` : base;
        };
        return (
          <div
            key={product.id}
            style={{
              background: 'transparent',
              borderRadius: CARD_RADIUS,
              boxShadow: 'none',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              minHeight: isMobile ? 'auto' : 0,
              height: 'auto',
              width: '100%',
              maxWidth: '100%',
              margin: 0,
              marginBottom: 0,
              boxSizing: 'border-box',
              position: 'relative',
              transform: isActive ? 'scale(1.01)' : 'none',
              zIndex: isActive ? 10 : 1,
              justifyContent: isMobile ? 'center' : 'stretch',
              pointerEvents: 'auto',
                border: 'none'
            }}
            onMouseEnter={() => { 
              if (!isMobile) setHovered(product.id); 
            }}
            onMouseLeave={() => { 
              if (!isMobile) setHovered(null); 
            }}
            onTouchStart={() => {
              if (isMobile) {
                touchState.current[product.id] = { start: Date.now(), moved: false };
                setMobileHover(product.id);
              }
            }}
            onTouchMove={() => {
              if (isMobile) {
                if (touchState.current[product.id]) {
                  touchState.current[product.id].moved = true;
                }
              }
            }}
            onTouchEnd={() => {
              if (isMobile) {
                const state = touchState.current[product.id];
                const touchTime = state ? Date.now() - state.start : 0;
                if (state && !state.moved && touchTime < 250) {
                  if (isBundleCard) {
                    // Navigate to dedicated bundle page if it exists
                    if (product.bundleId === 'tshirt-bundle') {
                      router.push('/shop/tshirt-bundle');
                    } else {
                      openBundleSheet();
                    }
                    setMobileHover(null);
                    lastNavigationRef.current = Date.now();
                  } else {
                    router.push(getProductLink());
                    lastNavigationRef.current = Date.now();
                  }
                } else {
                  setMobileHover(null);
                }
                delete touchState.current[product.id];
              }
            }}
            onTouchCancel={() => {
              if (isMobile) {
                setMobileHover(null);
                delete touchState.current[product.id];
              }
            }}
            onClick={() => {
              if (Date.now() - lastNavigationRef.current < 350) {
                return;
              }
              if (isBundleCard) {
                // Navigate to dedicated bundle page if it exists
                if (product.bundleId === 'tshirt-bundle') {
                  router.push('/shop/tshirt-bundle');
                } else {
                  openBundleSheet();
                }
                lastNavigationRef.current = Date.now();
                return;
              }
              router.push(getProductLink());
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (isBundleCard) {
                  openBundleSheet();
                  lastNavigationRef.current = Date.now();
                  return;
                }
                router.push(getProductLink());
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div style={{
              width: '100%',
              aspectRatio: '1 / 1',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: CARD_RADIUS,
            }}>
              {product.badgeLabel && (
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    zIndex: 10,
                    opacity: 1,
                    pointerEvents: 'none',
                  }}
                >
                  {product.badgeLabel}
                </span>
              )}
              {stPatsActive && product.stPatsBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: product.badgeLabel ? 44 : 12,
                    left: 12,
                    background: 'linear-gradient(90deg,#1a4d1a,#2e8b2e)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    zIndex: 10,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: '0.7rem', lineHeight: 1 }}>☘️</span> 50% OFF
                </span>
              )}
              <Image
                src={activeVariant.image}
                alt={product.name}
                fill
                style={{
                  objectFit: 'cover',
                  transition: 'opacity .4s ease',
                  opacity: isActive ? 0 : 1,
                }}
                priority={idx < 6}
              />
              {activeVariant.hoverImage && (
                <Image
                  src={activeVariant.hoverImage}
                  alt={product.name}
                  fill
                  style={{
                    objectFit: 'cover',
                    transition: 'opacity .4s ease',
                    opacity: isActive ? 1 : 0,
                    position: 'absolute',
                    inset: 0,
                  }}
                  priority={idx < 6}
                />
              )}
              </div>
              {/* Name and price below the image with premium spacing */}
              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                gap: 6,
                padding: 0,
                marginTop: isMobile ? 10 : 12,
              }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                    <h3 style={{
                      fontSize: isMobile ? '1.02rem' : '1.12rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      margin: 0,
                      lineHeight: 1.25,
                      letterSpacing: '0.02em',
                      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                      width: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{product.name}</h3>
                    <span style={{
                      fontSize: isMobile ? '0.78rem' : '0.86rem',
                      fontWeight: 500,
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: 1.2,
                      letterSpacing: '0.12em',
                      width: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: isMobile ? '0.95rem' : '1rem',
                    }}>
                      {!collapseVariants && activeVariant.variantColor ? activeVariant.variantColor : '\u00A0'}
                    </span>
                  </div>
                  {/* Color swatches for products with color variants */}
                  {collapseVariants && variants.length > 1 && variants.some(v => !!v.variantColor) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-label={`Available colors for ${product.name}`}>
                      {variants.map((v) => (
                        v.variantColor ? (
                          <button
                            key={v.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedVariantByName(prev => ({ ...prev, [product.name]: v.id }));
                              if (typeof window !== 'undefined') {
                                try { sessionStorage.setItem(`rep_variant_${product.name}`, String(v.id)); } catch {}
                              }
                            }}
                            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            title={v.variantColor}
                            aria-label={v.variantColor}
                            style={{
                              width: isMobile ? 20 : 22,
                              height: isMobile ? 20 : 22,
                              borderRadius: '999px',
                              background: COLOR_HEX[v.variantColor] || '#e5e7eb',
                              border: (COLOR_HEX[v.variantColor] || '').toLowerCase() === '#ffffff' ? '1px solid #d1d5db' : '1px solid rgba(0,0,0,0.1)',
                              boxShadow: selectedVariantByName[product.name] === v.id ? '0 0 0 2px #111' : '0 2px 4px rgba(0,0,0,0.12)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              cursor: 'pointer'
                            }}
                          />
                        ) : null
                      ))}
                    </div>
                  )}
                  {/* Price display - hidden in survey mode */}
                  {isSurveyMode ? (
                    <p style={{ color: '#6b7280', fontSize: isMobile ? '0.92rem' : '1.0rem', margin: 0, fontWeight: 500 }}>
                      Coming Soon
                    </p>
                  ) : (
                    <p style={{ 
                      color: stPatsActive && product.stPatsBadge ? '#d97706' : '#111827', 
                      fontWeight: stPatsActive && product.stPatsBadge ? 700 : 600, 
                      fontSize: isMobile ? '0.92rem' : '1.0rem', 
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      {stPatsActive && product.stPatsBadge ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#6b7280', fontSize: '0.85em' }}>
                            {product.displayPrice || product.price}
                          </span>
                          <span>
                            ${Math.round((product.stPatsOriginalPrice || 0) * 0.5)}
                          </span>
                        </>
                      ) : (
                        product.displayPrice || product.price
                      )}
                    </p>
                  )}
                </div>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
