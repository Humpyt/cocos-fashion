#!/usr/bin/env bash
set -euo pipefail

# ============================================
# EMERGENCY WEBSITE RECOVERY SCRIPT
# Restores both cocofashionbrands.com and eaglesrugbyug.com
# ============================================

echo "=========================================="
echo "  EMERGENCY WEBSITE RECOVERY"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# ============================================
# STEP 1: DIAGNOSTIC
# ============================================
echo "=========================================="
echo "  STEP 1: DIAGNOSTIC"
echo "=========================================="
echo ""

# Check Nginx status
echo "[1/6] Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    success "Nginx is running"
else
    error "Nginx is NOT running"
    NGINX_DOWN=true
fi
echo ""

# Check Nginx configuration
echo "[2/6] Testing Nginx configuration..."
if sudo nginx -t 2>&1; then
    success "Nginx configuration is valid"
    NGINX_CONFIG_OK=true
else
    error "Nginx configuration has ERRORS"
    NGINX_CONFIG_OK=false
fi
echo ""

# Check enabled sites
echo "[3/6] Checking enabled Nginx sites..."
ENABLED_SITES=$(ls -1 /etc/nginx/sites-enabled/ 2>/dev/null || echo "none")
if [ -n "$ENABLED_SITES" ] && [ "$ENABLED_SITES" != "none" ]; then
    echo "  Enabled sites:"
    echo "$ENABLED_SITES" | sed 's/^/    - /'
else
    warn "NO sites are enabled in Nginx"
fi
echo ""

# Check PM2 processes
echo "[4/6] Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    PM2_PROCESSES=$(pm2 list --json 2>/dev/null || echo "[]")
    if echo "$PM2_PROCESSES" | grep -q "cocos-fashion-api"; then
        success "Coco's Fashion API is running in PM2"
        PM2_OK=true
    else
        error "Coco's Fashion API is NOT running in PM2"
        PM2_OK=false
    fi
else
    error "PM2 is not installed"
    PM2_OK=false
fi
echo ""

# Check Docker containers
echo "[5/6] Checking Docker containers..."
if command -v docker &> /dev/null; then
    if docker ps | grep -q "eaglesrfc_api"; then
        success "Eagles API container is running"
        DOCKER_OK=true
    else
        warn "Eagles API container is NOT running"
        DOCKER_OK=false
    fi
else
    error "Docker is not installed"
    DOCKER_OK=false
fi
echo ""

# Check document roots
echo "[6/6] Checking document roots..."
COCO_ROOT="/var/www/cocofashionbrands.com/current/dist"
EAGLES_ROOT="/var/www/eaglesrfc/dist"

if [ -d "$COCO_ROOT" ] && [ -f "$COCO_ROOT/index.html" ]; then
    success "Coco's Fashion document root exists: $COCO_ROOT"
    COCO_ROOT_OK=true
else
    error "Coco's Fashion document root is MISSING"
    COCO_ROOT_OK=false
fi

if [ -d "$EAGLES_ROOT" ] && [ -f "$EAGLES_ROOT/index.html" ]; then
    success "Eagles document root exists: $EAGLES_ROOT"
    EAGLES_ROOT_OK=true
else
    error "Eagles document root is MISSING"
    EAGLES_ROOT_OK=false
fi
echo ""

# ============================================
# STEP 2: APPLY FIXES
# ============================================
echo "=========================================="
echo "  STEP 2: APPLYING FIXES"
echo "=========================================="
echo ""

# Fix 1: Start Nginx if down
if [ "${NGINX_DOWN:-false}" = true ]; then
    log "Starting Nginx..."
    sudo systemctl start nginx
    if systemctl is-active --quiet nginx; then
        success "Nginx started successfully"
    else
        error "Failed to start Nginx"
        exit 1
    fi
fi

# Fix 2: Fix Nginx configuration errors
if [ "${NGINX_CONFIG_OK:-true}" = false ]; then
    warn "Nginx configuration has errors - backing up and creating minimal configs..."

    # Backup existing configs
    sudo mkdir -p /etc/nginx/sites-available/backup
    sudo cp /etc/nginx/sites-available/*.conf /etc/nginx/sites-available/backup/ 2>/dev/null || true

    # Disable all sites
    sudo rm -f /etc/nginx/sites-enabled/*

    # Create minimal Coco's Fashion config
    log "Creating minimal Coco's Fashion configuration..."
    cat << 'EOF' | sudo tee /etc/nginx/sites-available/cocofashionbrands.com > /dev/null
server {
    listen 80;
    listen [::]:80;
    server_name cocofashionbrands.com www.cocofashionbrands.com;

    root /var/www/cocofashionbrands.com/current/dist;
    index index.html;
    client_max_body_size 20m;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ ^/(v1|health|blouses|dresses|waist-coats|ladies-shoes) {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    # Enable Coco's Fashion
    sudo ln -sf /etc/nginx/sites-available/cocofashionbrands.com /etc/nginx/sites-enabled/

    # Test Nginx config
    if sudo nginx -t; then
        success "Minimal Coco's Fashion configuration created and enabled"
        sudo systemctl reload nginx
    else
        error "Failed to create valid Nginx configuration"
        exit 1
    fi
fi

# Fix 3: Enable sites if none are enabled
if [ -z "$ENABLED_SITES" ] || [ "$ENABLED_SITES" = "none" ]; then
    log "No sites enabled - enabling Coco's Fashion..."

    # Enable Coco's Fashion
    if [ -f /etc/nginx/sites-available/cocofashionbrands.com ]; then
        sudo ln -sf /etc/nginx/sites-available/cocofashionbrands.com /etc/nginx/sites-enabled/
        success "Coco's Fashion enabled"
    else
        warn "Coco's Fashion config not found - creating minimal config..."

        cat << 'EOF' | sudo tee /etc/nginx/sites-available/cocofashionbrands.com > /dev/null
server {
    listen 80;
    listen [::]:80;
    server_name cocofashionbrands.com www.cocofashionbrands.com;

    root /var/www/cocofashionbrands.com/current/dist;
    index index.html;
    client_max_body_size 20m;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ ^/(v1|health|blouses|dresses|waist-coats|ladies-shoes) {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

        sudo ln -sf /etc/nginx/sites-available/cocofashionbrands.com /etc/nginx/sites-enabled/
    fi

    sudo nginx -t && sudo systemctl reload nginx
fi

# Fix 4: Start PM2 if not running
if [ "${PM2_OK:-true}" = false ]; then
    log "Starting Coco's Fashion API with PM2..."

    if [ -f /var/www/cocofashionbrands.com/current/server/dist/index.js ]; then
        cd /var/www/cocofashionbrands.com/current/server
        pm2 start dist/index.js --name cocos-fashion-api --update-env
        success "Coco's Fashion API started"
    else
        warn "Coco's Fashion API binary not found - attempting to build..."
        cd /var/www/cocofashionbrands.com/current
        npm install
        npm run build:server
        pm2 start server/dist/index.js --name cocos-fashion-api
    fi
fi

# Fix 5: Start Docker if not running
if [ "${DOCKER_OK:-true}" = false ]; then
    log "Starting Eagles API container..."

    # Remove old container if exists
    docker rm -f eaglesrfc_api 2>/dev/null || true

    # Create volume if needed
    docker volume create eaglesrfc_poll_data 2>/dev/null || true

    # Start container
    docker run -d \
        --name eaglesrfc_api \
        --restart unless-stopped \
        -v eaglesrfc_poll_data:/data \
        -p 127.0.0.1:3001:3001 \
        eaglesrfc-api

    success "Eagles API container started"
fi

# Fix 6: Create Eagles Nginx config if missing
if [ ! -f /etc/nginx/sites-available/eaglesrugbyug.com ] && [ "${EAGLES_ROOT_OK:-true}" = true ]; then
    log "Creating Eagles Nginx configuration..."

    cat << 'EOF' | sudo tee /etc/nginx/sites-available/eaglesrugbyug.com > /dev/null
server {
    listen 80;
    listen [::]:80;
    server_name eaglesrugbyug.com www.eaglesrugbyug.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name eaglesrugbyug.com www.eaglesrugbyug.com;

    ssl_certificate /etc/letsencrypt/live/eaglesrugbyug.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eaglesrugbyug.com/privkey.pem;

    root /var/www/eaglesrfc/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

    # Enable Eagles
    sudo ln -sf /etc/nginx/sites-available/eaglesrugbyug.com /etc/nginx/sites-enabled/

    # Test and reload
    if sudo nginx -t; then
        sudo systemctl reload nginx
        success "Eagles configuration created and enabled"
    else
        warn "Eagles configuration has SSL errors - disabling for now"
        sudo rm -f /etc/nginx/sites-enabled/eaglesrugbyug.com
        sudo systemctl reload nginx
    fi
fi

echo ""

# ============================================
# STEP 3: VERIFICATION
# ============================================
echo "=========================================="
echo "  STEP 3: VERIFICATION"
echo "=========================================="
echo ""

# Test Nginx
echo "[1/4] Testing Nginx status..."
if systemctl is-active --quiet nginx; then
    success "Nginx is running"
else
    error "Nginx is NOT running"
fi
echo ""

# Test Coco's Fashion
echo "[2/4] Testing Coco's Fashion (HTTP)..."
if curl -sS -o /dev/null -w "%{http_code}" http://cocofashionbrands.com | grep -q "200\|301\|302"; then
    success "Coco's Fashion is responding"
    curl -sS -I http://cocofashionbrands.com | head -5
else
    error "Coco's Fashion is NOT responding"
fi
echo ""

echo "[3/4] Testing Coco's Fashion API..."
if curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/health | grep -q "200"; then
    success "Coco's Fashion API is responding"
    curl -sS http://127.0.0.1:4000/health
else
    warn "Coco's Fashion API may not be responding"
fi
echo ""

echo "[4/4] Testing Eagles (if enabled)..."
if [ -f /etc/nginx/sites-enabled/eaglesrugbyug.com ]; then
    if curl -sS -o /dev/null -w "%{http_code}" http://eaglesrugbyug.com | grep -q "200\|301\|302"; then
        success "Eagles is responding"
        curl -sS -I http://eaglesrugbyug.com | head -5
    else
        warn "Eagles may not be responding (HTTPS may be required)"
    fi
else
    warn "Eagles is not enabled in Nginx"
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "=========================================="
echo "  RECOVERY SUMMARY"
echo "=========================================="
echo ""
success "Recovery script completed"
echo ""
echo "Please test both websites:"
echo "  - http://cocofashionbrands.com"
echo "  - http://eaglesrugbyug.com (if enabled)"
echo ""
echo "If issues persist, check:"
echo "  - Nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "  - PM2 logs: pm2 logs"
echo "  - Docker logs: docker logs eaglesrfc_api"
echo ""
