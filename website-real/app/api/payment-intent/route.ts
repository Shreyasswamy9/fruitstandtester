import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateOrderNumber } from '@/lib/orderNumbers';
import { cleanupCartMetadata, serializeCartItems } from '@/lib/stripeCartMetadata';

interface CheckoutItemPayload {
  productId?: string;
  name: string;
  price: number | string;
  quantity: number | string;
  image?: string;
  size?: string;
  color?: string;
}

interface GuestAddress {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface GuestPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: GuestAddress;
}

interface CustomerPayload {
  email?: string;
  name?: string;
  phone?: string;
}

interface PaymentIntentRequest {
  items?: CheckoutItemPayload[];
  shipping?: number | string;
  tax?: number | string;
  paymentIntentId?: string | null;
  guestData?: GuestPayload | null;
  customerData?: CustomerPayload | null;
  discountCode?: string | null;
}

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

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Payment intent API: Request started`);

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      console.error(`[${requestId}] Payment intent API: Missing STRIPE_SECRET_KEY`);
      return NextResponse.json(
        { error: 'Stripe secret key is not configured on the server.' },
        { status: 500 }
      );
    }

    let payload: PaymentIntentRequest;
    try {
      payload = (await request.json()) as PaymentIntentRequest;
      console.log(`[${requestId}] Payment intent API: Payload parsed successfully`);
    } catch (error) {
      console.error(`[${requestId}] Payment intent API: JSON parse failed`, error);
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    let stripe: Stripe;
    try {
      stripe = new Stripe(stripeSecret);
      console.log(`[${requestId}] Payment intent API: Stripe client initialized`);
    } catch (error) {
      console.error(`[${requestId}] Payment intent API: Failed to initialize Stripe`, error);
      return NextResponse.json(
        { error: 'Failed to initialize payment processor.' },
        { status: 500 }
      );
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    const shipping = typeof payload.shipping === 'number' ? payload.shipping : Number(payload.shipping || 0);
    const tax = typeof payload.tax === 'number' ? payload.tax : Number(payload.tax || 0);
    const guestData = payload.guestData ?? undefined;
    const customerData = payload.customerData ?? undefined;

    // Validate shipping and tax are finite numbers
    if (!Number.isFinite(shipping)) {
      console.error(`[${requestId}] Payment intent API: Invalid shipping value`, payload.shipping);
      return NextResponse.json(
        { error: 'Invalid shipping amount.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(tax)) {
      console.error(`[${requestId}] Payment intent API: Invalid tax value`, payload.tax);
      return NextResponse.json(
        { error: 'Invalid tax amount.' },
        { status: 400 }
      );
    }

    // Validate items structure
    if (!Array.isArray(items)) {
      console.error(`[${requestId}] Payment intent API: Items is not an array`, typeof items);
      return NextResponse.json(
        { error: 'Cart items must be an array.' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Payment intent API: Validated inputs`, {
      itemsCount: items.length,
      shipping,
      tax,
      hasCustomerData: !!customerData,
      hasGuestData: !!guestData,
    });

    const subtotal = items.reduce((sum, item) => {
      const unitPrice = Number(item.price || 0);
      const qty = Number(item.quantity || 0);

      if (!Number.isFinite(unitPrice)) {
        console.error(`[${requestId}] Payment intent API: Invalid item price`, item);
        throw new Error(`Invalid price for item: ${item.name}`);
      }

      if (!Number.isFinite(qty) || qty <= 0) {
        console.error(`[${requestId}] Payment intent API: Invalid item quantity`, item);
        throw new Error(`Invalid quantity for item: ${item.name}`);
      }

      return sum + unitPrice * qty;
    }, 0);

    if (!Number.isFinite(subtotal)) {
      console.error(`[${requestId}] Payment intent API: Subtotal calculation resulted in non-finite number`);
      return NextResponse.json(
        { error: 'Failed to calculate cart total.' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Payment intent API: Subtotal calculated`, { subtotal, itemsCount: items.length });

    const normalizedDiscountCode = typeof payload.discountCode === 'string'
      ? payload.discountCode.trim().toUpperCase()
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

    if (!Number.isFinite(discountAmount)) {
      console.error(`[${requestId}] Payment intent API: Discount amount calculation invalid`, {
        rawDiscountAmount,
        subtotal,
        normalizedDiscountCode,
      });
      return NextResponse.json(
        { error: 'Failed to apply discount.' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Payment intent API: Discount calculated`, {
      code: normalizedDiscountCode || 'none',
      amount: discountAmount,
    });

    const total = subtotal - discountAmount + shipping + tax;
    const amountInCents = Math.round(total * 100);

    // Comprehensive amount validation
    if (!Number.isFinite(total)) {
      console.error(`[${requestId}] Payment intent API: Total is not a finite number`, {
        subtotal,
        discountAmount,
        shipping,
        tax,
        total,
      });
      return NextResponse.json(
        { error: 'Cart total calculation error. Please try again.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amountInCents) || !Number.isInteger(amountInCents)) {
      console.error(`[${requestId}] Payment intent API: Amount in cents is not a valid integer`, {
        total,
        amountInCents,
      });
      return NextResponse.json(
        { error: 'Failed to calculate payment amount.' },
        { status: 400 }
      );
    }

    if (amountInCents <= 0) {
      console.warn(`[${requestId}] Payment intent API: Amount is zero or negative`, {
        total,
        amountInCents,
      });
      return NextResponse.json(
        { error: 'Cart total must be greater than zero before initiating payment.' },
        { status: 400 }
      );
    }

    // Stripe maximum amount: $999,999.99 USD
    const STRIPE_MAX_AMOUNT = 99999999; // $999,999.99
    if (amountInCents > STRIPE_MAX_AMOUNT) {
      console.error(`[${requestId}] Payment intent API: Amount exceeds Stripe maximum`, {
        amountInCents,
        maxAllowed: STRIPE_MAX_AMOUNT,
      });
      return NextResponse.json(
        { error: 'Cart total exceeds maximum allowed amount.' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Payment intent API: Total calculated`, {
      subtotal,
      discountAmount,
      shipping,
      tax,
      total,
      amountInCents,
    });

    const contactEmail = customerData?.email || guestData?.email || undefined;
    const contactName = guestData?.firstName && guestData?.lastName
      ? `${guestData.firstName} ${guestData.lastName}`
      : customerData?.name;

    const baseMetadata = {
      subtotal: String(subtotal),
      discount_code: normalizedDiscountCode || '',
      discount_amount: String(discountAmount),
      shipping: String(shipping),
      tax: String(tax),
      guest: JSON.stringify(guestData || {}),
      customer: JSON.stringify(customerData || {}),
    } satisfies Stripe.MetadataParam;

    let cartMetadata: Record<string, string>;
    try {
      cartMetadata = serializeCartItems(items);
      console.log(`[${requestId}] Payment intent API: Cart metadata serialized`, {
        keys: Object.keys(cartMetadata).length,
      });
    } catch (error) {
      console.error(`[${requestId}] Payment intent API: Failed to serialize cart metadata`, error);
      return NextResponse.json(
        { error: 'Failed to process cart items.' },
        { status: 400 }
      );
    }

    const generatedOrderNumber = generateOrderNumber();
    console.log(`[${requestId}] Payment intent API: Order number generated`, { orderNumber: generatedOrderNumber });

    let orderNumber = generatedOrderNumber;

    const { paymentIntentId } = payload;

    let paymentIntent: Stripe.PaymentIntent;

    if (paymentIntentId) {
      // Attempt to retrieve to preserve order number if already set
      let existingIntent: Stripe.PaymentIntent | undefined;
      try {
        console.log(`[${requestId}] Payment intent API: Retrieving existing payment intent`, { paymentIntentId });
        existingIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log(`[${requestId}] Payment intent API: Successfully retrieved existing intent`, {
          id: existingIntent.id,
          status: existingIntent.status,
        });
      } catch (error) {
        console.error(`[${requestId}] Payment intent API: Failed to retrieve existing intent`, {
          paymentIntentId,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue with creation if retrieval fails
      }

      orderNumber = existingIntent?.metadata?.order_number || generatedOrderNumber;

      let cleanupMetadata: Record<string, string>;
      try {
        cleanupMetadata = cleanupCartMetadata(existingIntent?.metadata);
        console.log(`[${requestId}] Payment intent API: Cleanup metadata prepared`);
      } catch (error) {
        console.error(`[${requestId}] Payment intent API: Failed to prepare cleanup metadata`, error);
        return NextResponse.json(
          { error: 'Failed to process payment update.' },
          { status: 500 }
        );
      }

      const intentMetadata = {
        ...cleanupMetadata,
        order_number: orderNumber,
        ...baseMetadata,
        ...cartMetadata,
      } satisfies Stripe.MetadataParam;

      const shippingDetails = buildStripeShipping(contactName, guestData);

      try {
        console.log(`[${requestId}] Payment intent API: Updating payment intent`, {
          paymentIntentId,
          amountInCents,
          orderNumber,
        });
        paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
          amount: amountInCents,
          currency: 'usd',
          metadata: intentMetadata,
          receipt_email: contactEmail,
          shipping: shippingDetails,
        });
        console.log(`[${requestId}] Payment intent API: Payment intent updated successfully`, {
          id: paymentIntent.id,
          status: paymentIntent.status,
          hasSecret: !!paymentIntent.client_secret,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[${requestId}] Payment intent API: Failed to update payment intent`, {
          paymentIntentId,
          error: errorMsg,
        });
        throw error;
      }

      if (!paymentIntent.client_secret) {
        console.warn(`[${requestId}] Payment intent API: No client secret after update, retrieving...`);
        try {
          paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          console.log(`[${requestId}] Payment intent API: Retrieved payment intent after update`, {
            hasSecret: !!paymentIntent.client_secret,
          });
        } catch (error) {
          console.error(`[${requestId}] Payment intent API: Failed to retrieve intent after update`, error);
          throw error;
        }
      }
    } else {
      const metadata = {
        order_number: orderNumber,
        ...baseMetadata,
        ...cartMetadata,
      } satisfies Stripe.MetadataParam;

      const createParams: Stripe.PaymentIntentCreateParams = {
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata,
        receipt_email: contactEmail,
      };

      const shippingDetails = buildStripeShipping(contactName, guestData);
      if (shippingDetails) {
        createParams.shipping = shippingDetails;
      }

      try {
        console.log(`[${requestId}] Payment intent API: Creating new payment intent`, {
          amountInCents,
          orderNumber,
          hasShipping: !!shippingDetails,
          hasEmail: !!contactEmail,
        });
        paymentIntent = await stripe.paymentIntents.create(createParams);
        console.log(`[${requestId}] Payment intent API: Payment intent created successfully`, {
          id: paymentIntent.id,
          status: paymentIntent.status,
          hasSecret: !!paymentIntent.client_secret,
          orderNumber: paymentIntent.metadata?.order_number,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[${requestId}] Payment intent API: Failed to create payment intent`, {
          error: errorMsg,
          amountInCents,
        });
        throw error;
      }
    }

    // Final validation of payment intent
    if (!paymentIntent) {
      console.error(`[${requestId}] Payment intent API: Payment intent is null after creation/update`);
      return NextResponse.json(
        { error: 'Failed to create payment intent.' },
        { status: 500 }
      );
    }

    if (!paymentIntent.id) {
      console.error(`[${requestId}] Payment intent API: Payment intent has no ID`, paymentIntent);
      return NextResponse.json(
        { error: 'Invalid payment intent returned from Stripe.' },
        { status: 500 }
      );
    }

    if (!paymentIntent.client_secret) {
      console.error(`[${requestId}] Payment intent API: No client secret in final payment intent`, {
        id: paymentIntent.id,
        status: paymentIntent.status,
      });
      return NextResponse.json(
        { error: 'Unable to obtain a client secret from Stripe.' },
        { status: 500 }
      );
    }

    // Ensure order number exists
    const finalOrderNumber = paymentIntent.metadata?.order_number ?? orderNumber;
    if (!finalOrderNumber || !/^\d+$/.test(finalOrderNumber)) {
      console.error(`[${requestId}] Payment intent API: Invalid or missing order number`, {
        metadata: paymentIntent.metadata,
        generatedOrderNumber: orderNumber,
      });
      return NextResponse.json(
        { error: 'Failed to generate order number.' },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Payment intent API: Response prepared successfully`, {
      paymentIntentId: paymentIntent.id,
      orderNumber: finalOrderNumber,
      clientSecretPresent: true,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderNumber: finalOrderNumber,
    });
  } catch (error) {
    const requestId = Math.random().toString(36).substring(7);
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'Unknown';

    console.error(`[${requestId}] Payment intent creation failed`, {
      error: errorMsg,
      errorName,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Determine appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid payment request. Please check your cart.' },
          { status: 400 }
        );
      }
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a moment.' },
          { status: 429 }
        );
      }
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Payment service authentication failed.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    );
  }
}

function buildStripeShipping(name: string | undefined, guestData?: GuestPayload) {
  if (!guestData?.address) {
    return undefined;
  }

  const address = guestData.address;
  const trimmedName = name?.trim();

  // Validate required address fields
  if (!address.street || !address.city || !address.state || !address.zipCode) {
    console.warn('buildStripeShipping: Missing required address fields', {
      street: !!address.street,
      city: !!address.city,
      state: !!address.state,
      zipCode: !!address.zipCode,
    });
    return undefined;
  }

  return {
    name: trimmedName && trimmedName.length > 0 ? trimmedName : 'Guest',
    address: {
      line1: address.street,
      line2: address.street2 || undefined,
      city: address.city,
      state: address.state,
      postal_code: address.zipCode,
      country: address.country || 'US',
    },
    phone: guestData.phone || undefined,
  } satisfies Stripe.PaymentIntentCreateParams.Shipping;
}
