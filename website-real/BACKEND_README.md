# NY E-commerce Backend

## Overview

This is a comprehensive backend implementation for the NY e-commerce application built with Next.js, MongoDB, and NextAuth.js.

## Features

### ✅ Authentication & Authorization

- User registration and login with NextAuth.js
- JWT-based session management
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt

### ✅ Product Management

- Full CRUD operations for products
- Category and subcategory support
- Inventory management with size/color variants
- Image gallery support
- SEO metadata
- Featured products
- Search and filtering capabilities

### ✅ Shopping Cart

- Session-based cart for guest users
- Persistent cart for authenticated users
- Add, update, remove items
- Size and color selection
- Automatic cart cleanup for guests

### ✅ Order Management

- Complete order creation workflow
- Inventory validation
- Shipping and billing addresses
- Payment method integration ready
- Order status tracking
- Order history for users

### ✅ Database Models

- **User**: Authentication and profile data
- **Product**: Complete product information
- **Cart**: Shopping cart with items
- **Order**: Order details and tracking

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js routes

### Products

- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/[id]` - Update product (Admin)
- `DELETE /api/products/[id]` - Delete product (Admin)

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart` - Clear cart

### Orders

- `GET /api/orders` - Get user's orders
- `GET /api/orders/[id]` - Get specific order
- `POST /api/orders` - Create new order
- `PUT /api/orders/[id]` - Update order status (Admin)

### Admin

- `POST /api/admin/seed` - Seed database with sample data

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Update `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/-ny

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Admin
ADMIN_SEED_TOKEN=your-admin-token
```

### 3. Database Setup

#### Option A: Using MongoDB locally

1. Install MongoDB on your machine
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/-ny`

#### Option B: Using MongoDB Atlas (Cloud)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update `MONGODB_URI` in `.env.local`

### 4. Seed the Database

```bash
npm run seed
```

This will create:

- Sample products (t-shirts, hats, hoodies)
- Admin user: `admin@.ny` / `admin123`

### 5. Start Development Server

```bash
npm run dev
```

## Testing the Backend

### 1. Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test Products API

```bash
# Get all products
curl http://localhost:3000/api/products

# Get featured products
curl http://localhost:3000/api/products?featured=true

# Search products
curl "http://localhost:3000/api/products?search=shirt"
```

### 3. Test Cart (Guest User)

```bash
# Add item to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "x-session-id: guest-123" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 2,
    "size": "M"
  }'

# Get cart
curl http://localhost:3000/api/cart \
  -H "x-session-id: guest-123"
```

### 4. Seed Database (Admin)

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Authorization: Bearer admin-seed-token"
```

## Database Schema

### User Schema

```typescript
{
  name: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'admin';
  emailVerified?: Date;
  image?: string;
}
```

### Product Schema

```typescript
{
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  images: string[];
  hoverImage?: string;
  inventory: {
    quantity: number;
    sizes?: Array<{ size: string; quantity: number; }>;
    colors?: Array<{ color: string; quantity: number; }>;
  };
  featured: boolean;
  active: boolean;
  tags: string[];
  specifications?: Record<string, string>;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

### Cart Schema

```typescript
{
  user?: ObjectId; // Optional for guest carts
  sessionId?: string; // For guest users
  items: Array<{
    product: ObjectId;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
  }>;
  totalAmount: number;
  expiresAt?: Date; // TTL for guest carts
}
```

### Order Schema

```typescript
{
  orderNumber: string; // Auto-generated
  user?: ObjectId;
  email: string;
  items: Array<{
    product: ObjectId;
    name: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
    image: string;
  }>;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: 'stripe' | 'paypal' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  // ... tracking fields
}
```

## Frontend Integration

The backend provides service classes for easy frontend integration:

```typescript
import { ProductService, CartService, OrderService, AuthService } from '@/lib/services/api';

// Get products
const products = await ProductService.getProducts({ featured: true });

// Add to cart
await CartService.addToCart(productId, quantity, size, color);

// Create order
await OrderService.createOrder(orderData);

// Register user
await AuthService.register({ name, email, password });
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token validation
- Role-based route protection
- Input validation and sanitization
- MongoDB injection prevention
- Session-based guest cart management
- Secure cookie handling

## Performance Optimizations

- Database indexes on frequently queried fields
- Pagination for large datasets
- Lean queries for better performance
- Connection pooling with MongoDB
- TTL indexes for automatic cleanup
- Image optimization ready

## Next Steps

1. **Payment Integration**: Add Stripe/PayPal payment processing
2. **Email Notifications**: Order confirmations and updates
3. **Image Upload**: File upload for product images
4. **Admin Dashboard**: Full admin interface
5. **Inventory Alerts**: Low stock notifications
6. **Analytics**: Order and sales tracking
7. **Reviews**: Product review system
8. **Wishlist**: User wishlist functionality

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MongoDB is running
   - Verify MONGODB_URI in .env.local
   - Check network connectivity for Atlas

2. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NextAuth.js configuration
   - Ensure cookies are enabled

3. **API Errors**
   - Check server logs for detailed errors
   - Verify request format and headers
   - Check database permissions

### Debug Mode

Set `NODE_ENV=development` for detailed error logging.

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Write tests for new features
4. Update documentation
5. Use proper commit messages

---

For questions or issues, please check the logs or contact the development team.
