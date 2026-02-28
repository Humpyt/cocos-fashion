# Deployment Instructions for Coco's Fashion E-Commerce Platform

## Overview

This document provides step-by-step instructions for deploying the Coco's Fashion website to production and ensuring it works perfectly.

## Prerequisites

Before proceeding, ensure you have:

- ✅ **Git Access**: SSH key configured for VPS access
- ✅ **Database Connection**: PostgreSQL credentials and connection string ready
- ✅ **Node.js Environment**: Node.js 18+ installed on VPS
- ✅ **Code Access**: Latest changes pushed to GitHub (commit `270a78b`)

---

## Step 1: Product Deduplication (Run on Production Server)

**Objective**: Remove duplicate products that were created due to copy suffix issues in filenames.

### Instructions

1. **SSH into the production server:**
   ```bash
   ssh -i ~/.ssh/cocos_vps_key user@cocofashionbrands.com
   ```

2. **Navigate to the project directory:**
   ```bash
   cd /var/www/cocofashionbrands.com
   ```

3. **Run the deduplication script (Dry Run First):**
   ```bash
   cd server
   node scripts/deduplicate-products.cjs --verbose --dry-run
   ```

4. **Review the output carefully:**
   - Check how many duplicate groups were found
   - Verify which products will be deactivated
   - Ensure you understand which products are duplicates before proceeding

5. **If the output looks correct, run without --dry-run:**
   ```bash
   node scripts/deduplicate-products.cjs --verbose
   ```

6. **Verify the changes:**
   ```bash
   # Check database (optional - requires DB access)
   npx prisma studio
   ```

### Expected Output

The script will output:
```
Starting product deduplication...
Found X duplicate groups with Y total products

Duplicate groups:
Group key: [key]
  Products: [product names]

Deactivating N duplicate(s) for: [product name]
  Keeping: prod-xxx (product-id)
  Deactivating: prod-yyy (product-id)

=== Summary ===
Products kept: A
Products deactivated: B
Duplicate groups processed: C
```

**Important Notes:**
- The script only **deactivates** products, it does not delete them
- If a product was incorrectly deactivated, you can reactivate it via the admin dashboard
- Always run with `--dry-run` first before running for real

---

## Step 2: Deploy Latest Code Changes to Production

### Instructions

1. **Pull latest code from GitHub on the VPS:**
   ```bash
   cd /var/www/cocofashionbrands.com
   git pull origin main
   ```

2. **Update environment variables (if needed):**
   ```bash
   cd /var/www/cocofashionbrands.com/server
   # Check .env file
   cat .env

   # If DATABASE_URL needs updating (e.g., for production)
   # nano .env
   # Update: DATABASE_URL=postgresql://...
   ```

3. **Install/update dependencies:**
   ```bash
   cd /var/www/cocofashionbrands.com/server
   npm install
   # OR if using npm ci with lockfile:
   npm ci
   ```

4. **Build the server:**
   ```bash
   cd /var/www/cocofashionbrands.com/server
   npm run build
   ```

5. **Restart the Node.js application (using PM2):**
   ```bash
   # Check current processes
   pm2 list

   # Restart the server
   pm2 restart all
   # OR restart specific app:
   pm2 restart cocos-fashion
   ```

6. **Verify the server is running:**
   ```bash
   # Check if backend is accessible
   curl http://localhost:4000/health

   # Or check PM2 status
   pm2 status
   ```

---

## Step 3: Verify Website Functionality

After deployment, verify the following functionality works correctly:

### 3.1 Product Pages

**Check Product Detail Page:**
1. Navigate to a product detail page (e.g., `/women`, `/men`)
2. **Expected**: Only the actual product image from the catalog should display
3. **No placeholder images** should appear

**Check Men's Page Categories:**
1. Navigate to `/men`
2. Scroll to "Shop by Category" section
3. **Expected**: All category images should be from the men's product catalog (`/Men/Shirts/`, `/Men/T-Shirts/`)
4. **Verify**: No external/placeholder images

### 3.2 Homepage Updates

**Check Banner:**
1. Navigate to home page (`/`)
2. **Expected**: Banner shows "Seasonal Sale" not "President's Day Sale"
3. **Expected**: Discount shows "Up to 30% OFF" not "Up to 60% OFF"

**Check Top Deals Section:**
1. Scroll down to "Coco's Top Deals" section
2. **Expected**: Only actual product images from catalog are displayed
3. **Verify**: Categories are DRESSES, SHOES, BLOUSES, SHIRTS, T-SHIRTS, WAISTCOATS
4. **Verify**: No generic/external placeholder images

**Check Clearance Section:**
1. Scroll to bottom of homepage
2. **Expected**: "UP TO 30% OFF" not "40-70% OFF"
3. **Expected**: Description says "LIMITED TIME OFFERS - SHOP WHILE STOCKS LAST"

### 3.3 Navigation Updates

**Check Header Navigation:**
1. **Expected**: First link says "Home" not "Shop All"

**Check Footer Links:**
1. Scroll to footer
2. **Expected**: All links should work (not result in 404)
3. **Links to verify**:
   - Women → `/women`
   - Men → `/men`
   - Shoes → `/shoes`
   - Handbags → `/handbags`
   - About Us → `/about`
   - Vision → `/vision`
   - Mission → `/mission`
   - Core Values → `/core-values`
   - Home Ground → `/home-ground`
   - Sign In/Register → `/auth`
   - My Dashboard → `/dashboard`
   - My Wishlist → `/wishlist`
   - Shopping Bag → `/cart`

### 3.4 Authentication & User Dashboard

**Test User Registration:**
1. Navigate to `/auth`
2. Create a new account
3. Fill in the form and register
4. **Expected**: Redirects to dashboard page

**Test Login:**
1. Navigate to `/auth`
2. Log in with existing credentials
3. **Expected**: Redirects to dashboard page

**Verify Dashboard Features:**
- Order history should display past orders
- Reward tier information should be visible
- Star Money balance should show
- Quick links should work

---

## Step 4: Run Product Imports (Optional)

If you need to add new products to the catalog after deduplication:

### Import Script Usage

**Men's Products:**
```bash
cd server
npm run catalog:import:men
```

**Dresses:**
```bash
cd server
npm run catalog:import:dresses
```

**Blouses:**
```bash
cd server
npm run catalog:backfill:blouses
```

### Important Notes

- **Run in production environment** (with DATABASE_URL set)
- **Images** should be placed in the correct public folders before importing
- **Copy suffix handling**: Updated import scripts now correctly handle files like `230k- 370k 2`
- **Product grouping**: Same products will be grouped as variants automatically

---

## Step 5: Nginx Configuration (VPS)

The Nginx configuration is located at `/etc/nginx/sites-available/cocofashionbrands.com.conf`

**If you need to modify Nginx configuration:**
1. SSH into the VPS
2. Edit the Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/cocofashionbrands.com.conf
   ```
3. Test configuration:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

**Common Nginx Issues & Fixes:**

**Frontend routes not working:**
- Ensure `try_files $uri/` is set correctly for SPA routing
- Example: `try_files $uri/ /index.html /index.html /about.html /auth.html /dashboard.html;`

**Backend API routes blocked:**
- Ensure API routes are accessible:
  ```nginx
  location /api/ {
      proxy_pass http://localhost:4000;
      # ... other config
  }
  ```

**Static files not serving:**
- Ensure `root` directive points to correct build directory
- Example: `root /var/www/cocofashionbrands.com/dist;`

---

## Step 6: Troubleshooting Common Issues

### Issue: "Cannot find module" errors in logs

**Cause**: Import scripts trying to import from missing `.js` files

**Solution**: Run `npm run build` to compile TypeScript before importing
```bash
cd server
npm run build
# Then run import scripts
npm run catalog:import:men
```

### Issue: Products not displaying

**Possible Causes:**
1. Product images have incorrect file paths
2. Database connection issues
3. Frontend API configuration incorrect

**Debug Steps:**
```bash
# Check backend health
curl http://localhost:4000/health

# Check API logs
pm2 logs --lines 50

# Check frontend console
# Browser DevTools → Network tab
```

### Issue: Navigation not working (404 errors)

**Solution**: Verify Nginx configuration (see Step 5)

### Issue: Database connection errors

**Solution**: Verify `DATABASE_URL` in `.env` file
```bash
cd /var/www/cocofashionbrands.com/server
cat .env
# Should look like:
# DATABASE_URL=postgresql://user:password@localhost:5432/cocos_fashion
```

---

## Step 7: Performance Optimization (Optional)

### Enable Gzip Compression (Nginx)
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/javascript application/json;
gzip_min_length 1024;
gzip_comp_level 6;
```

### Enable Browser Caching
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

---

## Step 8: Security Best Practices

### Environment Variables

**Never commit these to production:**
```bash
# DO NOT commit files containing actual secrets or credentials
# Never add files with passwords to git
```

**Use environment variables for secrets:**
```bash
# .env file (already .gitignored)
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
```

### SSL/HTTPS

**Ensure SSL certificate is valid:**
```bash
# Check certificate expiry
sudo certbot certificates
sudo systemctl reload nginx
```

---

## Step 9: Rollback Plan

If deployment causes issues, here's how to rollback:

### Quick Rollback (Git)
```bash
cd /var/www/cocofashionbrands.com
git log --oneline -5  # Show recent commits
git reset --hard HEAD~1  # Rollback one commit
npm run build
pm2 restart all
```

### Database Rollback (If Available)
If you have a recent database backup:
```bash
psql -U postgres -h localhost -f cocos_fashion < backup.sql
```

---

## Step 10: Post-Deployment Verification Checklist

After deploying all changes, verify:

- [ ] Product detail pages show only actual product images
- [ ] Men's page categories show correct men's catalog images
- [ ] Homepage banner shows "Seasonal Sale" with "30% OFF"
- [ ] Homepage top deals show actual catalog products
- [ ] Homepage clearance shows "UP TO 30% OFF"
- [ ] Header navigation shows "Home" not "Shop All"
- [ ] Footer links work correctly
- [ ] User can register and login
- [ ] User is redirected to dashboard after login
- [ ] Dashboard shows order history and rewards
- [ ] Database connections work without errors
- [ ] No console errors in browser DevTools
- [ ] All API endpoints respond correctly
- [ ] Site loads quickly (< 3 seconds)

---

## Quick Reference Commands

### SSH Access
```bash
ssh -i ~/.ssh/cocos_vps_key user@cocofashionbrands.com
```

### Restart Backend
```bash
pm2 restart all
```

### Restart Nginx
```bash
sudo systemctl reload nginx
```

### Check PM2 Status
```bash
pm2 status
pm2 logs --lines 50
```

### View Backend Health
```bash
curl http://localhost:4000/health
```

### View Database (with Prisma Studio)
```bash
cd server
npx prisma studio
```

---

## Notes for AI Developer

1. **Deduplication Script**: The product deduplication script is located at `server/scripts/deduplicate-products.cjs`. It groups products by `brand-type-color-price` key and deactivates duplicates.

2. **Copy Suffix Handling**: The import parsers have been updated to properly remove copy numbers like " 2" from filenames. See the pattern in:
   - `server/src/utils/men-import.ts` (line 39)
   - `server/src/utils/dress-import.ts` (line 35)
   - `server/src/utils/blouse-import.ts` (line 48)

3. **Import Scripts**: All import scripts run with `tsx` to compile on the fly. Ensure `npm run build` is run before imports if TypeScript errors occur.

4. **UI Changes Made**:
   - Removed 3 placeholder images from `pages/ProductDetailPage.tsx`
   - Updated navigation label from "Shop All" to "Home" in `components/Header.tsx`
   - Changed banner from "President's Day Sale" to "Seasonal Sale" in `components/PresidentsDayHeader.tsx`
   - Changed discount from "60% OFF" to "30% OFF" (multiple places)
   - Updated top deals section to use actual catalog images
   - Updated clearance section to show "UP TO 30% OFF"
   - Updated footer to only link to existing pages

5. **Testing Recommendations**:
   - Test on both desktop (1024px+) and mobile (375px+) viewports
   - Test with different browsers (Chrome, Firefox, Safari, Edge)
   - Test user registration, login, and dashboard flows
   - Test product browsing and add to cart functionality

6. **Monitoring**:
   - Check PM2 logs regularly: `pm2 logs --lines 100 --nostream`
   - Monitor server resources: `pm2 monit`
   - Set up application performance monitoring if needed

---

## Emergency Contacts

If critical issues arise that cannot be resolved:

- **VPS Access Issue**: Contact hosting provider
- **Database Issue**: Restore from most recent backup, contact support
- **Deployment Lockout**: Use VPS provider's emergency console or SSH access

---

**Document Version**: 1.0
**Last Updated**: 2026-02-28
