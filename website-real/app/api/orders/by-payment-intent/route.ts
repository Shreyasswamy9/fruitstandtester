import { NextRequest, NextResponse } from 'next/server';
import { SupabaseOrderService } from '@/lib/services/supabase-existing';
import Stripe from 'stripe';

let cachedStripe: Stripe | null = null;

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return null;
  }

  cachedStripe ??= new Stripe(stripeSecretKey);
  return cachedStripe;
}

export async function GET(request: NextRequest) {
  const paymentIntentId = request.nextUrl.searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'payment_intent is required' }, { status: 400 });
  }

  try {
    const order = await SupabaseOrderService.getOrderByPaymentIntent(paymentIntentId);

    if (order) {
      return NextResponse.json({
        data: {
          orderNumber: order.order_number,
          totalAmount: order.total_amount,
          status: order.status,
          items: (order.order_items || []).map((item: any) => ({
            id: item.product_id || item.id,
            name: item.product_name || item.name || 'Product',
            price: Number(item.price || item.unit_price || 0),
            quantity: Number(item.quantity || 1),
          })),
          currency: 'USD',
        },
      });
    }
  } catch (error) {
    // Continue to Stripe fallback if Supabase lookup fails
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String((error as { message: unknown }).message ?? '');
      if (!message.toLowerCase().includes('no rows')) {
        console.error('Orders by payment intent lookup failed:', error);
      }
    } else {
      console.error('Orders by payment intent lookup failed:', error);
    }
  }

  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is disabled for this environment', data: null }, { status: 503 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Only return order data for payment intents that have actually succeeded.
    // Abandoned intents (e.g. created when a user browses the cart) must not
    // be treated as completed purchases.
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed', data: null }, { status: 404 });
    }

    const amountReceived = typeof paymentIntent.amount_received === 'number'
      ? paymentIntent.amount_received
      : paymentIntent.amount;

    return NextResponse.json({
      data: {
        orderNumber: paymentIntent.metadata?.order_number ?? paymentIntent.id,
        totalAmount: typeof amountReceived === 'number' ? amountReceived / 100 : null,
        status: paymentIntent.status,
        items: [], // No items available from PaymentIntent alone
        currency: 'USD',
      },
    });
  } catch (error) {
    console.error('Stripe payment intent retrieval failed:', error);
    return NextResponse.json({ error: 'Unable to find order for payment intent' }, { status: 500 });
  }
}
