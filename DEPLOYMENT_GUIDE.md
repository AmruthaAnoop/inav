# Payment Collection App - Deployment Guide

## Overview
This guide covers the complete CI/CD pipeline setup and deployment process for both frontend and backend applications to AWS EC2.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
5. [AWS EC2 Deployment](#aws-ec2-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)

---

## Prerequisites

### Required Tools
- Git
- Node.js 18.x or 20.x
- MySQL 8.0
- AWS Account
- GitHub Account

### AWS Resources
- EC2 Instance (Ubuntu 22.04 LTS recommended)
- Security Group (ports 22, 80, 443, 5000 open)
- Elastic IP (optional, for static IP)
- SSH Key Pair

---

## GitHub Repository Setup

### 1. Create Separate Repositories

#### Backend Repository
```bash
cd payment-app-backend
git init
git add .
git commit -m "Initial commit: Backend API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/payment-app-backend.git
git push -u origin main
```

#### Frontend Repository
```bash
cd payment-app-frontend
git init
git add .
git commit -m "Initial commit: React Native Frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/payment-app-frontend.git
git push -u origin main
```

### 2. Configure .gitignore

#### Backend (.gitignore)
```
node_modules/
.env
.env.local
.DS_Store
logs/
*.log
dist/
build/
```

#### Frontend (.gitignore)
```
node_modules/
.expo/
.expo-shared/
.env
.env.local
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
```

---

## Environment Variables Configuration

### Backend Environment Variables

Create `.env` file in `payment-app-backend/`:
```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_BASE_URL=http://YOUR_EC2_PUBLIC_IP:5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_NAME=payment_collection_db

# JWT Configuration
JWT_SECRET=YOUR_STRONG_JWT_SECRET_KEY
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://YOUR_EC2_PUBLIC_IP,https://YOUR_DOMAIN.com
```

### Frontend Environment Variables

Create `.env` file in `payment-app-frontend/`:
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP:5000/api
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_APP_NAME=Payment Collection
```

Update `app.json` extra configuration:
```json
{
  "expo": {
    "extra": {
      "API_URL": process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"
    }
  }
}
```

---

## CI/CD Pipeline Setup

### GitHub Secrets Configuration

Navigate to: `Repository Settings > Secrets and variables > Actions`

#### Backend Repository Secrets
```
EC2_HOST=your-ec2-public-ip
EC2_USER=ubuntu
EC2_SSH_KEY=<paste your private key>
SLACK_WEBHOOK=<optional slack webhook>
```

#### Frontend Repository Secrets
```
EXPO_PUBLIC_API_URL=http://your-ec2-public-ip:5000/api
EXPO_TOKEN=<your expo access token>
```

### CI/CD Workflow Features

#### Backend Pipeline (`payment-app-backend/.github/workflows/ci-cd.yml`)
- **Build Stage:**
  - Node.js version matrix testing (18.x, 20.x)
  - MySQL service container
  - Dependency installation
  - Linting and testing
  - Build verification

- **Deploy Stage:**
  - Triggered on push to `main` branch
  - SSH into EC2 instance
  - Pull latest code
  - Install dependencies
  - Run database migrations
  - Restart Node.js service

#### Frontend Pipeline (`payment-app-frontend/.github/workflows/ci-cd.yml`)
- **Build Stage:**
  - Node.js version matrix testing
  - Dependency installation
  - Linting and testing
  - Web export verification with environment variables

- **Mobile Build Stages:**
  - Android APK build (on main branch)
  - iOS IPA build (on main branch)

---

## AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. **Instance Type:** t2.medium or larger
2. **AMI:** Ubuntu Server 22.04 LTS
3. **Security Group Rules:**
   ```
   SSH (22) - Your IP
   HTTP (80) - 0.0.0.0/0
   HTTPS (443) - 0.0.0.0/0
   Custom TCP (5000) - 0.0.0.0/0
   MySQL (3306) - localhost only
   ```

### Step 2: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx
```

### Step 4: MySQL Configuration

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE payment_collection_db;
CREATE USER 'paymentuser'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON payment_collection_db.* TO 'paymentuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Deploy Backend Application

```bash
# Clone repository
cd ~
git clone https://github.com/YOUR_USERNAME/payment-app-backend.git
cd payment-app-backend

# Install dependencies
npm ci

# Create .env file
nano .env
# (Paste production environment variables)

# Run database migrations
npm run migrate

# Start with PM2
pm2 start src/index.js --name payment-backend
pm2 save
pm2 startup
```

### Step 6: Configure Nginx Reverse Proxy (Optional)

```bash
sudo nano /etc/nginx/sites-available/payment-backend
```

Add configuration:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/payment-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL Certificate (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d YOUR_DOMAIN
```

### Step 8: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw enable
```

---

## Post-Deployment Verification

### Backend Health Check

```bash
# Test API endpoint
curl http://YOUR_EC2_PUBLIC_IP:5000/api/health

# Expected Response:
{
  "status": "OK",
  "message": "Payment Collection API is running",
  "timestamp": "2025-12-16T10:00:00.000Z"
}
```

### Database Connection Test

```bash
# Test GET customers endpoint
curl http://YOUR_EC2_PUBLIC_IP:5000/api/customers

# Expected Response:
{
  "success": true,
  "data": [...]
}
```

### Frontend Integration Test

Update frontend `.env`:
```env
EXPO_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP:5000/api
```

Rebuild and test:
```bash
cd payment-app-frontend
npm run web
```

### PM2 Monitoring

```bash
# View logs
pm2 logs payment-backend

# Monitor processes
pm2 monit

# Check status
pm2 status
```

---

## Environment Variable Integration

### Backend API Integration

The backend uses environment variables through `process.env`:

**File:** `payment-app-backend/src/config/database.js`
```javascript
module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'payment_collection_db',
};
```

### Frontend API Integration

The frontend uses Expo Constants to access environment variables:

**File:** `payment-app-frontend/src/services/api.js`
```javascript
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});
```

**File:** `payment-app-frontend/app.json`
```json
{
  "expo": {
    "extra": {
      "API_URL": process.env.EXPO_PUBLIC_API_URL
    }
  }
}
```

---

## Continuous Deployment Workflow

### Automatic Deployment on Git Push

1. **Developer pushes to `main` branch**
   ```bash
   git add .
   git commit -m "Update payment feature"
   git push origin main
   ```

2. **GitHub Actions triggers CI/CD pipeline**
   - Runs tests and linting
   - Builds application
   - Deploys to EC2 (if on main branch)

3. **EC2 receives deployment**
   - Pulls latest code
   - Installs dependencies
   - Runs migrations
   - Restarts service with PM2

4. **Service automatically updates**
   - Zero-downtime deployment with PM2 reload
   - Logs available via `pm2 logs`

### Manual Deployment (if needed)

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Navigate to project
cd ~/payment-app-backend

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run migrate

# Restart with PM2
pm2 restart payment-backend
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000
# Kill process
sudo kill -9 <PID>
```

#### 2. Database Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql
# Restart MySQL
sudo systemctl restart mysql
```

#### 3. PM2 Process Not Running
```bash
# Restart PM2 process
pm2 restart payment-backend
# View logs
pm2 logs payment-backend
```

#### 4. CORS Errors
- Update `CORS_ORIGIN` in backend `.env`
- Include frontend domain/IP in allowed origins

#### 5. Environment Variables Not Loading
```bash
# Check .env file exists
ls -la .env
# Verify PM2 is loading .env
pm2 restart payment-backend --update-env
```

---

## Monitoring and Maintenance

### Server Monitoring

```bash
# CPU and Memory usage
pm2 monit

# View logs in real-time
pm2 logs payment-backend --lines 100

# Check disk space
df -h
```

### Database Backups

```bash
# Backup database
mysqldump -u root -p payment_collection_db > backup_$(date +%Y%m%d).sql

# Automate with cron (daily at 2 AM)
crontab -e
0 2 * * * mysqldump -u root -pYOUR_PASSWORD payment_collection_db > /home/ubuntu/backups/db_$(date +\%Y\%m\%d).sql
```

### Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to Git
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Limit MySQL to localhost only
   - Regular backups

3. **Server Security**
   - Keep system updated
   - Configure firewall (UFW)
   - Use SSH keys instead of passwords
   - Disable root login

4. **Application Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Sanitize user inputs
   - Keep dependencies updated

---

## Production Checklist

- [ ] Backend repository created on GitHub
- [ ] Frontend repository created on GitHub
- [ ] GitHub Actions secrets configured
- [ ] EC2 instance launched and configured
- [ ] MySQL installed and secured
- [ ] Backend deployed with PM2
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Environment variables set correctly
- [ ] API health check passing
- [ ] Frontend connecting to backend API
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] CI/CD pipeline tested

---

## Support and Documentation

- **Backend API Documentation:** `payment-app-backend/API_DOCUMENTATION.md`
- **Frontend README:** `payment-app-frontend/README.md`
- **Database Schema:** `payment-app-backend/src/db/schema.sql`

---

**Last Updated:** December 16, 2025
