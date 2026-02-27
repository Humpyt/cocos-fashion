# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coco's Fashion is a full-stack e-commerce platform serving Uganda, with a React frontend and Express/Prisma backend deployed to Hostinger VPS at `cocofashionbrands.com`.

## Development Commands

### Local Setup (Supabase + Prisma)
```bash
# Install dependencies
npm install
npm --prefix server install

# Start local Supabase (first run pulls images)
npx supabase start

# Create backend env file
cp server/.env.example server/.env

# Prepare Prisma
npm --prefix server run prisma:generate
npm --prefix server run prisma:deploy
npm --prefix server run prisma:seed  # optional

# Start servers
npm run dev           # frontend on http://localhost:3000
npm run dev:server    # backend on http://localhost:4000

# Stop Supabase
npx supabase stop --no-backup
```

### Build Commands
```bash
npm run build                # frontend only
npm run build:server         # backend only
npm run build:all            # both frontend and backend
```

### Testing
```bash
npm run test:server          # run server tests
npm --prefix server test:watch  # watch mode
```

### Database Schema Management
```bash
# Generate Prisma client
npm --prefix server run prisma:generate

# Create and apply migration (dev)
npm --prefix server run prisma:migrate

# Deploy migrations (production)
npm --prefix server run prisma:deploy

# Seed database
npm --prefix server run prisma:seed
```

### Catalog Import Scripts
```bash
npm run import:dresses -- [dresses.json]      # Import dresses catalog
npm run import:ladies-shoes -- [shoes.json]   # Import ladies shoes catalog
npm --prefix server run catalog:backfill:blouses # Backfill blouse category
npm --prefix server run catalog:import:men    # Import men's catalog
```

### Image Validation
```bash
npm run check:images  # Validate local product images
```

## Architecture

### Frontend (`/`)
- **Tech**: Vite + React 19 + TypeScript + Tailwind CSS
- **Entry Point**: `App.tsx` - SPA with page routing via `currentPage` state
- **API Client**: `lib/api.ts` - central API client with typed endpoints
- **State Management**: React state (useState) with localStorage persistence for tokens/guest cart
- **Pages**: `pages/` directory (HomePage, WomenPage, ProductDetailPage, CartPage, CheckoutPage, AuthPage, DashboardPage, AdminPage, etc.)
- **Components**: `components/` directory (Header, Footer, ProductCard, QuickViewModal, WhatsAppButton, etc.)
- **Types**: `types.ts` - shared Product, User, Category, Order types
- **Path Alias**: `@/*` resolves to project root directory

### Backend (`/server/src`)
- **Tech**: Express + Prisma + PostgreSQL + TypeScript
- **Entry Point**: `src/index.ts` → `src/app.ts`
- **Architecture**: Modular design with separate modules for each domain
  - `modules/auth/` - JWT authentication (access/refresh tokens), argon2 password hashing
  - `modules/catalog/` - Products, Categories, ProductImages, ProductVariants
  - `modules/cart/` - Cart and CartItems with guest cart support
  - `modules/wishlist/` - User wishlist functionality
  - `modules/orders/` - Orders, OrderItems, Payments
  - `modules/admin/` - Admin dashboard, user/role management, order status updates
- **Middleware**: `src/middleware/` - auth middleware, request validation, error handling
- **Lib**: `src/lib/` - Prisma client, logger configuration
- **Types**: `src/types/` - Zod schemas for request/response validation

### Database Schema (`/server/prisma/schema.prisma`)
Key models:
- **User**: Customers and admins with reward tiers (BRONZE/SILVER/GOLD/PLATINUM)
- **Product**/**ProductVariant**: Products with variants (size/color), images, categories
- **Cart/CartItem**: Guest and authenticated carts with variant-based line items
- **Order/OrderItem**: Orders with line items, addresses, payments
- **WishlistItem**: User wishlists
- **RefreshToken**: JWT refresh tokens with revocation support

### API Endpoints Pattern
- Auth: `/v1/auth/*` (login, register, refresh, logout, me)
- Catalog: `/v1/products`, `/v1/categories`
- Cart: `/v1/cart/*` (get, add item, merge guest cart)
- Wishlist: `/v1/wishlist/*` (list, add, remove, merge)
- Orders: `/v1/orders`, `/v1/checkout/orders`
- Admin: `/v1/admin/*` (overview, users, categories, products, orders)
- Health: `/health` - health check endpoint for monitoring

### Static Asset Serving
Product images are served as static files from public directories:
- `/blouses` → `public/blouses/`
- `/dresses` → `public/dresses/`
- `/waist-coats` → `public/waist-coats/`
- `/ladies-shoes` → `public/Ladies Shoes/`

### Rate Limiting
Auth endpoints (`/v1/auth/*`) are rate limited to 120 requests per 15 minutes to prevent brute force attacks.

### Auth & Session Management
- JWT access tokens (15min TTL) + refresh tokens (30 days)
- Passwords hashed with argon2
- Access token stored in localStorage (`cocos_access_token`)
- Refresh tokens stored in database with hash
- Session hint (`cocos_session_hint`) enables automatic token refresh
- Guest carts tracked via `cocos_guest_id` in localStorage
- Cart merge on login (guest cart → user cart)
- Google OAuth authentication supported (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`)

### API Client (`lib/api.ts`)
Key pattern: `API_BASE_URL` is determined by environment:
- Development: `http://localhost:4000` (or `VITE_API_BASE_URL`)
- Production: Empty string (same-origin) unless `VITE_API_BASE_URL` is set to non-loopback
- **Important**: In production, API base URL must not be localhost/127.0.0.1 to avoid loopback issues

### Production Deployment (Hostinger VPS)
- **Domain**: `cocofashionbrands.com`
- **Frontend**: Nginx serves static files from `dist/`
- **Backend**: PM2 runs `server/dist/index.js`
- **Deployment**: GitHub Actions workflow `.github/workflows/deploy-production.yml` triggers on push to `main`
- **Deploy Script**: `deploy/hostinger/deploy.sh`
- **Config Files**: `deploy/hostinger/nginx/cocofashionbrands.com.conf`, `deploy/hostinger/pm2/ecosystem.config.cjs`
- **Full Steps**: See `deploy/hostinger/README.md`
- **GitHub Actions Secrets Required**: `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_PRIVATE_KEY`

### Emergency Recovery
- **Workflow**: `.github/workflows/emergency-recovery.yml` can restore the VPS website
- **Trigger**: Manual workflow_dispatch via GitHub Actions UI
- **Script**: `deploy/hostinger/emergency-recovery.sh` runs on VPS via SSH

## Environment Variables

### Frontend (`.env.production.example`)
- `VITE_API_BASE_URL`: API base URL (default: empty for same-origin in production)

### Backend (`server/.env.example`)
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 4000)
- `CORS_ORIGIN`: Comma-separated allowed origins (localhost allowed automatically in dev)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: JWT secrets
- `ACCESS_TOKEN_TTL_SECONDS`: Access token TTL (default: 900)
- `REFRESH_TOKEN_TTL_DAYS`: Refresh token TTL (default: 30)
- `COOKIE_DOMAIN`, `COOKIE_SECURE`, `TRUST_PROXY`: Cookie and proxy settings for production
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME`: Admin user credentials for seeding
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials (optional)
- `GOOGLE_CALLBACK_URL`: OAuth callback URL
- `FRONTEND_URL`: Frontend base URL for OAuth redirects

## Key Conventions

### Product Data Model
- Prices stored in minor units (cents) as `priceMinor`/`originalPriceMinor`
- Products have optional variants (size/color combinations)
- Each variant has a unique SKU and stock quantity
- Images have sort order for display ordering

### Testing
- Vitest for unit/integration tests
- Test setup in `server/tests/setup.ts`
- Test files should be named `**/*.test.ts`
- Integration tests in `server/tests/integration/`
- Unit tests in `server/tests/unit/`

### Import Scripts
- Catalog import scripts in `server/scripts/`
- Scripts use Prisma directly to create/update products, variants, images, and categories
- Support for incremental imports (updates existing products by slug)

### Seeded Admin Account (Local Dev)
- Email: `admin@cocos.local`
- Password: `Admin123!@#`
- Route: `admin` in the SPA
