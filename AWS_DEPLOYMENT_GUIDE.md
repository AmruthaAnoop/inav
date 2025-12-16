# AWS EC2 Deployment Guide

## 📋 Prerequisites

- AWS Account
- AWS CLI installed
- GitHub repository with CI/CD pipeline
- Domain name (optional)

---

## 🚀 Step 1: Launch EC2 Instance

### 1.1 Launch Instance
1. Go to AWS Console → EC2 → Launch Instance
2. **Name**: `payment-app-server`
3. **AMI**: Ubuntu Server 22.04 LTS
4. **Instance Type**: t2.micro (free tier) or t2.small
5. **Key Pair**: Create new or use existing
6. **Security Group**: Create with these rules:

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | Your IP |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| Custom TCP | 5000 | 0.0.0.0/0 |
| Custom TCP | 3306 | Your IP |

### 1.2 Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@<EC2-PUBLIC-IP>
```

---

## 🔧 Step 2: Server Setup

### 2.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 2.3 Install MySQL
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE payment_collection_db;
CREATE USER 'payment_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON payment_collection_db.* TO 'payment_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2.5 Install Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 Step 3: Deploy Backend

### 3.1 Clone Repository
```bash
cd ~
git clone https://github.com/AmruthaAnoop/inav.git
cd inav/payment-app-backend
```

### 3.2 Configure Environment
```bash
cp .env.example .env
nano .env
```

**Edit .env:**
```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_USER=payment_user
DB_PASSWORD=YourSecurePassword123!
DB_NAME=payment_collection_db

JWT_SECRET=your-super-secret-jwt-key-here
```

### 3.3 Install Dependencies & Setup Database
```bash
npm ci --production
npm run migrate
```

### 3.4 Start with PM2
```bash
pm2 start src/index.js --name "payment-backend"
pm2 save
pm2 startup
```

---

## 🌐 Step 4: Configure Nginx

### 4.1 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/payment-app
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use EC2 public IP

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/api/health;
    }
}
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/payment-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 Step 5: SSL Certificate (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ⚙️ Step 6: GitHub Actions Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `EC2_HOST` | Your EC2 public IP or domain |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your .pem file |
| `DB_PASSWORD` | Your MySQL password |

---

## 🔄 Step 7: Create Systemd Service (Alternative to PM2)

```bash
sudo nano /etc/systemd/system/payment-backend.service
```

```ini
[Unit]
Description=Payment Collection Backend API
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/inav/payment-app-backend
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start payment-backend
sudo systemctl enable payment-backend
sudo systemctl status payment-backend
```

---

## 📱 Step 8: Frontend Deployment (Expo)

### Option A: Expo Go (Development)
The mobile app runs via Expo Go on physical devices.

### Option B: Build APK for Distribution
```bash
cd ~/inav/payment-app-frontend

# Update API URL for production
echo "EXPO_PUBLIC_API_URL=http://YOUR-EC2-IP:5000/api" > .env

# Build APK
npx expo build:android
```

### Option C: Web Version (if needed)
```bash
npx expo export:web
# Deploy to S3 or serve via Nginx
```

---

## ✅ Step 9: Verify Deployment

### Test Backend API
```bash
curl http://YOUR-EC2-IP/api/health
curl http://YOUR-EC2-IP/api/customers
```

### Expected Response
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-12-17T..."
}
```

---

## 🔍 Troubleshooting

### Check Backend Logs
```bash
pm2 logs payment-backend
# or
sudo journalctl -u payment-backend -f
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check MySQL Status
```bash
sudo systemctl status mysql
```

### Restart Services
```bash
pm2 restart payment-backend
sudo systemctl restart nginx
sudo systemctl restart mysql
```

---

## 📊 Monitoring Commands

```bash
# View running processes
pm2 status

# View CPU/Memory
pm2 monit

# View logs
pm2 logs

# Restart if high memory
pm2 restart payment-backend --max-memory-restart 500M
```

---

## 🔗 Final URLs

| Service | URL |
|---------|-----|
| Backend API | `http://3.109.121.160:5000/api` |
| Health Check | `http://3.109.121.160:5000/api/health` |
| API Docs (Swagger) | `http://3.109.121.160:5000/api-docs/` |
| Customers | `http://3.109.121.160:5000/api/customers` |
| Payments | `http://3.109.121.160:5000/api/payments` |

---

## 📋 Deliverables Checklist

- [x] GitHub Repository: https://github.com/AmruthaAnoop/inav
- [x] EC2 Instance Running: 3.109.121.160
- [x] Backend API Deployed: `http://3.109.121.160:5000/api`
- [x] CI/CD Pipeline Active (GitHub Actions)
- [x] Environment Variables Configured
- [x] Database Schema Created (customers, payments tables)
- [x] Sample Data Loaded (3 customers)
- [x] All API Endpoints Working
