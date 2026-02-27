#!/bin/bash
# Quick emergency recovery - run this from the project root
# Uses existing SSH configuration from deployment

set -euo pipefail

# Load VPS configuration from environment or prompt
VPS_HOST=${VPS_HOST:-}
VPS_USER=${VPS_USER:-}
VPS_PORT=${VPS_PORT:-22}
SSH_KEY=${SSH_KEY:-deploy_key}

echo "=========================================="
echo "  EMERGENCY RECOVERY - DEPLOY"
echo "=========================================="
echo ""

# Prompt for VPS details if not set
if [ -z "$VPS_HOST" ]; then
    echo "VPS_HOST not set. Please provide:"
    read -p "VPS Host (IP): " VPS_HOST
fi

if [ -z "$VPS_USER" ]; then
    read -p "VPS User: " VPS_USER
fi

if [ -z "$VPS_PORT" ]; then
    read -p "VPS Port [22]: " VPS_PORT
    VPS_PORT=${VPS_PORT:-22}
fi

echo ""
echo "Target: $VPS_USER@$VPS_HOST:$VPS_PORT"
echo "SSH Key: $SSH_KEY"
echo ""

# Check if SCP and SSH are available
if ! command -v scp &> /dev/null || ! command -v ssh &> /dev/null; then
    echo "ERROR: SSH/SCP not found. Please install OpenSSH."
    exit 1
fi

# Upload the recovery script
echo "[1/3] Uploading emergency recovery script..."
scp -i "$SSH_KEY" \
    -P "$VPS_PORT" \
    -o "StrictHostKeyChecking=no" \
    -o "UserKnownHostsFile=/dev/null" \
    deploy/hostinger/emergency-recovery.sh \
    "$VPS_USER@$VPS_HOST:/tmp/emergency-recovery.sh"

if [ $? -eq 0 ]; then
    echo "[SUCCESS] Script uploaded"
else
    echo "[ERROR] Failed to upload script"
    exit 1
fi

echo ""

# Make executable and run
echo "[2/3] Running recovery script on VPS..."
ssh -i "$SSH_KEY" \
    -p "$VPS_PORT" \
    -o "StrictHostKeyChecking=no" \
    -o "UserKnownHostsFile=/dev/null" \
    "$VPS_USER@$VPS_HOST" \
    "chmod +x /tmp/emergency-recovery.sh && sudo /tmp/emergency-recovery.sh"

echo ""

# Test websites
echo "[3/3] Testing websites..."
echo ""
echo "Testing Coco's Fashion..."
curl -I "http://$VPS_HOST" || echo "Failed to reach site"

echo ""
echo "Testing Eagles..."
curl -I "http://eaglesrugbyug.com" || echo "Failed to reach site"

echo ""
echo "=========================================="
echo "  RECOVERY COMPLETE"
echo "=========================================="
echo ""
echo "Test in browser:"
echo "  - http://cocofashionbrands.com"
echo "  - http://eaglesrugbyug.com"
echo ""
