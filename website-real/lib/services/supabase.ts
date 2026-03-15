// Supabase-based database services to replace MongoDB
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { TICKETS_TABLE, TICKET_MESSAGES_TABLE } from '@/lib/tickets/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function hasValidSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  return ![
    'supabase.com/dashboard/project/_/settings/api',
    'your-project-url',
    'your-anon-key',
    'your-publishable-key',
    'your_service_role_key_here',
  ].some((placeholder) => supabaseUrl.includes(placeholder) || supabaseKey.includes(placeholder));
}

let cachedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseServerClient() {
  if (!hasValidSupabaseConfig()) {
    return null;
  }

  cachedSupabaseClient ??= createClient(supabaseUrl!, supabaseKey!);
  return cachedSupabaseClient;
}

const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseServerClient();

    if (!client) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
      );
    }

    const value = Reflect.get(client as object, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// Types for Supabase tables
export interface Product {
  is_active: boolean;
  stock_quantity: number;
  quantity: number;
  unit_price: number;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  images: string[];
  hover_image?: string;
  inventory_quantity: number;
  inventory_low_stock_threshold?: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  active: boolean;
  featured: boolean;
  weight?: number;
  dimensions_length?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  created_at: string;
  updated_at: string;
  // Joined product data
  product?: Product;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
  cart_items?: CartItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  image?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  email: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment_method: 'stripe' | 'paypal' | 'cash';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_id?: string;
  stripe_session_id?: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total_amount: number;
  currency: string;
  notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

// Product Service
export class SupabaseProductService {
  static async getProducts(options: {
    category?: string;
    featured?: boolean;
    active?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('products')
      .select('*');

    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }
    if (options.active !== undefined) {
      query = query.eq('active', options.active);
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
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  }

  static async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  }

  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  static async createProfile(profile: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    role?: string;
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: {
    name?: string;
    phone?: string;
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}


// Cart Service
export class SupabaseCartService {
  static async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      return null;
    }
    try {
      return await this.getOrCreateCart(userId, sessionId);
    } catch {
      return null;
    }
  }

  static async createCart(userId?: string, sessionId?: string) {
    const cartData: Partial<Cart> = {};
    if (userId) {
      cartData.user_id = userId;
    } else if (sessionId) {
      cartData.session_id = sessionId;
    }

    const { data, error } = await supabase
      .from('carts')
      .insert(cartData)
      .select()
      .single();

    if (error) throw error;
    return { ...data, cart_items: [] } as Cart & { cart_items: CartItem[] };
  }

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

    const { data: existingCart } = await query.maybeSingle();

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
    size?: string;
    color?: string;
    price: number;
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

    if (item.size) {
      query = query.eq('size', item.size);
    } else {
      query = query.is('size', null);
    }

    if (item.color) {
      query = query.eq('color', item.color);
    } else {
      query = query.is('color', null);
    }

    const { data: existingItem } = await query.maybeSingle();

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

// Support Ticket Types
export interface SupportTicket {
  id: string;
  ticket_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  order_id?: string;
  product_id?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assigned_to?: string;
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id?: string;
  sender_type: 'user' | 'admin' | 'system';
  message: string;
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }>;
  is_internal: boolean;
  created_at: string;
}

// Support Ticket Service
export class SupabaseTicketService {
  static async createTicket(ticketData: Omit<SupportTicket, 'id' | 'ticket_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from(TICKETS_TABLE)
      .insert([ticketData])
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  }

  static async getTicket(ticketId: string) {
    // Fetch the ticket row by public ticket_id
    const { data: ticket, error: ticketError } = await supabase
      .from(TICKETS_TABLE)
      .select('*')
      .eq('ticket_id', ticketId)
      .single();

    if (ticketError) throw ticketError;

    // Fetch messages separately by internal UUID
    const { data: messages, error: messagesError } = await supabase
      .from(TICKET_MESSAGES_TABLE)
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return { ...(ticket as SupportTicket), ticket_messages: (messages || []) as TicketMessage[] };
  }

  static async getUserTickets(userId: string) {
    const { data, error } = await supabase
      .from(TICKETS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SupportTicket[];
  }

  static async getTicketsByEmail(email: string) {
    const { data, error } = await supabase
      .from(TICKETS_TABLE)
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SupportTicket[];
  }

  static async updateTicketStatus(ticketId: string, status: SupportTicket['status']) {
    const { data, error } = await supabase
      .from(TICKETS_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('ticket_id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  }

  static async addTicketMessage(ticketId: string, messageData: Omit<TicketMessage, 'id' | 'created_at'>) {
    // First get the ticket UUID from ticket_id
    const { data: ticket, error: ticketError } = await supabase
      .from(TICKETS_TABLE)
      .select('id')
      .eq('ticket_id', ticketId)
      .single();

    if (ticketError) throw ticketError;

    const { data, error } = await supabase
      .from(TICKET_MESSAGES_TABLE)
      .insert([{ ...messageData, ticket_id: ticket.id }])
      .select()
      .single();

    if (error) throw error;
    return data as TicketMessage;
  }

  static async getTicketMessages(ticketId: string) {
    // First get the ticket UUID from ticket_id
    const { data: ticket, error: ticketError } = await supabase
      .from(TICKETS_TABLE)
      .select('id')
      .eq('ticket_id', ticketId)
      .single();

    if (ticketError) throw ticketError;

    const { data, error } = await supabase
      .from(TICKET_MESSAGES_TABLE)
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TicketMessage[];
  }

  static async getAllTickets(options: {
    status?: SupportTicket['status'];
    category?: string;
    priority?: SupportTicket['priority'];
    assigned_to?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from(TICKETS_TABLE)
      .select('*');

    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.priority) {
      query = query.eq('priority', options.priority);
    }
    if (options.assigned_to) {
      query = query.eq('assigned_to', options.assigned_to);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as SupportTicket[];
  }

  static async assignTicket(ticketId: string, assignedTo: string) {
    const { data, error } = await supabase
      .from(TICKETS_TABLE)
      .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
      .eq('ticket_id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  }
}