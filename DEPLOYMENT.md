# NiaKylie E-Commerce Backend - Production Deployment Guide

This guide outlines the production deployment process for the **NiaKylie Fashion Backend API**.

---

## 1. Environment & Prerequisites

- **Server Specs**: Ubuntu 22.04 LTS (Minimum 2 vCPU, 4GB RAM, 20GB SSD).
- **Installed Software**:
  - Docker Engine >= 24.0
  - Docker Compose >= 2.20
  - Git
  - Certbot (Let's Encrypt SSL)

---

## 2. Server Setup Instructions

### Step 1: Clone Repository
```bash
sudo mkdir -p /opt/niakylie_backend
sudo chown -R $USER:$USER /opt/niakylie_backend
git clone https://github.com/niakylie/backend.git /opt/niakylie_backend
cd /opt/niakylie_backend
```

### Step 2: Configure Environment Variables
Copy `.env.production.example` to `.env` and populate actual production secrets:
```bash
cp .env.production.example .env
nano .env
```
Ensure you update:
- `MONGODB_URI`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `AWS S3 Credentials` (`S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`)
- `Razorpay & Stripe API Keys`

---

## 3. SSL Certificate Setup (Let's Encrypt)

Run Certbot to obtain valid SSL/TLS certificates:
```bash
sudo apt update && sudo apt install -y certbot
sudo certbot certonly --standalone -d api.niakylie.com -d www.api.niakylie.com
```
Certificates will be saved to `/etc/letsencrypt/live/api.niakylie.com/`.

---

## 4. Launch Production Container Stack

Run Docker Compose to start MongoDB, Redis, API Application, and Nginx reverse proxy:
```bash
docker compose up -d --build
```

Verify service status:
```bash
docker compose ps
```

Check backend health check endpoint:
```bash
curl -f https://api.niakylie.com/api/v1/health
```

---

## 5. Swagger Documentation in Production

Swagger documentation is available at:
`https://api.niakylie.com/api/docs`

To disable Swagger in production if required by security compliance, set `SWAGGER_ENABLED=false` in `.env`.

---

## 6. Backup Strategy

### MongoDB Daily Automated Backup Script
Add a cron job to perform automated daily database dumps to S3:
```bash
crontab -e
# Daily backup at 2:00 AM
0 2 * * * docker exec niakylie_mongo mongodump --out /data/db/backups/$(date +\%Y\%m\%d)
```

---

## 7. Useful Operational Commands

- **View API Logs**: `docker compose logs -f app`
- **View Nginx Logs**: `docker compose logs -f nginx`
- **Restart Backend App**: `docker compose restart app`
- **Graceful Shutdown**: `docker compose down`
