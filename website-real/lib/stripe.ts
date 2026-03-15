import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

let cachedStripe: Stripe | null = null;

export function getServerStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return null;
  }

  cachedStripe ??= new Stripe(stripeSecretKey);
  return cachedStripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, property, receiver) {
    const client = getServerStripe();

    if (!client) {
      throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
    }

    const value = Reflect.get(client as object, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default stripePromise;