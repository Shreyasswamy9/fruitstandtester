import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateOrderNumber } from '@/lib/orderNumbers';

export async function POST(request: NextRequest) {
  console.log('Checkout API: Request received');

  try {
    // 1. Validate Environment Variables
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const requestOrigin = request.headers.get('origin');

    // Log configuration status (DO NOT log actual keys)
    const isTestKey = stripeKey?.startsWith('sk_test_');
    console.log('Checkout API: Configuration Check', {
      hasStripeKey: !!stripeKey,
      keyType: isTestKey ? 'TEST' : (stripeKey ? 'LIVE' : 'MISSING'),
      hasBaseUrl: !!(envBaseUrl || requestOrigin),
      baseUrlValue: requestOrigin || envBaseUrl || 'n/a'
    });

    if (!stripeKey || (!envBaseUrl && !requestOrigin)) {
      const missing = [];
      if (!stripeKey) missing.push('STRIPE_SECRET_KEY');
      if (!envBaseUrl && !requestOrigin) missing.push('NEXT_PUBLIC_BASE_URL or request origin header');

      console.error('Checkout API: Missing environment variables:', missing);
      return NextResponse.json(
        { error: `Server configuration error: Missing ${missing.join(', ')}` },
        { status: 500 }
      );
    }

    // 2. Initialize Stripe client only (no Supabase client or DB writes in this route)
    const stripe = new Stripe(stripeKey);
    const baseUrl = (requestOrigin || envBaseUrl || '').replace(/\/$/, '');

    type CheckoutItemPayload = {
      price?: number | string;
      quantity?: number | string;
      name: string;
      image?: string;
      productId?: string;
      size?: string;
      color?: string;
    };

    type CheckoutRequestPayload = {
      items?: CheckoutItemPayload[];
      shipping?: number | string;
      tax?: number | string;
      discountCode?: string | null;
      guestData?: Record<string, unknown> | null;
      customerData?: {
        email?: string;
        name?: string;
        phone?: string;
      } | null;
    };

    type DiscountDefinition = {
      type: 'percent' | 'amount';
      value: number;
      label?: string;
      active: boolean;
    };

    const DISCOUNT_CODES: Record<string, DiscountDefinition> = {
      FS2026: {
        type: 'percent',
        value: 10,
        label: '10% off with FS2026',
        active: true,
      },
    };

    // 3. Parse Request
    let requestData: CheckoutRequestPayload;
    try {
      requestData = await request.json() as CheckoutRequestPayload;
    } catch (e) {
      console.error('Checkout API: Failed to parse JSON body', e);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('Checkout API: Request data parsed');
    const { items = [], shipping = 0, tax = 0, discountCode = null, guestData = null, customerData = null } = requestData;

    // 4. Auth (Optional) - preserved for logging only
    const authHeader = request.headers.get('authorization');
    console.log('Checkout API: Auth header present:', !!authHeader);
    if (authHeader) {
      try {
        // Attempt to extract token and inspect (no Supabase client call here to avoid DB ops)
        const token = authHeader.replace('Bearer ', '');
        // Note: keep token handling lightweight; actual user validation can occur in webhook if needed
        console.log('Checkout API: Received auth token (length):', token.length);
      } catch (e) {
        console.warn('Checkout API: Auth token processing error', e);
      }
    } else {
      console.log('Checkout API: No auth header, creating guest order (deferred to webhook)');
    }

    // 5. Calculate Totals
    const safeShipping = typeof shipping === 'number' ? shipping : Number(shipping || 0);
    const safeTax = typeof tax === 'number' ? tax : Number(tax || 0);

    const normalizedItems: CheckoutItemPayload[] = Array.isArray(items) ? items : [];
    const subtotal = normalizedItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    const normalizedDiscountCode = typeof discountCode === 'string'
      ? discountCode.trim().toUpperCase()
      : '';

    const discountDefinition = normalizedDiscountCode
      ? DISCOUNT_CODES[normalizedDiscountCode]
      : undefined;

    const rawDiscountAmount = discountDefinition && discountDefinition.active
      ? (discountDefinition.type === 'percent'
        ? (subtotal * discountDefinition.value) / 100
        : discountDefinition.value)
      : 0;

    const discountAmount = Math.max(0, Math.min(rawDiscountAmount, subtotal));
    const totalAmount = subtotal - discountAmount + safeShipping + safeTax;
    const orderNumber = generateOrderNumber();

    console.log('Checkout API: Order details calculated', { orderNumber, totalAmount });

    // 6. Prepare Stripe line items (unchanged except image handling)
    const discountRatio = subtotal > 0 && discountAmount > 0
      ? (subtotal - discountAmount) / subtotal
      : 1;

    const adjustedUnitAmounts = normalizedItems.map((item) => (
      Math.max(Math.round(Number(item.price || 0) * 100 * discountRatio), 0)
    ));

    const adjustedSubtotal = adjustedUnitAmounts.reduce((sum, amount, index) => (
      sum + amount * Number(normalizedItems[index]?.quantity || 0)
    ), 0);

    const targetSubtotal = Math.max(Math.round((subtotal - discountAmount) * 100), 0);
    const remainder = targetSubtotal - adjustedSubtotal;

    const lineItems = normalizedItems.map((item, index) => {
      const finalUnitAmount = Math.max(
        adjustedUnitAmounts[index] + (index === 0 ? remainder : 0),
        0
      );
      let imageUrl = item.image;
      if (imageUrl && !imageUrl.startsWith('http')) {
        const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        imageUrl = `${baseUrl}${cleanPath}`;
      }

      if (imageUrl) {
        try {
          imageUrl = encodeURI(imageUrl);
        } catch (e) {
          console.error('Checkout API: Error encoding image URL', imageUrl, e);
          imageUrl = undefined;
        }
      }

      // Only include images when the final URL is an absolute HTTP(S) URL.
      const imageIsAbsolute = typeof imageUrl === 'string' && /^https?:\/\//i.test(imageUrl);

      const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: item.name,
        metadata: {
          productId: item.productId || '',
          size: item.size || '',
          color: item.color || '',
        },
      };
      if (imageIsAbsolute && imageUrl) {
        productData.images = [imageUrl];
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: productData,
          unit_amount: finalUnitAmount,
          tax_behavior: 'exclusive', // Tax will be calculated on top of this price
        },
        quantity: Number(item.quantity || 1),
      };
    });

    if (safeShipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(safeShipping * 100),
          tax_behavior: 'exclusive', // Tax will be calculated on shipping too
        },
        quantity: 1,
      });
    }

    // Remove manual tax line item - Stripe automatic_tax will calculate it

    // 7. Create Stripe Session with metadata containing full order payload (no DB writes here)
    type GuestAddress = {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };

    const rawGuestAddress = guestData && typeof guestData === 'object' && 'address' in guestData
      ? (guestData as Record<string, unknown>).address
      : undefined;

    const guestAddress = rawGuestAddress && typeof rawGuestAddress === 'object'
      ? (rawGuestAddress as GuestAddress)
      : undefined;

    const hasGuestAddress = !!(
      guestAddress &&
      guestAddress.street &&
      guestAddress.city &&
      guestAddress.state &&
      guestAddress.zipCode
    );

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems as Stripe.Checkout.SessionCreateParams.LineItem[],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        // Required by your webhook to create the order after payment
        cart: JSON.stringify(normalizedItems || []),
        tax: String(safeTax),
        shipping: String(safeShipping),
        subtotal: String(subtotal),
        discount_code: normalizedDiscountCode || '',
        discount_amount: String(discountAmount),
        guest: JSON.stringify(guestData || {}),
        customer: JSON.stringify(customerData || {}),
        order_number: orderNumber,
        // Include any minimal identifiers needed by webhook (avoid secrets)
      },
      billing_address_collection: 'auto',
    };

    if (!hasGuestAddress) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US', 'CA'],
      };
    }

    const customerInfo = customerData ?? (guestData && typeof guestData === 'object' && 'email' in guestData
      ? guestData as { email?: string; name?: string }
      : null);
    if (customerInfo?.email) {
      sessionConfig.customer_email = customerInfo.email;
      if (customerInfo.name) {
        sessionConfig.customer_creation = 'always';
      }
    }

    console.log('Checkout API: Creating Stripe session...');
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionConfig);
      console.log('Checkout API: Stripe session created successfully', {
        id: session.id,
        url: session.url ? 'present' : 'missing',
        orderNumber: sessionConfig.metadata?.order_number,
      });
    } catch (error) {
      console.error('Checkout API: Failed to create Stripe session', error);
      throw error;
    }

    // 8. IMPORTANT: DO NOT create or update any Supabase order here.
    // All order persistence must happen in the webhook on checkout.session.completed.

    // 9. Return the Stripe session id and URL for redirect
    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout API: Unhandled error', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: message,
      },
      { status: 500 }
    );
  }
}
