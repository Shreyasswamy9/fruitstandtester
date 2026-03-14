/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
// import StaggeredMenu from "../../components/StagerredMenu"
import { motion } from "framer-motion"
import { useCart } from "../../components/CartContext"
import Image from "next/image"
import Price from '@/components/Price'
import { useStripeCheckout } from "../../hooks/useCheckout"
import { supabase } from "../supabase-client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

type CountryCodeDefinition = {
  code: string;
  country: string; // ISO 3166-1 alpha-2
  name: string;
};

type CountryCodeOption = CountryCodeDefinition & {
  flag: string;
  label: string;
  value: string;
};

const getFlagEmoji = (isoCode: string): string => {
  if (!isoCode || isoCode.length !== 2) return '';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + (char.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
};

const getDialCodeFromValue = (value: string): string => {
  const [, dialCode] = value.split('|');
  return dialCode ?? value;
};

const RAW_COUNTRY_CODES: CountryCodeDefinition[] = [
  { code: "+1", country: "US", name: "United States" },
  { code: "+1", country: "CA", name: "Canada" },
  { code: "+44", country: "GB", name: "United Kingdom" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+39", country: "IT", name: "Italy" },
  { code: "+34", country: "ES", name: "Spain" },
  { code: "+31", country: "NL", name: "Netherlands" },
  { code: "+32", country: "BE", name: "Belgium" },
  { code: "+41", country: "CH", name: "Switzerland" },
  { code: "+43", country: "AT", name: "Austria" },
  { code: "+45", country: "DK", name: "Denmark" },
  { code: "+46", country: "SE", name: "Sweden" },
  { code: "+47", country: "NO", name: "Norway" },
  { code: "+358", country: "FI", name: "Finland" },
  { code: "+91", country: "IN", name: "India" },
  { code: "+86", country: "CN", name: "China" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+82", country: "KR", name: "South Korea" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+64", country: "NZ", name: "New Zealand" },
  { code: "+55", country: "BR", name: "Brazil" },
  { code: "+52", country: "MX", name: "Mexico" },
  { code: "+27", country: "ZA", name: "South Africa" }
];

const COUNTRY_CODE_OPTIONS: CountryCodeOption[] = RAW_COUNTRY_CODES.map((entry) => {
  const flag = getFlagEmoji(entry.country);
  const value = `${entry.country}|${entry.code}`;
  const label = `${flag ? `${flag} ` : ''}${entry.country} Ã‚Â· ${entry.name} (${entry.code})`;
  return { ...entry, flag, label, value };
});

export default function CartPage() {
  // const [menuOpen, setMenuOpen] = useState(false)
  // Coupons and site-wide sale/discount logic removed per request
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showGuestCheckout, setShowGuestCheckout] = useState(false)

  // Country codes for phone numbers (precomputed with flags and labels)
  const countryCodes = COUNTRY_CODE_OPTIONS;
  const defaultPhoneCountry = countryCodes[0]?.value ?? '';
  const [guestFormErrors, setGuestFormErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: ""
  })
  const [guestData, setGuestData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    phoneCountryCode: defaultPhoneCountry,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US"
    },
    marketing: {
      emailUpdates: true
    }
  })
  const { items, removeFromCart, clearCart, addToCart } = useCart();
  const { createCheckoutSession, loading: checkoutLoading, error: checkoutError } = useStripeCheckout();
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = React.useState<User | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(data.user ?? null)
      setIsSignedIn(!!data.user)
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      setIsSignedIn(!!u)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])
  const router = useRouter();

  const getCartTotal = () => items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

  // Coupon functionality removed per request

  const handleRemove = (productId: string) => {
    // `productId` may be a lineId (preferred) or a productId for backwards compatibility
    const item = items.find(i => i.lineId === productId) || items.find(i => i.productId === productId);
    const label = item ? `${item.name}${item.size ? ' Ã¢â‚¬â€ ' + item.size : ''}` : 'this item';
    if (typeof window === 'undefined' || window.confirm(`Remove ${label} from your cart?`)) {
      removeFromCart(productId);
    }
  };

  const handleClearCart = () => {
    if (typeof window === 'undefined' || window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove(id);
      return;
    }

    const item = items.find(i => i.lineId === id) || items.find(i => i.productId === id);
    if (item) {
      // Remove the specific line first (use its lineId if available)
      removeFromCart(item.lineId ?? item.productId);
      // Add it back with new quantity
      addToCart({ ...item, quantity: newQuantity });
    }
  };

  // Subtotal (no per-item sale/coupon applied)
  const subtotal = getCartTotal();
  // Shipping thresholds based on subtotal
  const shipping = subtotal >= 20 ? 0 : 8.99;
  const isPriorityShipping = subtotal >= 125;
  const finalShipping = shipping;
  const tax = subtotal * 0.08875; // NY tax rate
  const total = subtotal + finalShipping + tax;

  // Available offers removed (no coupons/promos)

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Check if user is authenticated
    if (!isSignedIn && !showGuestCheckout) {
      // Redirect unauthenticated customers to sign-in and preserve intended destination
      const redirectTarget = typeof window !== 'undefined'
        ? `/signin?redirect=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`
        : '/signin';
      router.push(redirectTarget);
      return;
    }

    // For guest checkout, validate essential info
    if (showGuestCheckout) {
      if (!validateGuestForm()) {
        // Error messages are already set by validateGuestForm()
        return;
      }
    }

    // Check if user has completed their profile (you'll need to add this to your user model)
    // For now, we'll assume all authenticated users can checkout
    // if (!session?.user?.profileComplete) {
    //   router.push("/account/complete-profile?redirect=cart");
    //   return;
    // }

    try {
      if (showGuestCheckout) {
        // Guest checkout with collected data
        const session = await createCheckoutSession({
          items: items,
          shipping: finalShipping,
          tax: tax,
          guestData: {
            email: guestData.email,
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            phone: getDialCodeFromValue(guestData.phoneCountryCode) + guestData.phone,
            address: guestData.address,
          },
        });
        if (typeof window !== 'undefined') {
          window.location.assign(session.url);
        }
      } else {
        // Authenticated user checkout
        const session = await createCheckoutSession({
          items: items,
          shipping: finalShipping,
          tax: tax,
          customerData: user ? {
            email: user.email || "",
            name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            // Add more user data if available from session
          } : undefined,
        });
        if (typeof window !== 'undefined') {
          window.location.assign(session.url);
        }
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validateZipCode = (zipCode: string): string => {
    if (!zipCode) return "ZIP code is required";
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) return "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)";
    return "";
  };

  const validatePhone = (phone: string): string => {
    // Phone is optional and we no longer enforce a strict phone number format for guest checkout.
    // Return an empty string to indicate no validation error.
    return "";
  };

  const validateRequired = (value: string, fieldName: string): string => {
    if (!value || value.trim() === "") return `${fieldName} is required`;
    return "";
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "email":
        return validateEmail(value);
      case "firstName":
        return "";
      case "lastName":
        return "";
      case "phone":
        return validatePhone(value);
      case "address.street":
        return "";
      case "address.city":
        return "";
      case "address.state":
        return "";
      case "address.zipCode":
        return value.trim() ? validateZipCode(value) : "";
      default:
        return "";
    }
  };

  const handleGuestInputChange = (field: string, value: string | boolean) => {
    // Clear error for this field when user starts typing
    if (typeof value === "string") {
      const errorKey = field.includes(".") ? field.split(".")[1] : field;
      setGuestFormErrors(prev => ({
        ...prev,
        [errorKey]: ""
      }));
    }

    if (field === "phoneCountryCode" && typeof value === "string") {
      const [iso] = value.split("|");
      setGuestData(prev => ({
        ...prev,
        phoneCountryCode: value,
        address: {
          ...prev.address,
          country: iso || prev.address.country
        }
      }));
      return;
    }

    // Update the form data
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setGuestData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof guestData] as object),
          [child]: value
        }
      }));
    } else {
      setGuestData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateGuestForm = (): boolean => {
    const errors = {
      email: validateField("email", guestData.email),
      firstName: validateField("firstName", guestData.firstName),
      lastName: validateField("lastName", guestData.lastName),
      phone: validateField("phone", guestData.phone),
      street: validateField("address.street", guestData.address.street),
      city: validateField("address.city", guestData.address.city),
      state: validateField("address.state", guestData.address.state),
      zipCode: validateField("address.zipCode", guestData.address.zipCode)
    };

    setGuestFormErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error !== "");
  };

  const handleGuestCheckoutSubmit = async () => {
    if (!validateGuestForm()) {
      return; // Don't proceed if validation fails
    }

    // Proceed with checkout if validation passes
    await handleCheckout();
  };

  const handleContinueAsGuest = () => {
    setShowGuestCheckout(true);
    setShowSignInModal(false);
  };

  return (
  <div className="min-h-screen bg-[#fbf6f0]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 text-center"
          >
            Shopping Cart
          </motion.h1>
          <p className="text-gray-600 mt-2 mx-auto">
            {items.length === 0 ? "Your cart is empty" : `${items.length} item${items.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven`t added any items to your cart yet. Start shopping to fill it up!
            </p>
            <motion.a
              href="/shop"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Return to Store
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.lineId ?? item.productId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                      style={{ willChange: "transform", backfaceVisibility: "hidden" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                        {/* Product Image - Clickable */}
                        {item.isBundle ? (
                          <div className="relative w-20 h-20 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 transition-all duration-200">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                            <span className="absolute left-1 top-1 text-[10px] bg-black text-white px-2 py-0.5 rounded">Bundle</span>
                          </div>
                        ) : (
                          <Link 
                            href={`/shop/${item.productId}`}
                            className="relative w-20 h-20 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 hover:ring-2 hover:ring-black hover:ring-opacity-50 transition-all duration-200 cursor-pointer"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-200"
                              sizes="80px"
                            />
                          </Link>
                        )}
                        
                        {/* Product Details - Full width on mobile */}
                        <div className="flex-1 min-w-0">
                          {item.isBundle ? (
                            <div className="block">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                              <p className="text-xs text-gray-500">Bundle contents: {Array.isArray(item.bundleItems) ? item.bundleItems.join(', ') : ''}</p>
                              {item.bundleSize && (
                                <p className="text-xs text-gray-500">Size: {item.bundleSize}</p>
                              )}
                            </div>
                          ) : (
                            <Link 
                              href={`/shop/${item.productId}`}
                              className="block hover:text-blue-600 transition-colors duration-200"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0">
                            {item.size && (
                              <span className="text-sm text-gray-500">Size: {item.size}</span>
                            )}
                            {item.color && (
                              <span className="text-sm text-gray-500">Color: {item.color}</span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">
                            <Price price={item.price} />
                          </p>
                        </div>
                        
                        {/* Mobile: Quantity and actions in a row */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                              onClick={() => updateQuantity(item.lineId ?? item.productId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="text-lg font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.lineId ?? item.productId, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Item Total and Remove - Mobile: side by side, Desktop: stacked */}
                          <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:items-end">
                            <p className="text-lg font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            
                            <button
                              onClick={() => handleRemove(item.lineId ?? item.productId)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Clear Cart Button */}
                <div className="p-4 sm:p-6 border-t border-gray-200">
                  <button
                    onClick={handleClearCart}
                    className="w-full py-3 border border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{finalShipping === 0 ? 'FREE' : `$${finalShipping.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleCheckout}
                  disabled={items.length === 0 || checkoutLoading}
                  className="w-full mt-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ willChange: "transform" }}
                >
                  {checkoutLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </motion.button>
                
                {!isSignedIn && !showGuestCheckout && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Sign In or Continue as Guest</h4>
                        <p className="text-xs text-blue-700 mb-3">
                          Sign in for faster checkout and exclusive offers, or continue as a guest.
                        </p>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => router.push('/signin')}
                            className="w-full px-4 py- bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Sign In for Faster Checkout
                            </button>
                          <button
                            onClick={handleContinueAsGuest}
                            className="px-4 py-2 border border-blue-300 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Continue as Guest
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                
                {checkoutError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{checkoutError}</p>
                  </div>
                )}
                
                <motion.a
                  href="/shop"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  className="w-full mt-4 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center block"
                  style={{ willChange: "transform" }}
                >
                  Return to Store
                </motion.a>

                {/* Guest Checkout Form - Moved below Continue Shopping */}
                {showGuestCheckout && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-800">Guest Checkout Information</h4>
                      <button
                        onClick={() => setShowGuestCheckout(false)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Contact Information */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-700 mb-2">CONTACT INFORMATION</h5>
                        <p className="text-xs text-gray-500 mb-3">Only your email is required. Names and phone are optional for express wallets.</p>
                        <div className="space-y-3">
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            placeholder="Email address *"
                            value={guestData.email}
                            onChange={(e) => handleGuestInputChange("email", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                              guestFormErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            required
                          />
                          {guestFormErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{guestFormErrors.email}</p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              name="given-name"
                              autoComplete="shipping given-name"
                              autoCorrect="off"
                              autoCapitalize="words"
                              spellCheck={false}
                              placeholder="First name"
                              value={guestData.firstName}
                              onChange={(e) => handleGuestInputChange("firstName", e.target.value)}
                              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                guestFormErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {guestFormErrors.firstName && (
                              <p className="text-red-500 text-xs mt-1">{guestFormErrors.firstName}</p>
                            )}
                            <input
                              type="text"
                              name="family-name"
                              autoComplete="shipping family-name"
                              autoCorrect="off"
                              autoCapitalize="words"
                              spellCheck={false}
                              placeholder="Last name"
                              value={guestData.lastName}
                              onChange={(e) => handleGuestInputChange("lastName", e.target.value)}
                              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                guestFormErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {guestFormErrors.lastName && (
                              <p className="text-red-500 text-xs mt-1">{guestFormErrors.lastName}</p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <select
                              value={guestData.phoneCountryCode}
                              onChange={(e) => handleGuestInputChange("phoneCountryCode", e.target.value)}
                              className="w-full sm:w-[200px] px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                              title="Select country code"
                            >
                              {countryCodes.map((country) => (
                                <option key={`${country.code}-${country.country}`} value={country.value}>
                                  {country.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              name="tel"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="none"
                              spellCheck={false}
                              inputMode="tel"
                              placeholder="Phone number"
                              value={guestData.phone}
                              onChange={(e) => handleGuestInputChange("phone", e.target.value)}
                              className={`w-full sm:flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                guestFormErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          {guestFormErrors.phone && (
                            <p className="text-red-500 text-xs mt-1">{guestFormErrors.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-700 mb-2">SHIPPING ADDRESS</h5>
                        <p className="text-xs text-gray-500 mb-3">Optional Ã¢â‚¬â€ digital wallets like Apple Pay or Link will provide this automatically during payment.</p>
                        <div className="space-y-3">
                          <input
                            type="text"
                            name="street-address"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="words"
                            spellCheck={false}
                            placeholder="Street address (optional)"
                            value={guestData.address.street}
                            onChange={(e) => handleGuestInputChange("address.street", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                              guestFormErrors.street ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          {guestFormErrors.street && (
                            <p className="text-red-500 text-xs mt-1">{guestFormErrors.street}</p>
                          )}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <input
                                type="text"
                                name="address-level2"
                                autoComplete="shipping address-level2"
                                autoCorrect="off"
                                autoCapitalize="words"
                                spellCheck={false}
                                placeholder="City"
                                value={guestData.address.city}
                                onChange={(e) => handleGuestInputChange("address.city", e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                  guestFormErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              {guestFormErrors.city && (
                                <p className="text-red-500 text-xs mt-1">{guestFormErrors.city}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="text"
                                name="address-level1"
                                autoComplete="shipping address-level1"
                                autoCorrect="off"
                                autoCapitalize="characters"
                                spellCheck={false}
                                placeholder="State"
                                value={guestData.address.state}
                                onChange={(e) => handleGuestInputChange("address.state", e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                  guestFormErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              {guestFormErrors.state && (
                                <p className="text-red-500 text-xs mt-1">{guestFormErrors.state}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="text"
                                name="postal-code"
                                autoComplete="shipping postal-code"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="ZIP / Postal code"
                                value={guestData.address.zipCode}
                                onChange={(e) => handleGuestInputChange("address.zipCode", e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                  guestFormErrors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              {guestFormErrors.zipCode && (
                                <p className="text-red-500 text-xs mt-1">{guestFormErrors.zipCode}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Marketing Preferences */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="space-y-2">
                          <label className="flex items-start">
                            <input
                              type="checkbox"
                              checked={guestData.marketing.emailUpdates}
                              onChange={(e) => handleGuestInputChange("marketing.emailUpdates", e.target.checked)}
                              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-0.5"
                            />
                            <span className="ml-2 text-xs text-gray-600">
                              Email me about new products and exclusive offers
                            </span>
                          </label>
                          {/* analytics consent removed per request */}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Want faster checkout next time?
                          </p>
                            <button 
                            onClick={() => router.push('/signup')}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                              Create Account
                            </button>
                        </div>
                      </div>
                    </div>

                    {/* Complete Guest Checkout Button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      onClick={handleGuestCheckoutSubmit}
                      disabled={items.length === 0 || checkoutLoading}
                      className="w-full mt-6 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ willChange: "transform" }}
                    >
                      {checkoutLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Complete Guest Checkout'
                      )}
                    </motion.button>
                  </div>
                )}
                
                {/* Security Badges */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center mb-4">Secure checkout guaranteed</p>
                  <div className="flex justify-center space-x-4 opacity-60">
                    <div className="text-xs text-gray-400">Ã°Å¸â€â€™ SSL Secured</div>
                    <div className="text-xs text-gray-400">Ã¢Å“â€œ Safe Payment</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
