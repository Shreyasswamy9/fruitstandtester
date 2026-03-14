import { supabase } from '@/app/supabase-client';
import { readCartMetadata } from '@/lib/stripeCartMetadata';
import { generateOrderNumber } from '@/lib/orderNumbers';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Helper: safe JSON parse
function safeJsonParse<T = unknown>(value: unknown, fallback: T): T {
  try {
    if (typeof value === 'string') return JSON.parse(value) as T
    if (value === undefined || value === null) return fallback
    return value as T
  } catch {
    return fallback
  }
}

type OrderCartItem = {
  id?: string
  productId?: string
  variantId?: string
  name?: string
  title?: string
  image?: string
  product?: { images?: string[] }
  price?: number | string
  unitPrice?: number | string
  quantity?: number | string
  qty?: number | string
  size?: string
  selectedSize?: string
  color?: string
};

type GuestAddress = {
  street?: string
  street2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
};

type GuestPayload = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: GuestAddress
};

type CustomerPayload = {
  name?: string
  email?: string
  phone?: string
};

// Create service role client for admin operations
// Fallback to regular client if service role key is not set (development mode)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key_here'
  ? createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  : supabase; // Fallback to regular client for development

// Types matching your existing schema
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  stripe_price_id?: string;
  stripe_product_id?: string;
  image_url: string;
  hover_image_url?: string;
  is_active: boolean;
  featured: boolean;
  stock_quantity: number;
  material?: string;
  care_instructions?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  product_variants?: ProductVariant[];
  product_images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  stripe_price_id?: string;
  size?: string;
  color?: string;
  color_hex?: string;
  gender?: string;
  sku?: string;
  stock_quantity: number;
  price_adjustment: number;
  is_available: boolean;
  variant_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined data
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_number?: string;
  carrier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  product_image_url?: string;
  variant_details?: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

// Product Service
export class SupabaseProductService {
  static async getProducts(options: {
    category_id?: string;
    featured?: boolean;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `);

    if (options.category_id) {
      query = query.eq('category_id', options.category_id);
    }
    if (options.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }
    if (options.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  }

  static async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  }

  static async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Product;
  }
}

// Cart Service
export class SupabaseCartService {
  static async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    // First try to find existing cart
    let query = supabase.from('carts').select(`
      *,
      cart_items (
        *,
        product:products (*),
        variant:product_variants (*)
      )
    `);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data: existingCart } = await query.single();

    if (existingCart) {
      return existingCart as Cart & { cart_items: CartItem[] };
    }

    // Create new cart if none exists
    const cartData: Partial<Cart> = {};
    if (userId) {
      cartData.user_id = userId;
    } else {
      cartData.session_id = sessionId;
    }

    const { data: newCart, error } = await supabase
      .from('carts')
      .insert(cartData)
      .select()
      .single();

    if (error) throw error;

    return { ...newCart, cart_items: [] } as Cart & { cart_items: CartItem[] };
  }

  static async addToCart(cartId: string, item: {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }) {
    // Check if item already exists
    let query = supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', item.product_id);

    if (item.variant_id) {
      query = query.eq('variant_id', item.variant_id);
    } else {
      query = query.is('variant_id', null);
    }

    const { data: existingItem } = await query.single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + item.quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data as CartItem;
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, ...item })
        .select()
        .single();

      if (error) throw error;
      return data as CartItem;
    }
  }

  static async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(itemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data as CartItem;
  }

  static async removeFromCart(itemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  static async clearCart(cartId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw error;
  }
}

// Order Service
export class SupabaseOrderService {
  static async getOrders(userId: string, options: {
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Order[];
  }

  static async getOrder(id: string, userId?: string) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data as Order;
  }

  static async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  static async updatePaymentStatus(id: string, payment_status: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  static async updateOrderWithShipping(id: string, updateData: {
    shipping_name?: string;
    shipping_email?: string;
    shipping_phone?: string | null;
    shipping_address_line1?: string;
    shipping_address_line2?: string | null;
    shipping_city?: string;
    shipping_state?: string;
    shipping_postal_code?: string;
    shipping_country?: string;
    payment_status?: string;
    status?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  static async getOrderByStripeSession(stripeSessionId: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('stripe_checkout_session_id', stripeSessionId)
      .maybeSingle();

    if (error) throw error;
    return data as Order;
  }

  static async getOrderByPaymentIntent(paymentIntentId: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();

    if (error) throw error;
    return data as Order;
  }

  static async syncOrderFromStripeSession(session: Stripe.Checkout.Session) {
    console.log('Syncing order from Stripe session:', session.id);

    if (session.payment_status !== 'paid') {
      console.warn('Skipping sync because payment is not completed.', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
      return null;
    }

    // 1. Check if order already exists
    try {
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('stripe_checkout_session_id', session.id)
        .maybeSingle();

      if (existingOrder) {
        console.log(`Order already exists for session ${session.id}: ${existingOrder.id}`);
        return existingOrder;
      }
    } catch (err) {
      console.log('Error checking for existing order (ignoring):', err);
    }

    // 2. Extract data from session
    const customerDetails = session.customer_details;
    const shippingDetails = (session as any).shipping_details?.address || customerDetails?.address;

    const metadata = session.metadata ?? {};
    const cartJson = readCartMetadata(metadata) ?? '[]';
    const cart = safeJsonParse<OrderCartItem[]>(cartJson, []);
    const guestData = safeJsonParse<GuestPayload>(metadata.guest ?? '{}', {});
    const customerData = safeJsonParse<CustomerPayload>(metadata.customer ?? '{}', {});
    const shippingAmount = Number(metadata.shipping ?? 0);
    
    // Use Stripe's calculated tax instead of metadata tax
    const taxAmount = session.total_details?.amount_tax 
      ? Number(session.total_details.amount_tax) / 100 
      : Number(metadata.tax ?? 0);
    
    const orderNumber = (metadata.order_number as string) || generateOrderNumber();

    // Recalculate subtotal
    const cartItems = Array.isArray(cart) ? cart : [];
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price ?? item.unitPrice ?? 0);
      const qty = Number(item.quantity ?? item.qty ?? 1);
      return sum + price * qty;
    }, 0);

    const stripePaymentIntent = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

    // 3. Create Order
    const orderPayload = {
      user_id: null,
      order_number: orderNumber,
      status: 'confirmed',
      payment_status: 'paid',
      stripe_payment_intent_id: stripePaymentIntent,
      stripe_checkout_session_id: session.id,
      total_amount: subtotal + shippingAmount + taxAmount,
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: 0,
      shipping_name: (guestData?.firstName && guestData?.lastName)
        ? `${guestData.firstName} ${guestData.lastName}`
        : (customerData?.name || customerDetails?.name || ''),
      shipping_email: customerData?.email || customerDetails?.email || guestData?.email || '',
      shipping_phone: guestData?.phone || customerData?.phone || customerDetails?.phone || '',
      shipping_address_line1: shippingDetails?.line1 || guestData?.address?.street || '',
      shipping_address_line2: shippingDetails?.line2 || guestData?.address?.street2 || '',
      shipping_city: shippingDetails?.city || guestData?.address?.city || '',
      shipping_state: shippingDetails?.state || guestData?.address?.state || '',
      shipping_postal_code: shippingDetails?.postal_code || guestData?.address?.zipCode || '',
      shipping_country: shippingDetails?.country || guestData?.address?.country || 'US',
    };

    const { data: newOrder, error: createErr } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (createErr || !newOrder) {
      console.error('Failed to create order in Supabase', createErr);
      throw createErr || new Error('Failed to create order');
    }

    const createdOrder = newOrder as Order;
    let insertedItems: OrderItem[] = [];
    // 4. Create Order Items
    if (cartItems.length > 0) {
      const orderItemRows = cartItems.map((item) => {
        const quantity = Number(item.quantity ?? item.qty ?? 1);
        const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
        return {
          order_id: createdOrder.id,
          product_id: item.id ?? item.productId ?? null,
          variant_id: item.variantId ?? null,
          product_name: item.name ?? item.title ?? '',
          product_image_url: item.image ?? item.product?.images?.[0] ?? null,
          quantity,
          unit_price: unitPrice,
          total_price: unitPrice * quantity,
          variant_details: {
            size: item.size ?? item.selectedSize ?? null,
            color: item.color ?? null,
            price: unitPrice,
            image: item.image ?? null
          }
        };
      });

      const { data: insertedItemsData, error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemRows)
      .select(); // returns inserted rows

      insertedItems = insertedItemsData ?? [];

      if (itemsErr) {
        console.error('Failed to insert order items, rolling back order', itemsErr);
        await supabaseAdmin.from('orders').delete().eq('id', createdOrder.id);
        throw itemsErr;
      }

      console.log(`Inserted ${orderItemRows.length} order items for order ${createdOrder.id}`);
    }

    return {
      ...createdOrder,
      order_items: insertedItems ?? [],
    };
  }
}