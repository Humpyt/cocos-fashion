# Frontend + Backend Integration (Current State)

This document describes how the frontend and backend currently interact in this repo, and how the backend is operating right now.

## 1. Current Runtime Snapshot

- Frontend dev server: `http://localhost:3000`
- Backend API server: `http://localhost:4000`
- PostgreSQL (project-local): `localhost:55432`
- Backend health endpoint: `GET /health` returns `{"status":"ok", ...}`
- Backend env file: `server/.env`
  - `NODE_ENV=development`
  - `PORT=4000`
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:55432/cocos_fashion`

## 2. Frontend -> Backend Transport Contract

Frontend API client is `lib/api.ts`.

- Base URL: `VITE_API_BASE_URL` or default `http://localhost:4000`
- All requests use:
  - `credentials: "include"` (cookie support)
  - JSON request/response bodies
- Access token:
  - Stored in `localStorage` key `cocos_access_token`
  - Sent as `Authorization: Bearer <token>`
- Guest cart identity:
  - Stored in `localStorage` key `cocos_guest_id`
  - Sent as header `x-guest-id`

## 3. Frontend Application Flow

From `App.tsx`:

1. On app boot:
- Calls `authApi.refresh()` (`POST /v1/auth/refresh`) to restore session.
- If successful, stores new access token + user profile.

2. Catalog load:
- Calls `catalogApi.listProducts({ page: 1, limit: 100 })` (`GET /v1/products`).
- API products are mapped to UI `Product` objects and used by all product pages.

3. Wishlist sync:
- If logged in and catalog loaded, calls `wishlistApi.list(token)` (`GET /v1/wishlist`).
- Maps returned product IDs back to catalog products.

4. Cart behavior:
- Uses local UI cart state for immediate UX.
- Also syncs backend cart with `cartApi.addItem(...)`.
- On login, guest cart is merged with `POST /v1/cart/merge`.

## 4. API Endpoints Used by Frontend

### Auth
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/auth/me`

### Catalog
- `GET /v1/products`
- `GET /v1/products/:slug`
- `GET /v1/categories`

### Cart
- `GET /v1/cart`
- `POST /v1/cart/items`
- `PATCH /v1/cart/items/:itemId`
- `DELETE /v1/cart/items/:itemId`
- `POST /v1/cart/merge`

### Wishlist
- `GET /v1/wishlist`
- `POST /v1/wishlist/:productId`
- `DELETE /v1/wishlist/:productId`
- `POST /v1/wishlist/merge`

### Orders
- `POST /v1/checkout/orders`
- `GET /v1/orders`
- `GET /v1/orders/:orderNumber`

### Admin (frontend admin page)
- `GET /v1/admin/overview`
- `GET /v1/admin/users`
- `PATCH /v1/admin/users/:userId/role`
- `PATCH /v1/admin/users/:userId/rewards`
- `GET /v1/admin/categories`
- `POST /v1/admin/categories`
- `PATCH /v1/admin/categories/:categoryId`
- `DELETE /v1/admin/categories/:categoryId`
- `GET /v1/admin/products`
- `POST /v1/admin/products`
- `PATCH /v1/admin/products/:productId`
- `DELETE /v1/admin/products/:productId`
- `GET /v1/admin/orders`
- `PATCH /v1/admin/orders/:orderId/status`

## 5. Backend Request Pipeline (How It Operates)

Defined in `server/src/app.ts`.

Order of middleware:
1. `pino-http` request logging
2. `cors(...)`
   - Allows listed `CORS_ORIGIN` values
   - In development, allows `localhost`/`127.0.0.1` on any port
3. `helmet()`
4. `express.json()`
5. `cookieParser()`
6. `authMiddleware` (optional JWT decode)
7. Route mounting
8. 404 fallback
9. Central error handler

Auth rate limit:
- Applied to `/v1/auth/*`
- 120 requests per 15 minutes per IP.

## 6. Authentication Internals (Current)

From `server/src/modules/auth`.

- Access token:
  - JWT signed with `JWT_ACCESS_SECRET`
  - Includes `sub` (userId), `email`, `role`
  - TTL from `ACCESS_TOKEN_TTL_SECONDS` (default 900s)

- Refresh token:
  - Stored as `refresh_token` httpOnly cookie
  - Also accepted from request body on refresh/logout
  - Server stores hash in `RefreshToken` table
  - Rotation on refresh:
    - old token record revoked
    - new token record created

- Cookie options:
  - `httpOnly: true`
  - `sameSite: "lax"`
  - `secure` from `COOKIE_SECURE`
  - `domain` from `COOKIE_DOMAIN` (optional)
  - `path: "/"`, max age from refresh TTL.

## 7. Authorization Model

- `authMiddleware` sets `req.auth` if access token is valid.
- Protected routes use:
  - `requireAuth` for user-authenticated operations
  - `requireAdmin` for admin-only operations

Role values: `CUSTOMER`, `ADMIN`.

## 8. Data Layer + Database

Prisma client:
- `server/src/lib/prisma.ts`
- Reuses singleton in non-production.

Schema:
- `server/prisma/schema.prisma`
- Core models: `User`, `RefreshToken`, `Category`, `Product`, `ProductImage`, `ProductVariant`, `ProductCategory`, `Cart`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `Payment`, `Address`.

## 9. Seed Behavior Right Now

From `server/prisma/seed.ts` and `server/prisma/blouse-products.json`:

- Clears transactional and catalog tables, then reseeds.
- Creates standard category rows (women/men/shoes/handbags/etc).
- Seeds **real blouse catalog** from filename-normalized JSON.
- Each blouse product:
  - local image URL under `/blouses/...`
  - one variant with size/color
  - linked to `women` category
  - badge `REAL PRODUCT`
- Admin user upserted:
  - email: `admin@cocos.local`
  - role: `ADMIN`

## 10. Frontend Catalog Rendering State After Migration

- Product pages now rely on API data instead of hardcoded dummy product arrays.
- `HomePage`, `WomenPage`, `MenPage`, `ShoesPage`, `HandbagsPage`:
  - render API products if present
  - render explicit empty state if no products for that section

## 11. Error Handling Semantics

Global handler (`server/src/middleware/error-handler.ts`):
- Zod validation errors -> `400` + details
- Known `HttpError` -> mapped status/message
- Unknown errors -> `500 Internal server error`

Frontend API helper:
- Throws `Error(message)` on non-2xx responses
- Uses server `message` when provided.

