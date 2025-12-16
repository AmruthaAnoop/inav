# Master README - Payment Collection App

A complete payment collection system for personal loans with React Native frontend, Node.js backend, and AWS deployment.

## 📋 Project Overview

This is a full-stack application consisting of:

1. **Backend** - Node.js + Express REST API
2. **Frontend** - React Native mobile app
3. **Database** - MySQL
4. **Deployment** - AWS EC2 with Nginx
5. **CI/CD** - GitHub Actions

## 🗂️ Repository Structure

```
payment-collection-app/
├── payment-app-backend/          # Backend API
│   ├── src/
│   ├── .github/workflows/        # CI/CD pipelines
│   ├── deploy.sh                 # AWS deployment
│   └── README.md
├── payment-app-frontend/         # React Native app
│   ├── src/
│   ├── .github/workflows/        # CI/CD pipelines
│   └── README.md
├── SETUP_GUIDE.md               # Setup instructions
└── README.md                    # This file
```

## 🚀 Quick Start

### Option 1: Local Development

```bash
# Terminal 1 - Backend
cd payment-app-backend
npm install
cp .env.example .env
npm run migrate
npm run dev

# Terminal 2 - Frontend
cd payment-app-frontend
npm install
cp .env.example .env
npm start
```

### Option 2: Docker (Recommended)

```bash
cd payment-app-backend
docker-compose up
```

### Option 3: AWS EC2

```bash
cd payment-app-backend
chmod +x deploy.sh
./deploy.sh
```

## 📦 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Validation:** express-validator
- **Security:** helmet, CORS
- **Testing:** Jest, Supertest
- **Deployment:** PM2, Nginx

### Frontend
- **Framework:** React Native with Expo
- **State:** React Context API
- **HTTP:** Axios
- **Navigation:** React Navigation
- **UI:** Native components + StyleSheet
- **Storage:** AsyncStorage
- **Notifications:** Toast notifications

## 📁 Backend Features

### APIs Implemented

1. **Customer Management**
   - GET /api/customers - List all customers
   - GET /api/customers/:account_number - Get customer details
   - POST /api/customers - Create customer

2. **Payment Processing**
   - POST /api/payments - Process payment
   - GET /api/payments/:account_number - Payment history
   - GET /api/payments/history/:account_number - Detailed history with stats

3. **Health Check**
   - GET /api/health - API status

### Database Schema

- **customers** table - Customer and loan information
- **payments** table - Payment records
- **payment_schedule** table - Monthly EMI schedule

### Security Features

- Input validation with express-validator
- SQL injection prevention with parameterized queries
- CORS configuration
- Helmet security headers
- Error message sanitization
- Environment-based secrets

## 📱 Frontend Features

### Screens

1. **Loan Details Screen**
   - Search customer by account number
   - Display loan information
   - Show outstanding balance
   - Display payment statistics
   - Navigation to payment form

2. **Payment Form Screen**
   - Payment amount input
   - Payment method selection
   - Optional transaction ID
   - Optional remarks
   - Success confirmation modal
   - Updated balance display

### Features

- Beautiful responsive UI
- Error handling and validation
- Loading states
- Success confirmations
- Toast notifications
- Real-time API integration

## 🔧 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=payment_collection_db

JWT_SECRET=your_secret
CORS_ORIGIN=http://localhost:19000
```

### Frontend (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_ENVIRONMENT=development
```

## 🌐 API Examples

### Get Customer Details

```bash
curl http://localhost:5000/api/customers/ACC001
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account_number": "ACC001",
    "customer_name": "Rahul Kumar",
    "outstanding_balance": 150000,
    "emi_due": 5000
  }
}
```

### Process Payment

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "ACC001",
    "payment_amount": 5000,
    "payment_method": "UPI"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "id": 1,
      "payment_reference_id": "PAY-xxx",
      "status": "SUCCESS"
    }
  }
}
```

## 📊 Database Schema

### customers table
- id (PRIMARY KEY)
- account_number (UNIQUE)
- customer_name
- email
- phone
- issue_date
- interest_rate
- tenure
- emi_due
- outstanding_balance
- status (ACTIVE/CLOSED/DEFAULT)

### payments table
- id (PRIMARY KEY)
- payment_reference_id (UNIQUE)
- customer_id (FOREIGN KEY)
- account_number
- payment_date
- payment_amount
- status (PENDING/SUCCESS/FAILED)
- payment_method (UPI/CARD/NET_BANKING/CHEQUE)
- transaction_id
- remarks

## 🚀 Deployment

### AWS EC2 Setup

1. **Create EC2 Instance**
   - OS: Ubuntu 22.04
   - Instance Type: t3.medium or larger
   - Security Group: Allow 22, 80, 443

2. **Automated Deployment**
   ```bash
   ssh -i key.pem ubuntu@ec2-ip
   git clone <your-repo>
   cd payment-app-backend
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Manual Setup**
   - Install Node.js
   - Install MySQL
   - Install Nginx
   - Configure PM2
   - Setup SSL with certbot

### GitHub Actions CI/CD

1. **Create GitHub Repositories**
   - payment-app-backend
   - payment-app-frontend

2. **Add Secrets**
   - EC2_HOST
   - EC2_USER
   - EC2_SSH_KEY
   - EXPO_TOKEN
   - SLACK_WEBHOOK (optional)

3. **Pipelines**
   - Backend: Build → Test → Deploy to EC2
   - Frontend: Build → Test → Build APK/IPA

## 🧪 Testing

### Backend Tests

```bash
cd payment-app-backend
npm test                 # Run tests
npm run lint             # Lint code
npm test -- --coverage   # Coverage report
```

### Frontend Tests

```bash
cd payment-app-frontend
npm test                 # Run tests
npm run lint             # Lint code
```

## 📝 Logging

### Backend Logs

```bash
# View logs with PM2
pm2 logs payment-backend

# View error logs
pm2 logs payment-backend --err

# Save logs to file
pm2 save
```

### Frontend Logs

```bash
# React Native logs
npm start  # and check console

# Expo logs
expo logs
```

## 🔒 Security Best Practices

1. ✅ Use environment variables for secrets
2. ✅ Enable HTTPS in production
3. ✅ Implement rate limiting
4. ✅ Validate all inputs
5. ✅ Use prepared statements
6. ✅ Keep dependencies updated
7. ✅ Implement CORS properly
8. ✅ Use security headers
9. ✅ Monitor logs
10. ✅ Regular backups

## 📈 Performance Optimization

- Database connection pooling
- Pagination for list endpoints
- Indexes on frequently queried columns
- Nginx caching and compression
- React Native FlatList for lists
- Memoization for expensive operations
- Code splitting in frontend

## 🐛 Troubleshooting

### Backend Issues

**MySQL Connection Error**
```bash
sudo systemctl start mysql
mysql -u root -p -e "SHOW DATABASES;"
```

**Port Already in Use**
```bash
lsof -ti:5000 | xargs kill -9
```

**PM2 Issues**
```bash
pm2 logs payment-backend
pm2 restart payment-backend
```

### Frontend Issues

**Module Not Found**
```bash
rm -rf node_modules package-lock.json
npm install
npm start -- --reset-cache
```

**API Connection**
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check .env configuration
# Check CORS settings on backend
```

## 📚 Documentation

- [Backend README](payment-app-backend/README.md)
- [Frontend README](payment-app-frontend/README.md)
- [Setup Guide](SETUP_GUIDE.md)
- [API Documentation](payment-app-backend/API.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with details
3. Contact development team

---

## ✅ Checklist for Production Deployment

- [ ] Update environment variables
- [ ] Configure SSL certificates
- [ ] Setup database backups
- [ ] Configure monitoring
- [ ] Setup log aggregation
- [ ] Test disaster recovery
- [ ] Review security settings
- [ ] Performance testing
- [ ] Load testing
- [ ] Documentation review

---

**Version:** 1.0.0
**Last Updated:** January 2024
**Status:** ✅ Production Ready

