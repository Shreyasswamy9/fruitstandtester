import { NextRequest, NextResponse } from 'next/server';
import { SupabaseOrderService } from '@/lib/services/supabase-existing';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  }

  try {
    const order = await SupabaseOrderService.getOrderByStripeSession(sessionId);

    if (!order) {
      // 1. Fetch session from Stripe
      console.log('Order not found in DB for session:', sessionId);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // 2. If paid, attempt to sync/create the order immediately (Hybrid approach)
      if (session && session.payment_status === 'paid') {
        console.log('Session is paid, attempting interactive sync for session:', sessionId);
        const syncedOrder = await SupabaseOrderService.syncOrderFromStripeSession(session);
        if (syncedOrder) {
          console.log('Successfully synced order:', syncedOrder.order_number);
          return NextResponse.json({
            data: {
              orderNumber: syncedOrder.order_number,
              totalAmount: syncedOrder.total_amount,
              status: syncedOrder.status,
              items: (syncedOrder.order_items || []).map((item: any) => ({
                id: item.product_id || item.id,
                name: item.product_name || item.name || 'Product',
                price: Number(item.price || item.unit_price || 0),
                quantity: Number(item.quantity || 1),
              })),
              currency: 'USD',
            },
          });
        } else {
          console.log('Sync returned null for session:', sessionId);
        }
      } else {
        console.log('Session payment status:', session?.payment_status);
      }

      return NextResponse.json({ 
        error: 'Order not found yet. It may still be processing.',
        data: null 
      }, { status: 404 });
    }

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
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String((error as { message: unknown }).message ?? '');
      if (message.toLowerCase().includes('no rows')) {
        return NextResponse.json({ data: null }, { status: 404 });
      }
    }
    console.error('Orders by session lookup failed:', error);
    return NextResponse.json({ error: 'Unable to find order for session' }, { status: 500 });
  }
}
