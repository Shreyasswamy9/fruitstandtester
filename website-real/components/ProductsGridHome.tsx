"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import BundleSheet from './BundleSheet'
import Price from './Price'

export interface Product {
  id: number;
  name: string;
  price: string;
  salePrice?: number | string;
  image: string;
  hoverImage?: string;
  category?: string;
  variantColor?: string; // For tee color variants
  variantSlug?: string; // slugified color for query param preselection
}

// Editable product list for the homepage grid
export const products: Product[] = [
  // Retro Track Suit Collection (spotlight first)
  { id: 2001, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TP.png", hoverImage: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TS7.png", category: "Tracksuits", variantColor: "Elmhurst Taro Custard", variantSlug: "elmhurst-taro-custard" },
  { id: 2002, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/Greenpoint Patina Crew/GB.png", hoverImage: "/images/products/tracksuits/Greenpoint Patina Crew/TS2.png", category: "Tracksuits", variantColor: "Greenpoint Patina Crew", variantSlug: "greenpoint-patina-crew" },
  { id: 2003, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/NOHO NAPOLETANOS/TB.png", hoverImage: "/images/products/tracksuits/NOHO NAPOLETANOS/TS3.png", category: "Tracksuits", variantColor: "Noho Napoletanos", variantSlug: "noho-napoletanos" },
  { id: 2004, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/THE FACTORY FLOOR/BG.png", hoverImage: "/images/products/tracksuits/THE FACTORY FLOOR/TS4.png", category: "Tracksuits", variantColor: "The Factory Floor", variantSlug: "the-factory-floor" },
  { id: 2005, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/VICE CITY RUNNERS/PB.png", hoverImage: "/images/products/tracksuits/VICE CITY RUNNERS/TS5.png", category: "Tracksuits", variantColor: "Vice City Runners", variantSlug: "vice-city-runners" },
  { id: 2006, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/Victory Liberty Club/RB.png", hoverImage: "/images/products/tracksuits/Victory Liberty Club/TS6.png", category: "Tracksuits", variantColor: "Victory Liberty Club", variantSlug: "victory-liberty-club" },
  { id: 2007, name: "Retro Track Suit", price: "$165", image: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/BW.png", hoverImage: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/TS1.png", category: "Tracksuits", variantColor: "Yorkville Black and White Cookies", variantSlug: "yorkville-black-and-white-cookies" },
  // Broadway Blueberry Jersey (merch slot before tees)
  { id: 1, name: "Broadway Blueberry Jersey", price: "$180", image: "/images/products/hockey Jersey/JN.png", hoverImage: "/images/products/hockey Jersey/JN1.png", category: "Jerseys", variantColor: "Black Ice", variantSlug: "hockey-jersey" },
  // New Tee lineup
  // Gala Tee – each color variant surfaced individually
  { id: 1011, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/broadwaynoir/GN4.png", hoverImage: "/images/products/gala-tshirt/broadwaynoir/GN5.png", category: "Tops", variantColor: "Broadway Noir", variantSlug: "broadway-noir" },
  { id: 1012, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/suttonplacesnow/GN6.png", hoverImage: "/images/products/gala-tshirt/suttonplacesnow/GN11.png", category: "Tops", variantColor: "Sutton Place Snow", variantSlug: "sutton-place-snow" },
  { id: 1013, name: "Gala Tee", price: "$40", image: "/images/products/gala-tshirt/Grasshopper/GN3.png", hoverImage: "/images/products/gala-tshirt/Grasshopper/GN8.png", category: "Tops", variantColor: "Grasshopper", variantSlug: "grasshopper" },
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
  { id: 1041, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Arboretum/F2.png", hoverImage: "/images/products/fuji-tshirt/Arboretum/F11.png", category: "Tops", variantColor: "Arboretum", variantSlug: "arboretum" },
  { id: 1042, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Hudson blue/F1.png", hoverImage: "/images/products/fuji-tshirt/Hudson blue/F9.png", category: "Tops", variantColor: "Hudson Blue", variantSlug: "hudson-blue" },
  { id: 1043, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Redbird/F4.png", hoverImage: "/images/products/fuji-tshirt/Redbird/F5.png", category: "Tops", variantColor: "Redbird", variantSlug: "redbird" },
  { id: 1044, name: "Fuji Long Sleeve", price: "$80", image: "/images/products/fuji-tshirt/Broadwaynoir/F3.png", hoverImage: "/images/products/fuji-tshirt/Broadwaynoir/F7.png", category: "Tops", variantColor: "Broadway Noir", variantSlug: "broadway-noir" },
  // New additions: Wasabi Tee and First Edition Tee
  { id: 1071, name: "Wabisabi™ Scheffel Hall Pears Tee", price: "$45", image: "/images/products/Wasabi Tee/Wabasabi 1.png", hoverImage: "/images/products/Wasabi Tee/Wabasabi 2.png", category: "Tops", variantSlug: "wasabi-tee" },
  { id: 1072, name: "First Edition Tee", price: "$45", image: "/images/products/First Edition Tee/FE1.png", hoverImage: "/images/products/First Edition Tee/FE2.png", category: "Tops", variantColor: "White", variantSlug: "first-edition-tee" },
  { id: 1073, name: "First Edition Tee", price: "$45", image: "/images/products/First Edition Tee/FE1.png", hoverImage: "/images/products/First Edition Tee/FE2.png", category: "Tops", variantColor: "Black", variantSlug: "first-edition-tee" },

  // Forest Hills Hat (Green)
  { id: 3001, name: "Forest Hills Hat", price: "$46", image: "/images/products/Forest Hills Hat/Green Hat.png", hoverImage: "/images/products/Forest Hills Hat/G1.png", category: "Hats" },

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
  { id: 5002, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/Greenpoint Patina Crew/P4.png", hoverImage: "/images/products/tracksuits/Greenpoint Patina Crew/TS2.png", category: "Tracksuits", variantColor: "Greenpoint Patina Crew", variantSlug: "greenpoint-patina-crew" },
  { id: 5003, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/NOHO NAPOLETANOS/P7.png", hoverImage: "/images/products/tracksuits/NOHO NAPOLETANOS/TS3.png", category: "Tracksuits", variantColor: "Noho Napoletanos", variantSlug: "noho-napoletanos" },
  { id: 5004, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/THE FACTORY FLOOR/P1.png", hoverImage: "/images/products/tracksuits/THE FACTORY FLOOR/TS4.png", category: "Tracksuits", variantColor: "The Factory Floor", variantSlug: "the-factory-floor" },
  { id: 5005, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/VICE CITY RUNNERS/P2.png", hoverImage: "/images/products/tracksuits/VICE CITY RUNNERS/TS5.png", category: "Tracksuits", variantColor: "Vice City Runners", variantSlug: "vice-city-runners" },
  { id: 5006, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/Victory Liberty Club/P3.png", hoverImage: "/images/products/tracksuits/Victory Liberty Club/TS6.png", category: "Tracksuits", variantColor: "Victory Liberty Club", variantSlug: "victory-liberty-club" },
  { id: 5007, name: "Retro Track Pants", price: "$90", image: "/images/products/Track Pants/YORKVILLE BLACK AND WHITE COOKIES/P5.png", hoverImage: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/TS1.png", category: "Tracksuits", variantColor: "Yorkville Black and White Cookies", variantSlug: "yorkville-black-and-white-cookies" },

  // Track Top (variants)
  { id: 6001, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/ELMHURST TARO CUSTARD/J6.png", hoverImage: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TS7.png", category: "Tracksuits", variantColor: "Elmhurst Taro Custard", variantSlug: "elmhurst-taro-custard" },
  { id: 6002, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/Greenpoint Patina Crew/J1.png", hoverImage: "/images/products/tracksuits/Greenpoint Patina Crew/TS2.png", category: "Tracksuits", variantColor: "Greenpoint Patina Crew", variantSlug: "greenpoint-patina-crew" },
  { id: 6003, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/NOHO NAPOLETANOS/J7.png", hoverImage: "/images/products/tracksuits/NOHO NAPOLETANOS/TS3.png", category: "Tracksuits", variantColor: "Noho Napoletanos", variantSlug: "noho-napoletanos" },
  { id: 6004, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/THE FACTORY FLOOR/J4.png", hoverImage: "/images/products/tracksuits/THE FACTORY FLOOR/TS4.png", category: "Tracksuits", variantColor: "The Factory Floor", variantSlug: "the-factory-floor" },
  { id: 6005, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/VICE CITY RUNNERS/J3.png", hoverImage: "/images/products/tracksuits/VICE CITY RUNNERS/TS5.png", category: "Tracksuits", variantColor: "Vice City Runners", variantSlug: "vice-city-runners" },
  { id: 6006, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/Victory Liberty Club/J2.png", hoverImage: "/images/products/tracksuits/Victory Liberty Club/TS6.png", category: "Tracksuits", variantColor: "Victory Liberty Club", variantSlug: "victory-liberty-club" },
  { id: 6007, name: "Retro Track Jacket", price: "$110", image: "/images/products/Track Top/YORKVILLE BLACK AND WHITE COOKIES/J5.png", hoverImage: "/images/products/tracksuits/YORKVILLE BLACK AND WHITE COOKIES/TS1.png", category: "Tracksuits", variantColor: "Yorkville Black and White Cookies", variantSlug: "yorkville-black-and-white-cookies" },

  { id: 7001, name: "Jacket Tester", price: "$150", image: "/images/products/Track Top/Greenpoint Patina Crew/J1.png", hoverImage: "/images/products/Track Top/Greenpoint Patina Crew/J3.png", category: "Extras" },
];

interface ProductsGridProps {
  categoryFilter?: string | null;
  showBackgroundVideo?: boolean; // render the fixed background video (home only)
}

export default function ProductsGrid({ categoryFilter, showBackgroundVideo = true }: ProductsGridProps = {}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  const [bundleOpen, setBundleOpen] = useState(false);
  // Track swatch selection per product name (id of the chosen variant)
  const [selectedVariantByName, setSelectedVariantByName] = useState<Record<string, number>>({});
  const CARD_RADIUS = 7; // subtle curvature for grid cards

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isMobile) {
      setBundleOpen(false);
    }
  }, [isMobile]);
  
  // Filter products based on category then collapse variants so only one card per product name
  const filteredProducts = useMemo(() => (
    categoryFilter
      ? products.filter(p => {
        if (!p.category) return false;
        if (categoryFilter === 'Tops') {
          return ['Tops', 'T-Shirts'].includes(p.category);
        }
        return p.category === categoryFilter;
      })
      : products
  ), [categoryFilter]);
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
  }, [variantGroups]);

  const displayProducts: Product[] = useMemo(() => {
    // Get one representative per product name
    const reps = Object.entries(variantGroups).map(([name, group]) => {
      if (!group.length) return group[0];
      if (group.length === 1) return group[0];
      const repId = representativeByName[name];
      return group.find(item => item.id === repId) || group[0];
    });
    // Sort so that hats always come last
    return reps.sort((a, b) => {
      const isHatA = a?.category === "Hats";
      const isHatB = b?.category === "Hats";
      if (isHatA === isHatB) return 0;
      return isHatA ? 1 : -1;
    });
  }, [variantGroups, representativeByName]);
  // Store touch state for each product card
  const touchState = useRef<{ [key: number]: { start: number; moved: boolean } }>({});
  // Track which product is showing hover image on mobile
  const [mobileHover, setMobileHover] = useState<number | null>(null);
  const formatPrice = (p: string) => {
    const n = Number(String(p).replace(/[^0-9.]/g, ''))
    return isFinite(n)
      ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : String(p)
  }

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
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gap: isMobile ? 22 : 28,
          width: '100%',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto',
          padding: isMobile ? '12px 16px' : '0 20px',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, minmax(0, 1fr))',
          gridAutoRows: 'auto',
          gridAutoFlow: 'row dense',
          overflowX: 'auto',
          alignItems: 'start',
          background: 'transparent',
          justifyContent : 'center',
        }}
      >
      {displayProducts.map((product, idx) => {
    const isActive = isMobile ? mobileHover === product.id : hovered === product.id;
        // All variants for this product name (for swatches)
        const variants = variantGroups[product.name] || [product];
        const chosenId = selectedVariantByName[product.name];
        const activeVariant = chosenId ? (variants.find(v => v.id === chosenId) || product) : product;
        // Custom link mapping for named PDPs
        const getProductLink = () => {
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
            'Jacket Tester': '/shop/jacket-tester',
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
                  router.push(getProductLink());
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
              if (!isMobile) {
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{
                      fontSize: isMobile ? '1.02rem' : '1.12rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      margin: 0,
                      lineHeight: 1.25,
                      letterSpacing: '0.005em',
                      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                      display: 'flex',
                      alignItems: 'center'
                    }}>{product.name}</h3>
                    {/* Color swatches for products with color variants */}
                    {variants.length > 1 && variants.some(v => !!v.variantColor) && (
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
                  </div>
                  <p style={{
                    color: '#111827',
                    fontWeight: 500,
                    fontSize: isMobile ? '0.92rem' : '1.0rem',
                    margin: 0,
                    lineHeight: 1.2,
                    letterSpacing: '0.01em',
                    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                  }}>{/* price */}
                      <Price price={product.price} />
                  </p>
                </div>
            </div>
          </div>
        );
      })}
      {/* Mobile bundle sheet */}
      <BundleSheet open={bundleOpen} onClose={() => setBundleOpen(false)} />
    </div>
    </>
  );
}
