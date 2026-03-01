<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Coco's Fashion - Local Setup

This repo contains the frontend (`vite + react`) and backend API (`express + prisma + postgres`).

## Prerequisites

- Node.js
- Docker Desktop

## Run Locally (Supabase + Prisma)

1. Install dependencies:
   - `npm install`
   - `npm --prefix server install`
2. Start local Supabase (first run pulls images):
   - `npx supabase start`
3. Create backend env file:
   - Copy `server/.env.example` to `server/.env`
4. Prepare Prisma client/schema:
   - `npm --prefix server run prisma:generate`
   - `npm --prefix server run prisma:deploy`
5. Optional seed data:
   - `npm --prefix server run prisma:seed`
6. Start the app:
   - Frontend: `npm run dev`
   - Backend: `npm run dev:server`

Frontend: `http://localhost:3000`  
Backend: `http://localhost:4000`

## Notes

- Default local Supabase DB URL:
  - `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Frontend API base can be overridden with `VITE_API_BASE_URL`.
  - Dev default: `http://localhost:4000`
  - Production default: same-origin (empty base URL)
- In `development`, backend allows `localhost` / `127.0.0.1` origins on any port.

## Admin Access (Seeded)

- Email: `admin@cocos.local`
- Password: `Admin123!@#`
- Admin route: `admin`

## Stop Local Supabase

- `npx supabase stop --no-backup`

## Production (Hostinger VPS)

Production deployment files for `cocofashionbrands.com` are included:

- Nginx config:
  - `deploy/hostinger/nginx/cocofashionbrands.com.conf`
- PM2 process config:
  - `deploy/hostinger/pm2/ecosystem.config.cjs`
- Backend production env template:
  - `server/.env.production.example`
- Full VPS steps:
  - `deploy/hostinger/README.md`

Frontend production env (optional):
- `.env.production.example`


