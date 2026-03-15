import { NextRequest, NextResponse } from 'next/server';
import { SupabaseCartService, SupabaseProductService, getSupabaseServerClient } from '@/lib/services/supabase';

function getConfiguredSupabaseOrResponse() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Supabase is not configured for this environment' },
      { status: 503 }
    );
  }

  return supabase;
}

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const supabase = getConfiguredSupabaseOrResponse();
    if (supabase instanceof NextResponse) {
      return supabase;
    }

    // Get user from auth (optional for guest users)
    let userId = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    const sessionId = request.headers.get('x-session-id');

    if (!userId && !sessionId) {
      console.warn('GET /api/cart missing user and sessionId');
      return NextResponse.json(
        { success: false, error: 'Authentication or session ID required' },
        { status: 400 }
      );
    }

    const cart = await SupabaseCartService.getCart(userId || undefined, sessionId || undefined);

    return NextResponse.json({
      success: true,
      data: cart || { cart_items: [] }
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const supabase = getConfiguredSupabaseOrResponse();
    if (supabase instanceof NextResponse) {
      return supabase;
    }

    // Get user from auth (optional for guest users)
    let userId = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    const sessionId = request.headers.get('x-session-id');

    if (!userId && !sessionId) {
      console.warn('POST /api/cart missing user and sessionId');
      return NextResponse.json(
        { success: false, error: 'Authentication or session ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { productId, quantity, size, color } = body;

    // Validate required fields
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Product ID and valid quantity required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await SupabaseProductService.getProduct(productId);
    console.debug('Product fetched for addToCart:', { productId, product });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Support multiple possible field names from schema
    const isActive = product.is_active ?? product.active ?? true;
    const inventoryQty = Number(product.stock_quantity ?? product.inventory_quantity ?? product.quantity ?? 0);
    const price = Number(product.price ?? product.unit_price ?? 0);

    // Detailed checks with logs
    if (!isActive) {
      console.warn('Product inactive:', productId, { isActive });
      return NextResponse.json(
        { success: false, error: 'Product not available' },
        { status: 400 }
      );
    }

    if (inventoryQty < quantity) {
      console.warn('Insufficient inventory', { productId, inventoryQty, requested: quantity });
      return NextResponse.json(
        { success: false, error: 'Insufficient inventory' },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await SupabaseCartService.getCart(userId || undefined, sessionId || undefined);
    
    if (!cart) {
      cart = await SupabaseCartService.createCart(userId || undefined, sessionId || undefined);
      console.debug('Created new cart', { cart });
    }

    // Add item to cart
    let cartItem;
    try {
      cartItem = await SupabaseCartService.addToCart(cart.id, {
        product_id: productId,
        quantity,
        size,
        color,
        price
      });
    } catch (svcErr) {
      console.error('SupabaseCartService.addToCart error:', svcErr);
      return NextResponse.json(
        { success: false, error: 'Failed to add item to cart (service error)' },
        { status: 500 }
      );
    }

    // Verify returned cartItem
    if (!cartItem) {
      console.error('addToCart returned no item', { cartId: cart.id, productId });
      return NextResponse.json(
        { success: false, error: 'Failed to add item to cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cartItem
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Item ID and valid quantity required' },
        { status: 400 }
      );
    }

    if (quantity === 0) {
      // Remove item
      await SupabaseCartService.removeFromCart(itemId);
      return NextResponse.json({ success: true, message: 'Item removed' });
    } else {
      // Update quantity
      const cartItem = await SupabaseCartService.updateCartItem(itemId, quantity);
      return NextResponse.json({
        success: true,
        data: cartItem
      });
    }

  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart or remove item
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getConfiguredSupabaseOrResponse();
    if (supabase instanceof NextResponse) {
      return supabase;
    }

    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('itemId');

    if (itemId) {
      // Remove specific item
      await SupabaseCartService.removeFromCart(itemId);
      return NextResponse.json({ success: true, message: 'Item removed' });
    } else {
      // Clear entire cart
      // Get user from auth (optional for guest users)
      let userId = null;
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }
      
      const sessionId = request.headers.get('x-session-id');

      if (!userId && !sessionId) {
        return NextResponse.json(
          { success: false, error: 'Authentication or session ID required' },
          { status: 400 }
        );
      }

      const cart = await SupabaseCartService.getCart(userId || undefined, sessionId || undefined);
      
      if (cart) {
        await SupabaseCartService.clearCart(cart.id);
      }

      return NextResponse.json({ success: true, message: 'Cart cleared' });
    }

  } catch (error) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete from cart' },
      { status: 500 }
    );
  }
}