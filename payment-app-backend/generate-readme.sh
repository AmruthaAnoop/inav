#!/bin/bash

# Comprehensive Backend README Generator

cat > README.md << 'EOF'
# Payment Collection Backend API

A production-ready Node.js + Express backend for managing personal loan payments with MySQL database.

## Features

✅ RESTful API for customer and payment management
✅ Comprehensive input validation and error handling
✅ Database transactions for data consistency
✅ JWT authentication ready
✅ CORS enabled for mobile app integration
✅ Rate limiting and security headers
✅ Database migrations and seed data
✅ Comprehensive logging
✅ AWS EC2 deployment ready
✅ CI/CD with GitHub Actions

## Project Structure

```
payment-app-backend/
├── src/
│   ├── index.js              # Application entry point
│   ├── config/
│   │   └── database.js       # Database connection pool
│   ├── db/
│   │   ├── schema.sql        # Database schema
│   │   └── migrations.js     # Migration runner
│   ├── models/
│   │   ├── Customer.js       # Customer model
│   │   └── Payment.js        # Payment model
│   ├── services/
│   │   └── PaymentService.js # Business logic
│   ├── routes/
│   │   ├── customerRoutes.js # Customer endpoints
│   │   └── paymentRoutes.js  # Payment endpoints
│   └── middleware/
│       ├── errorHandler.js   # Error handling
│       └── validation.js     # Input validation
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # GitHub Actions pipeline
├── .env.example              # Environment template
├── package.json              # Dependencies
├── deploy.sh                 # AWS deployment script
└── README.md                 # This file
```

## Prerequisites

- Node.js 18.x or 20.x
- MySQL 8.0+
- npm or yarn
- Git

## Local Setup

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/payment-app-backend.git
cd payment-app-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payment_collection_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:19000,http://localhost:8081
```

### 3. Database Setup

```bash
# Create database and tables
npm run migrate
```

### 4. Run Application

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

The API will be available at: `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Payment Collection API is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Customers

#### Get All Customers

```
GET /api/customers?limit=50&offset=0
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "issue_date": "2023-01-15",
      "interest_rate": 8.5,
      "tenure": 36,
      "emi_due": 5000,
      "outstanding_balance": 150000,
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

#### Get Customer by Account Number

```
GET /api/customers/:account_number
```

Example: `GET /api/customers/ACC001`

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account_number": "ACC001",
    "customer_name": "Rahul Kumar",
    "email": "rahul@example.com",
    "outstanding_balance": 150000,
    "total_payments": 5,
    "total_paid": 25000,
    "last_payment_date": "2024-01-10"
  }
}
```

#### Create Customer

```
POST /api/customers
Content-Type: application/json

{
  "account_number": "ACC004",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543213",
  "issue_date": "2024-01-01",
  "interest_rate": 8.75,
  "tenure": 36,
  "emi_due": 5500,
  "loan_amount": 198000,
  "outstanding_balance": 195000
}
```

Response:
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 4,
    "account_number": "ACC004",
    "customer_name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Payments

#### Process Payment

```
POST /api/payments
Content-Type: application/json

{
  "account_number": "ACC001",
  "payment_amount": 5000,
  "payment_method": "UPI",
  "transaction_id": "TXN123456789",
  "remarks": "Monthly EMI payment"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "success": true,
    "payment": {
      "id": 1,
      "payment_reference_id": "PAY-1705315200000-abc12345",
      "status": "SUCCESS",
      "payment_date": "2024-01-15T10:30:00Z"
    },
    "customer": {
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "outstanding_balance": 145000,
      "emi_due": 5000
    }
  }
}
```

#### Get Payment History

```
GET /api/payments/:account_number?limit=50&offset=0
```

Example: `GET /api/payments/ACC001`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "payment_reference_id": "PAY-1705315200000-abc12345",
      "customer_id": 1,
      "account_number": "ACC001",
      "payment_date": "2024-01-15T10:30:00Z",
      "payment_amount": 5000,
      "status": "SUCCESS",
      "payment_method": "UPI",
      "transaction_id": "TXN123456789"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

#### Get Payment History with Statistics

```
GET /api/payments/history/:account_number
```

Example: `GET /api/payments/history/ACC001`

Response:
```json
{
  "success": true,
  "data": {
    "customer": {
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "outstanding_balance": 150000
    },
    "statistics": {
      "total_payments": 5,
      "total_paid": 25000,
      "failed_payments": 0,
      "last_payment_date": "2024-01-15",
      "avg_payment_amount": 5000
    },
    "transactions": [...]
  }
}
```

## Database Schema

### customers table

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| account_number | VARCHAR(50) | Unique account identifier |
| customer_name | VARCHAR(100) | Customer name |
| email | VARCHAR(100) | Email address |
| phone | VARCHAR(20) | Phone number |
| issue_date | DATE | Loan issue date |
| interest_rate | DECIMAL(5,2) | Annual interest rate |
| tenure | INT | Loan tenure in months |
| emi_due | DECIMAL(12,2) | Monthly EMI amount |
| loan_amount | DECIMAL(15,2) | Total loan amount |
| outstanding_balance | DECIMAL(15,2) | Current outstanding amount |
| status | ENUM | ACTIVE/CLOSED/DEFAULT |

### payments table

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| payment_reference_id | VARCHAR(100) | Unique payment reference |
| customer_id | INT | Foreign key to customers |
| account_number | VARCHAR(50) | Account number |
| payment_date | DATETIME | Payment timestamp |
| payment_amount | DECIMAL(12,2) | Amount paid |
| status | ENUM | PENDING/SUCCESS/FAILED/REVERSED |
| payment_method | ENUM | UPI/CARD/NET_BANKING/CHEQUE |
| transaction_id | VARCHAR(100) | External transaction ID |

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

Error Response Format:

```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Validation Error",
    "path": "/api/payments",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Linting

```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## AWS EC2 Deployment

### Prerequisites

1. AWS Account with EC2 instance (Ubuntu 22.04)
2. SSH key pair for EC2 access
3. Domain name (optional, for SSL)

### Automated Deployment

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Update system packages
- Install Node.js and dependencies
- Setup MySQL database
- Configure Nginx reverse proxy
- Setup PM2 process manager
- Configure firewall
- Setup log rotation

### Manual Setup on EC2

#### 1. SSH into your instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. Follow Local Setup steps

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/payment-app-backend.git
cd payment-app-backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your EC2 settings
```

#### 3. Setup PM2

```bash
sudo npm install -g pm2
npm run migrate
pm2 start src/index.js --name "payment-backend"
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### 4. Setup Nginx

See the `deploy.sh` script for Nginx configuration.

#### 5. Setup SSL (Optional)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Getting EC2 Instance Details

```bash
# Get public IP
aws ec2 describe-instances --query 'Reservations[0].Instances[0].PublicIpAddress'

# Get instance ID
aws ec2 describe-instances --query 'Reservations[0].Instances[0].InstanceId'
```

## GitHub Actions CI/CD

### Setup Secrets

Add these secrets to your GitHub repository:

- `EC2_HOST` - Your EC2 instance IP
- `EC2_USER` - EC2 username (usually `ubuntu`)
- `EC2_SSH_KEY` - Private SSH key for EC2 access
- `SLACK_WEBHOOK` - Slack webhook for notifications (optional)

### Pipeline Stages

1. **Build** - Install dependencies, lint, test
2. **Deploy** - Deploy to EC2 (main branch only)
3. **Notify** - Send Slack notification

## Monitoring and Maintenance

### View Logs

```bash
# Real-time logs
sudo pm2 logs payment-backend

# View error logs
sudo pm2 logs payment-backend --err

# Save logs to file
sudo pm2 save
```

### Monitor Performance

```bash
# Check process status
pm2 status

# Monitor resources
pm2 monit
```

### Restart Application

```bash
pm2 restart payment-backend
```

## Security Best Practices

1. ✅ Use environment variables for sensitive data
2. ✅ Enable CORS only for trusted origins
3. ✅ Use HTTPS in production
4. ✅ Implement rate limiting
5. ✅ Validate all inputs
6. ✅ Use prepared statements (mysql2 does this by default)
7. ✅ Keep dependencies updated
8. ✅ Use helmet for security headers
9. ✅ Setup database backups
10. ✅ Monitor application logs

## Performance Optimization

- Connection pooling enabled (10 connections)
- Database indexes on frequently queried columns
- Pagination support for list endpoints
- Request timeout: 15 seconds
- Gzip compression via Nginx

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
- Ensure MySQL is running: `sudo systemctl start mysql`
- Check database credentials in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Kill process on port 5000: `lsof -ti:5000 | xargs kill -9`
- Change PORT in `.env`

### PM2 Not Starting

```
pm2 start src/index.js
[PM2] App not running, starting it now: ...
```

**Solution:**
- Check logs: `pm2 logs`
- Verify Node.js path: `which node`
- Check file permissions

## Dependencies

- `express` - Web framework
- `mysql2` - MySQL driver
- `dotenv` - Environment configuration
- `cors` - CORS middleware
- `helmet` - Security headers
- `express-validator` - Input validation
- `uuid` - Unique ID generation
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

## Development Dependencies

- `nodemon` - Auto-reload
- `eslint` - Code linting
- `jest` - Testing framework
- `supertest` - HTTP testing

## License

MIT

## Support

For issues and questions, please create an issue on GitHub.

---

**Last Updated:** January 2024
**Version:** 1.0.0
EOF

echo "✅ README.md generated successfully!"
