#!/bin/bash

# Payment Collection Backend - AWS EC2 Deployment Setup
# This script configures the EC2 instance and deploys the application

set -e

echo "🚀 Starting Payment Collection Backend Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install MySQL
echo "📦 Installing MySQL Server..."
sudo apt-get install -y mysql-server

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Git
echo "📦 Installing Git..."
sudo apt-get install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/payment-app-backend
sudo chown -R $USER:$USER /var/www/payment-app-backend

# Clone repository
echo "📥 Cloning repository..."
cd /var/www/payment-app-backend
git clone https://github.com/YOUR_USERNAME/payment-app-backend.git .

# Install dependencies
echo "📦 Installing Node dependencies..."
npm ci

# Setup environment
echo "⚙️ Setting up environment variables..."
cp .env.example .env

# Configure MySQL database
echo "🗄️ Setting up MySQL database..."
sudo mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS payment_collection_db;
CREATE USER IF NOT EXISTS 'payment_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON payment_collection_db.* TO 'payment_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Update .env with database credentials
sed -i 's/DB_USER=root/DB_USER=payment_user/g' .env
sed -i 's/DB_PASSWORD=your_password/DB_PASSWORD=secure_password/g' .env

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate

# Start application with PM2
echo "🎯 Starting application with PM2..."
pm2 start src/index.js --name "payment-backend" --instances max
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Configure Nginx reverse proxy
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/payment-app > /dev/null << EOF
upstream payment_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://payment_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/health {
        proxy_pass http://payment_backend;
        access_log off;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/payment-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt (optional)
echo "🔒 Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx

# Configure firewall
echo "🛡️ Configuring firewall..."
sudo apt-get install -y ufw
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Setup log rotation
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/payment-app > /dev/null << EOF
/var/www/payment-app-backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        pm2 reload payment-backend > /dev/null 2>&1 || true
    endscript
}
EOF

# Create logs directory
mkdir -p /var/www/payment-app-backend/logs

echo "✅ Deployment completed successfully!"
echo "📊 Application Status:"
pm2 status
echo ""
echo "🔗 Access your application at: http://$(curl -s https://api.ipify.org)"
echo "💡 To configure SSL, run: sudo certbot --nginx -d yourdomain.com"
echo "📝 Application logs: sudo pm2 logs payment-backend"
