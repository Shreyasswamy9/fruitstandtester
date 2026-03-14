import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/app/supabase-client';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export type CheckoutItem = {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
};

export type GuestCheckoutPayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
};

export type CustomerCheckoutPayload = {
  email?: string;
  name?: string;
  phone?: string;
};

export type CreatePaymentIntentArgs = {
  items: CheckoutItem[];
  shipping: number;
  tax: number;
  paymentIntentId?: string | null;
  guestData?: GuestCheckoutPayload;
  customerData?: CustomerCheckoutPayload;
  discountCode?: string | null;
};

export type CreatePaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
  orderNumber?: string;
};

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(async (args: CreatePaymentIntentArgs): Promise<CreatePaymentIntentResult> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      console.log('useCheckout: Creating payment intent', {
        itemsCount: args.items.length,
        shipping: args.shipping,
        tax: args.tax,
        hasCustomerData: !!args.customerData,
        hasGuestData: !!args.guestData,
      });

      const response = await fetch('/api/payment-intent', {
        method: 'POST',
        headers,
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === 'string'
          ? payload.error
          : 'Unable to initialise payment. Please try again.';
        console.error('useCheckout: Payment intent creation failed', { status: response.status, message });
        setError(message);
        throw new Error(message);
      }

      const data = (await response.json()) as CreatePaymentIntentResult;
      if (!data?.clientSecret || !data?.paymentIntentId) {
        console.error('useCheckout: Incomplete payment intent response', data);
        throw new Error('Incomplete payment intent response from server.');
      }

      console.log('useCheckout: Payment intent created successfully', {
        paymentIntentId: data.paymentIntentId,
        orderNumber: data.orderNumber,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error creating payment intent.';
      console.error('useCheckout: Error in createPaymentIntent', message);
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPaymentIntent,
    loading,
    error,
    setError,
  } as const;
};

export type CreateCheckoutSessionArgs = {
  items: CheckoutItem[];
  shipping: number;
  tax: number;
  discountCode?: string | null;
  guestData?: GuestCheckoutPayload | null;
  customerData?: CustomerCheckoutPayload | null;
};

export type CreateCheckoutSessionResult = {
  sessionId: string;
  url: string;
};

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = useCallback(async (args: CreateCheckoutSessionArgs): Promise<CreateCheckoutSessionResult> => {
    try {
      setLoading(true);
      setError(null);

      console.log('useStripeCheckout: Creating checkout session', {
        itemsCount: args.items.length,
        shipping: args.shipping,
        tax: args.tax,
        hasCustomerData: !!args.customerData,
        hasGuestData: !!args.guestData,
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === 'string'
          ? payload.error
          : 'Unable to start checkout. Please try again.';
        console.error('useStripeCheckout: Checkout session creation failed', { status: response.status, message });
        setError(message);
        throw new Error(message);
      }

      const data = (await response.json()) as CreateCheckoutSessionResult;
      if (!data?.sessionId || !data?.url) {
        console.error('useStripeCheckout: Incomplete checkout session response', data);
        throw new Error('Incomplete checkout session response from server.');
      }

      console.log('useStripeCheckout: Checkout session created successfully', {
        sessionId: data.sessionId,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error creating checkout session.';
      console.error('useStripeCheckout: Error in createCheckoutSession', message);
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createCheckoutSession,
    loading,
    error,
    setError,
  } as const;
};