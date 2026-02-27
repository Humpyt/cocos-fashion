# Hostinger VPS Deployment (cocofashionbrands.com)

This guide deploys:
- Frontend static build via `nginx`
- Backend API (`server/dist/index.js`) via `pm2`
- Domain: `cocofashionbrands.com`

## 1. Install base packages on VPS

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

If you are replacing a previous Docker-based app on the same VPS, stop/remove the old containers first so `nginx` can bind `80/443`:

```bash
docker ps -a
docker rm -f <old_web_container> <old_api_container>
```

## 2. Place project on server

```bash
sudo mkdir -p /var/www/cocofashionbrands.com
sudo chown -R $USER:$USER /var/www/cocofashionbrands.com
cd /var/www/cocofashionbrands.com
git clone <your-repo-url> current
cd current
```

## 3. Install dependencies and build

```bash
npm install
npm --prefix server install
npm --prefix server run prisma:generate
npm run build
npm --prefix server run build
```

## 4. Configure backend environment

```bash
cp server/.env.production.example server/.env
nano server/.env
```

Required values to verify in `server/.env`:
- `DATABASE_URL` (production PostgreSQL)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN=https://cocofashionbrands.com,https://www.cocofashionbrands.com`
- `COOKIE_DOMAIN=.cocofashionbrands.com`
- `COOKIE_SECURE=true`
- `TRUST_PROXY=true`

## 5. Run Prisma migrations

```bash
npm --prefix server run prisma:generate
npm --prefix server run prisma:deploy
```

Optional seed:

```bash
npm --prefix server run prisma:seed
```

## 6. Start API with PM2

```bash
pm2 start deploy/hostinger/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

## 7. Configure Nginx

```bash
sudo cp deploy/hostinger/nginx/cocofashionbrands.com.conf /etc/nginx/sites-available/cocofashionbrands.com
sudo ln -s /etc/nginx/sites-available/cocofashionbrands.com /etc/nginx/sites-enabled/cocofashionbrands.com
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Configure DNS

Point both records to your VPS public IP:
- `A @ -> <VPS_IP>`
- `A www -> <VPS_IP>`

## 9. Issue SSL certificate

```bash
sudo certbot --nginx -d cocofashionbrands.com -d www.cocofashionbrands.com
sudo systemctl reload nginx
```

## 10. Verify

```bash
curl -I https://cocofashionbrands.com
curl -I https://cocofashionbrands.com/health
curl -I https://cocofashionbrands.com/v1/categories
pm2 status
```

## Update workflow

```bash
cd /var/www/cocofashionbrands.com/current
git pull
npm install
npm --prefix server install
npm run build
npm --prefix server run build
npm --prefix server run prisma:deploy
pm2 restart cocos-fashion-api
```

## Automatic deploy from GitHub

This repository includes:
- Workflow: `.github/workflows/deploy-production.yml`
- Remote deploy script: `deploy/hostinger/deploy.sh`

Create these GitHub Actions secrets in your repository:
- `VPS_HOST` (example: `72.60.83.198`)
- `VPS_PORT` (example: `22`)
- `VPS_USER` (example: `deploy`)
- `VPS_SSH_PRIVATE_KEY` (private key that matches `/home/deploy/.ssh/authorized_keys`)

Security note:
- Keep SSH private keys outside this repository (for example under `~/.ssh/`).
- Do not store keys like `deploy_key` in project folders, even temporarily.

Trigger behavior:
- Push to `main` deploys automatically.
- Manual deploy is available via `workflow_dispatch` and optional `ref` input.
