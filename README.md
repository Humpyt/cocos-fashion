<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/13z8kFU0e8ZmD0i39EZy4whtJAUg1YjcF

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend API (PostgreSQL + Prisma + Express)

The repo now includes a backend in `server/`.

### Backend setup

1. Copy `server/.env.example` to `server/.env` and update values.
2. Ensure PostgreSQL is running.
3. Install backend deps:
   `cd server && npm install`
4. Generate Prisma client and run migrations:
   `npm run prisma:generate`
   `npm run prisma:migrate`
5. Seed starter catalog data:
   `npm run prisma:seed`
6. Start backend:
   `npm run dev`
7. CORS behavior:
   In `development`, frontend requests from `http://localhost:<any-port>` and `http://127.0.0.1:<any-port>` are allowed automatically.
   In `test`/`production`, only origins listed in `CORS_ORIGIN` are allowed.

### Admin access (local seed)

- Email: `admin@cocos.local`
- Password: `Admin123!@#`
- Admin UI route in app: `admin`

From repo root:

- Start frontend: `npm run dev`
- Start backend: `npm run dev:server`
- Optional frontend API base override: set `VITE_API_BASE_URL` (default is `http://localhost:4000`)
