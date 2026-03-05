# HartfordVapes - Technical Specification

## Project Overview

- **Project Name:** HartfordVapes
- **Type:** E-commerce Web Application
- **Core Functionality:** Online vape store with product catalog, cart, checkout, and user accounts
- **Target Users:** Adult vapers (21+) looking to purchase vaping products online

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT + bcrypt |
| Payments | Stripe (ready for integration) |

---

## Site Structure

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, featured products, categories, deals |
| `/shop` | Shop | Product catalog with filters |
| `/shop/:category` | Category | Products by category |
| `/product/:slug` | Product Detail | Single product page |
| `/deals` | Deals | Current promotions |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Order placement |
| `/auth/login` | Login | User login |
| `/auth/register` | Register | User registration |
| `/account` | Account | User dashboard |
| `/account/orders` | Orders | Order history |
| `/account/addresses` | Addresses | Saved addresses |
| `/age-verification` | Age Check | 21+ verification |

### Product Categories
1. **Disposables** - ELF Bar, Lost Mary, Raz, etc.
2. **E-Liquids** - Bottled e-juice
3. **Pods & Cartridges** - JUUL, STLTH compatible
4. **Devices** - Vape mods, pod systems
5. **Accessories** - Coils, batteries, chargers

---

## Features

### Frontend Features
- [ ] Age verification gate (21+ required)
- [ ] Product catalog with search & filters
- [ ] Product detail with variants (flavor, nicotine)
- [ ] Shopping cart (persisted)
- [ ] Guest checkout
- [ ] User registration/login
- [ ] Order history
- [ ] Wishlist/saved items
- [ ] Product reviews & ratings
- [ ] Deal/bundle sections
- [ ] Newsletter signup
- [ ] Flash sale countdown

### Backend Features
- [ ] JWT authentication
- [ ] Product CRUD
- [ ] Order management
- [ ] Cart management
- [ ] User accounts
- [ ] Age verification logs
- [ ] Email notifications (order confirmation)
- [ ] Inventory tracking

### Compliance Features
- [ ] Age verification at entry
- [ ] Age verification at checkout
- [ ] Adult signature requirement display
- [ ] Product warning labels

---

## UI/UX Design

### Color Scheme
| Role | Color |
|------|-------|
| Primary | `#6366f1` (Indigo) |
| Secondary | `#10b981` (Emerald - for deals) |
| Dark | `#1e293b` (Slate) |
| Light | `#f8fafc` (Background) |
| Accent | `#f59e0b` (Amber - for CTA) |

### Typography
- **Headings:** Bold, modern sans-serif
- **Body:** Clean, readable

### Layout
- Mobile-first responsive design
- Sticky header with cart icon
- Hero section with CTA
- Product grid (2 col mobile, 4 col desktop)
- Footer with links & newsletter

---

## Product Data Model

```typescript
interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: ProductCategory
  brand: string
  images: string[]
  variants: ProductVariant[]
  price: number
  comparePrice?: number
  inStock: boolean
  stock: number
  rating: number
  reviewCount: number
  isFeatured: boolean
  isOnSale: boolean
  createdAt: DateTime
}

interface ProductVariant {
  id: string
  flavor?: string
  nicotineStrength?: string // 0mg, 3mg, 5mg, 25mg, 50mg
  color?: string
  priceModifier: number // +$0, +$5, etc.
}

type ProductCategory = 
  | 'disposables'
  | 'e-liquids'
  | 'pods'
  | 'devices'
  | 'accessories'
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `GET /api/products/:slug` - Get product
- `GET /api/products/categories` - List categories
- `GET /api/products/deals` - Get on-sale items

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update quantity
- `DELETE /api/cart/:itemId` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details

### Age Verification
- `POST /api/age-verify` - Submit age verification
- `GET /api/age-verify/status` - Check verification status

---

## Development Phases

### Phase 1: Foundation
- [ ] Project setup (React + Express)
- [ ] Database schema
- [ ] Age verification flow
- [ ] Basic layout & styling

### Phase 2: Core Features
- [ ] Product catalog & search
- [ ] Product detail pages
- [ ] Shopping cart
- [ ] User authentication

### Phase 3: Checkout & Orders
- [ ] Checkout flow
- [ ] Order creation
- [ ] Order history

### Phase 4: Enhanced Features
- [ ] Product reviews
- [ ] Wishlist
- [ ] Deals section
- [ ] Newsletter

### Phase 5: Production
- [ ] Production build
- [ ] Deployment config
- [ ] Payment integration (Stripe)

---

## Acceptance Criteria

1. ✅ Users must verify age (21+) before entering site
2. ✅ Products display with images, prices, variants
3 persists. ✅ Cart across sessions
4. ✅ Checkout captures required information
5. ✅ Mobile-responsive on all devices
6. ✅ Fast page load times
7. ✅ Secure authentication
8. ✅ SEO-friendly URLs and meta tags

---

*Created: February 2026*
*Version: 1.0*
