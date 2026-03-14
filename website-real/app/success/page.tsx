'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { trackPurchase, generateEventId } from '@/lib/analytics/meta-pixel';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderDetails = {
  orderNumber: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  currency: string;
};

function SuccessContent() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [shouldFetchOrder, setShouldFetchOrder] = useState(false);
  const [initialOrderNumber, setInitialOrderNumber] = useState<string | null>(null);
  const purchaseTracked = useRef(false);
  const router = useRouter();

  // Track Purchase once order details are loaded
  useEffect(() => {
    if (!orderDetails || purchaseTracked.current) return;
    if (!orderDetails.orderNumber || orderDetails.items.length === 0) return;

    // Check if already tracked in sessionStorage
    const trackingKey = `purchase_tracked_${orderDetails.orderNumber}`;
    if (sessionStorage.getItem(trackingKey)) {
      purchaseTracked.current = true;
      return;
    }

    // Track Purchase event
    const contents = orderDetails.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
      title: item.name,
    }));

    trackPurchase({
      content_ids: orderDetails.items.map(item => item.id),
      contents,
      value: orderDetails.totalAmount,
      currency: orderDetails.currency || 'USD',
      order_id: orderDetails.orderNumber,
      eventId: generateEventId(),
    });

    // Mark as tracked
    sessionStorage.setItem(trackingKey, 'true');
    purchaseTracked.current = true;
  }, [orderDetails]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isActive = true;

    const evaluateCheckoutFlow = async () => {
      const params = new URLSearchParams(window.location.search);
      const sid = params.get('session_id');
      const pid = params.get('payment_intent');
      const orderNumberParam = params.get('order_number') ?? params.get('orderNumber');

      if (!isActive) {
        return;
      }

      setSessionId(sid);
      setPaymentIntentId(pid);
      if (orderNumberParam && /^\d{6}$/.test(orderNumberParam)) {
        setInitialOrderNumber(orderNumberParam);
      }

      if (!sid && !pid) {
        setLoading(false);
        return;
      }

      if (sid) {
        setShouldFetchOrder(true);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartCleared'));
        setLoading(false);
        return;
      }

      if (pid) {
        // Only treat as a confirmed purchase if Stripe returned 'succeeded'
        const redirectStatus = params.get('redirect_status');
        if (redirectStatus !== 'succeeded') {
          // Abandoned or failed payment — do not clear cart or fetch order
          setLoading(false);
          return;
        }
        setShouldFetchOrder(true);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartCleared'));
        setLoading(false);
      }
    };

    evaluateCheckoutFlow();

    return () => {
      isActive = false;
    };
  }, [router]);

  useEffect(() => {
    if (!shouldFetchOrder) return;
    if (!sessionId && !paymentIntentId) return;
    let isActive = true;

    const loadOrder = async () => {
      const maxRetries = 5;
      const retryDelay = 2000; // 2 seconds between retries
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!isActive) return;
        
        try {
          setDetailsError(null);
          const endpoint = sessionId
            ? `/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`
            : `/api/orders/by-payment-intent?payment_intent=${encodeURIComponent(paymentIntentId!)}`;
          const response = await fetch(endpoint);
          
          if (!isActive) return;
          
          if (!response.ok) {
            if (response.status === 404 && attempt < maxRetries - 1) {
              // Order not found yet, wait and retry
              console.log(`Order not found, retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            
            const payload = await response.json().catch(() => ({}));
            setDetailsError(payload?.error ?? 'Unable to load order details.');
            setOrderDetails(null);
            return;
          }

          const payload = await response.json();
          if (!isActive) return;
          
          if (payload?.data) {
            setOrderDetails({
              orderNumber: payload.data.orderNumber,
              totalAmount: payload.data.totalAmount,
              status: payload.data.status,
              items: payload.data.items || [],
              currency: payload.data.currency || 'USD',
            });
            return; // Success, exit retry loop
          } else if (attempt < maxRetries - 1) {
            // No data yet, retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            setOrderDetails(null);
          }
        } catch (error) {
          if (!isActive) return;
          
          if (attempt < maxRetries - 1) {
            console.log(`Error fetching order, retrying... (attempt ${attempt + 1}/${maxRetries})`, error);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          
          setDetailsError('Unable to load order details.');
          setOrderDetails(null);
          console.error('Order details fetch failed after retries:', error);
        }
      }
    };

    loadOrder();

    return () => {
      isActive = false;
    };
  }, [sessionId, paymentIntentId, shouldFetchOrder]);

  useEffect(() => {
    if (orderDetails?.orderNumber) {
      // If we have order details from API, clear any old sessionStorage value
      // and update with the correct order number
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('latestOrderNumber');
      }
      return;
    }
    
    // Only use sessionStorage as a fallback if we don't have API data yet
    if (initialOrderNumber) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.sessionStorage.getItem('latestOrderNumber');
    if (stored) {
      if (/^\d{6}$/.test(stored)) {
        setInitialOrderNumber(stored);
      }
      // Remove it immediately after reading to prevent reuse
      window.sessionStorage.removeItem('latestOrderNumber');
    }
  }, [initialOrderNumber, orderDetails]);

  const resolvedOrderNumber = orderDetails?.orderNumber 
    ? orderDetails.orderNumber 
    : (initialOrderNumber && /^\d{6}$/.test(initialOrderNumber) ? initialOrderNumber : null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6f0] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-2xl font-bold text-gray-900 mb-3">
          Thank you for your order!
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-gray-600 mb-6">
          We&apos;ve received your payment and are getting everything ready. Keep your order number handy for any questions.
        </motion.p>
        {resolvedOrderNumber && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="text-sm font-mono text-gray-900 break-all">{resolvedOrderNumber}</p>
          </motion.div>
        )}
        {!resolvedOrderNumber && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-gray-500 mb-6">
            Your order number will appear here once the payment confirmation completes. We&apos;ll also email it to you.
          </motion.p>
        )}
        {detailsError && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="text-xs text-red-500 mb-4">
            {detailsError}
          </motion.p>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-3">
          <Link href="/shop" className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-semibold block" aria-label="Return to Store">
            Return to Store
          </Link>
          <Link href="/" className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors block">
            Back to Home
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">You will receive an email confirmation shortly with your order details and tracking information.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbf6f0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}