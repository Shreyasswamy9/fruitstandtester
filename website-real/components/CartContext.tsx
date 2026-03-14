"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  // bundle metadata
  isBundle?: boolean;
  bundleId?: string;
  bundleItems?: number[];
  bundleSize?: string;
  // Unique line identifier to distinguish same product with different options
  lineId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  // Add a bundle as a single cart line with its own price
  addBundleToCart: (opts: { bundleId: string; name: string; price: number; image: string; itemIds?: number[]; bundleSize?: string; quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setLineQuantity: (lineId: string, quantity: number) => void;
  isOverlayOpen: boolean;
  openCartOverlay: () => void;
  closeCartOverlay: () => void;
  lastAddedItem: CartItem | null;
  freeShippingExpiresAt: number | null;
  freeShippingActive: boolean;
  freeShippingSecondsLeft: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const deriveLineId = (item: Partial<CartItem>) => {
  const productId = item.productId ?? "";
  const size = item.size ?? "";
  const color = item.color ?? "";
  const bundleToken = item.isBundle ? "bundle" : "";
  return `${productId}::${size}::${color}::${bundleToken}`;
};

const normalizeStoredItems = (raw: unknown): CartItem[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((candidate): CartItem | null => {
      if (!candidate || typeof candidate !== "object") return null;
      const value = candidate as Record<string, unknown>;

      const productIdRaw = value.productId;
      const productId = typeof productIdRaw === "string" && productIdRaw.trim().length > 0
        ? productIdRaw
        : productIdRaw != null
          ? String(productIdRaw)
          : "";
      if (!productId) return null;

      const quantity = Number(value.quantity) || 0;
      if (quantity <= 0) return null;

      const bundleItems = Array.isArray(value.bundleItems)
        ? value.bundleItems.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry))
        : undefined;

      const normalized: CartItem = {
        productId,
        name: typeof value.name === "string" ? value.name : "",
        price: Number(value.price) || 0,
        image: typeof value.image === "string" ? value.image : "",
        quantity,
        size: typeof value.size === "string" ? value.size : undefined,
        color: typeof value.color === "string" ? value.color : undefined,
        isBundle: Boolean(value.isBundle),
        bundleId: typeof value.bundleId === "string" ? value.bundleId : undefined,
        bundleItems,
        bundleSize: typeof value.bundleSize === "string" ? value.bundleSize : undefined,
        lineId: typeof value.lineId === "string" && value.lineId.trim().length > 0 ? value.lineId : undefined,
      };

      normalized.lineId = normalized.lineId ?? deriveLineId(normalized);
      return normalized;
    })
    .filter((entry): entry is CartItem => Boolean(entry));
};

const cartsEqual = (a: CartItem[], b: CartItem[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  const serialize = (items: CartItem[]) =>
    items
      .map((item) => ({
        id: item.lineId ?? deriveLineId(item),
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size ?? "",
        color: item.color ?? "",
        bundleSize: item.bundleSize ?? "",
        bundleId: item.bundleId ?? "",
        isBundle: Boolean(item.isBundle),
        name: item.name,
        image: item.image,
      }))
      .sort((left, right) => left.id.localeCompare(right.id));

  const left = serialize(a);
  const right = serialize(b);

  return left.every((item, idx) => {
    const other = right[idx];
    return (
      item.id === other.id &&
      item.productId === other.productId &&
      item.quantity === other.quantity &&
      item.price === other.price &&
      item.size === other.size &&
      item.color === other.color &&
      item.bundleSize === other.bundleSize &&
      item.bundleId === other.bundleId &&
      item.isBundle === other.isBundle &&
      item.name === other.name &&
      item.image === other.image
    );
  });
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  // Free shipping timer state
  const [freeShippingExpiresAt, setFreeShippingExpiresAt] = useState<number | null>(null);
  const [freeShippingSecondsLeft, setFreeShippingSecondsLeft] = useState(0);
  const freeShippingActive = freeShippingExpiresAt !== null && freeShippingSecondsLeft > 0;

  // Load cart and free shipping timer from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('cart');
    const storedFreeShipping = localStorage.getItem('freeShippingExpiresAt');
    if (stored) {
      try {
        const parsedItems = JSON.parse(stored);
        const normalized = normalizeStoredItems(parsedItems);
        setItems(normalized);
      } catch (error) {
        localStorage.removeItem('cart');
      }
    }
    if (storedFreeShipping) {
      const expires = parseInt(storedFreeShipping, 10);
      if (!isNaN(expires)) setFreeShippingExpiresAt(expires);
    }
    setIsLoaded(true);
  }, []);

  // Listen for cart cleared event from success page
  useEffect(() => {
    const handleCartCleared = () => {
      setItems([]);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cartCleared', handleCartCleared);
      return () => window.removeEventListener('cartCleared', handleCartCleared);
    }
  }, []);

  // Save cart to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Free shipping timer countdown
  useEffect(() => {
    if (!freeShippingExpiresAt) {
      setFreeShippingSecondsLeft(0);
      return;
    }
    const update = () => {
      const now = Date.now();
      const seconds = Math.max(0, Math.floor((freeShippingExpiresAt - now) / 1000));
      setFreeShippingSecondsLeft(seconds);
      if (seconds <= 0) {
        setFreeShippingExpiresAt(null);
        localStorage.removeItem('freeShippingExpiresAt');
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [freeShippingExpiresAt]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;

    const syncFromStorage = () => {
      const stored = window.localStorage.getItem('cart');

      if (!stored) {
        setItems(prev => (prev.length ? [] : prev));
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        const normalized = normalizeStoredItems(parsed);
        setItems(prev => (cartsEqual(prev, normalized) ? prev : normalized));
      } catch (error) {
        console.error('Error parsing cart from localStorage during sync:', error);
        window.localStorage.removeItem('cart');
        setItems([]);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'cart') {
        syncFromStorage();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    };

    const handlePageShow = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', syncFromStorage);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', syncFromStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isLoaded]);

  // Disabled for survey/testing mode
  const addToCart = (_item: CartItem) => {
    if (typeof window !== 'undefined') {
      alert('Add to cart is disabled for survey/testing mode.');
    }
    return;
  };

  // Disabled for survey/testing mode
  const addBundleToCart = (_opts: { bundleId: string; name: string; price: number; image: string; itemIds?: number[]; bundleSize?: string; quantity?: number }) => {
    if (typeof window !== 'undefined') {
      alert('Add to cart is disabled for survey/testing mode.');
    }
    return;
  };

  const removeFromCart = (productId: string) => {
    let remaining = 0;
    setItems(prev => {
      // If the provided id matches a lineId, remove only that line. Otherwise fall back to removing by productId for compatibility.
      const hasLine = prev.some(i => i.lineId === productId);
      const next = hasLine ? prev.filter(i => i.lineId !== productId) : prev.filter(i => i.productId !== productId);
      remaining = next.length;
      return next;
    });

    if (remaining === 0) {
      setIsOverlayOpen(false);
      setLastAddedItem(null);
      setFreeShippingExpiresAt(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('freeShippingExpiresAt');
      }
    }
  };

  const setLineQuantity = (lineId: string, quantity: number) => {
    let removedAll = false;
    let updatedLine: CartItem | null = null;
    setItems(prev => {
      const idx = prev.findIndex(i => (i.lineId ?? i.productId) === lineId);
      if (idx === -1) return prev;
      if (quantity <= 0) {
        const next = prev.filter((_, index) => index !== idx);
        removedAll = next.length === 0;
        return next;
      }
      const target = prev[idx];
      const updated: CartItem = { ...target, quantity };
      const next = [...prev];
      next[idx] = updated;
      updatedLine = updated;
      return next;
    });

    if (removedAll) {
      setIsOverlayOpen(false);
      setLastAddedItem(null);
    } else if (updatedLine) {
      setLastAddedItem(updatedLine);
    }
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
      localStorage.removeItem('freeShippingExpiresAt');
    }
    setIsOverlayOpen(false);
    setLastAddedItem(null);
    setFreeShippingExpiresAt(null);
  };

  const openCartOverlay = () => setIsOverlayOpen(true);
  const closeCartOverlay = () => setIsOverlayOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addBundleToCart,
        removeFromCart,
        clearCart,
        setLineQuantity,
        isOverlayOpen,
        openCartOverlay,
        closeCartOverlay,
        lastAddedItem,
        freeShippingExpiresAt,
        freeShippingActive,
        freeShippingSecondsLeft,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
