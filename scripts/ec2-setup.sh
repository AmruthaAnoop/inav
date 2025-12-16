#!/bin/bash
# EC2 Server Setup Script for Payment Collection App
# Run this on a fresh Ubuntu 22.04 EC2 instance

set -e

echo "🚀 Starting Payment App Server Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
echo "📦 Installing MySQL..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create app directory
echo "📁 Setting up application directory..."
cd ~
git clone https://github.com/AmruthaAnoop/inav.git || echo "Repository already exists"
cd inav/payment-app-backend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --production

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_USER=payment_user
DB_PASSWORD=PaymentApp2025!
DB_NAME=payment_collection_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOF
fi

echo "✅ Server setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure MySQL:"
echo "   sudo mysql -u root"
echo "   CREATE DATABASE payment_collection_db;"
echo "   CREATE USER 'payment_user'@'localhost' IDENTIFIED BY 'PaymentApp2025!';"
echo "   GRANT ALL ON payment_collection_db.* TO 'payment_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo ""
echo "2. Run database migrations:"
echo "   npm run migrate"
echo ""
echo "3. Start the backend:"
echo "   pm2 start src/index.js --name payment-backend"
echo "   pm2 save"
echo ""
echo "4. Configure Nginx (copy payment-app to /etc/nginx/sites-available/)"
echo ""
echo "🎉 Setup complete!"
