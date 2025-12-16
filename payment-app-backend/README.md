# Payment Collection Backend README

A production-ready Node.js + Express backend for managing personal loan payments with MySQL database.

## Features

✅ RESTful API for customer and payment management
✅ **Pagination support on all list endpoints**
✅ **Environment-based configuration with .env**
✅ **Interactive Swagger API documentation**
✅ **Postman collection included**
✅ **Comprehensive test suite with 70% coverage**
✅ Comprehensive input validation and error handling
✅ Database transactions for data consistency
✅ JWT authentication ready
✅ CORS enabled for mobile app integration
✅ Rate limiting and security headers
✅ Database migrations and seed data
✅ Comprehensive logging
✅ AWS EC2 deployment ready
✅ CI/CD with GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- MySQL 8.0+
- npm or yarn

### Local Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/payment-app-backend.git
cd payment-app-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Configure database in .env
nano .env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`

**📚 API Documentation:**
- **Swagger UI:** http://localhost:5000/api-docs (Interactive)
- **API Docs:** [API_DOCS.md](./API_DOCS.md) (Comprehensive guide)
- **Postman:** Import [postman_collection.json](./postman_collection.json)

## Project Structure

```
payment-app-backend/
├── src/
│   ├── index.js              # Entry point
│   ├── config/               # Configuration
│   ├── db/                   # Database schema & migrations
│   ├── models/               # Data models
│   ├── services/             # Business logic
│   ├── routes/               # API routes
│   └── middleware/           # Express middleware
├── .github/workflows/        # CI/CD pipelines
├── .env.example              # Environment template
├── deploy.sh                 # AWS deployment
└── package.json
```

## API Endpoints

### Health Check
```
GET /api/health (paginated)
GET    /api/customers/:account     # Get customer details
POST   /api/customers              # Create customer
```

### Payments
```
POST   /api/payments               # Process payment
GET    /api/payments               # Get all payments (paginated with filters)
GET    /api/payments/:account      # Get payment history (paginated)
GET    /api/payments/history/:account  # Get with statistics
GET    /api/payments/stats/dashboard   # Get dashboard stats
```

Create a `.env` file based on `.env.example`:

```env
# Server
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payment_collection_db

# CORS
CORS_ORIGIN=http://localhost:19000,http://localhost:8081

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# JWT (for future authentication)
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
## Environment Variables

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
JWT_SECRET=your_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:19000,http://localhost:8081
```

## Database Setup

The schema includes:

- **customers** - Customer and loan information
- **payments** - Payment records and transactions
- **payment_schedule** - Monthly payment schedule

Run migrations:
```bash
npm run migrate
```

## Testing

**Comprehensive test suite with 70% coverage threshold**

```bash
# Run all tests with coverage
npm test

# Run in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Test Setup
1. Create test database: `CREATE DATABASE payment_collection_test;`
2. Run schema: `mysql -u root -p payment_collection_test < src/db/schema.sql`
3. Configure `.env.test` with test database credentials
4. Run tests: `npm test`

**For detailed testing guide:** [TESTING.md](./TESTING.md)

**Test Coverage:**
- ✅ Unit tests for all models
- ✅ Integration tests for all API endpoints
- ✅ Pagination testing
- ✅ Error handling and validation
- ✅ Database transaction rollback

## AWS EC2 Deployment

### Automated Setup

```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Setup

1. SSH into EC2 instance
2. Follow Local Setup steps
3. Configure PM2:
```bash
npm run migrate
pm2 start src/index.js --name "payment-backend"
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup
```
4. Setup Nginx as reverse proxy
5. Configure SSL with certbot

## GitHub Actions CI/CD

### Required Secrets

- `EC2_HOST` - EC2 instance IP
- `EC2_USER` - SSH username
- `EC2_SSH_KEY` - Private SSH key

### Pipeline

- Builds on push to main/develop
- Runs tests and linting
- Deploys to EC2 (main branch only)
- Sends Slack notifications

## Running Tests

```bash
npm test                 # Run tests
npm run lint             # Run linter
npm test -- --coverage   # Coverage report
```

## Monitoring

```bash
pm2 status               # Check process status
pm2 logs payment-backend # View logs
pm2 monit                # Monitor resources
```

## Error Handling

All endpoints follow REST conventions:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## Security Features

- ✅ Input validation with express-validator
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ SQL injection prevention (parameterized queries)
- ✅ Environment variable protection
- ✅ Error message sanitization

## Performance

- Connection pooling (10 connections)
- Database indexes on key columns
- Pagination support
- Gzip compression via Nginx
- Caching ready

## Scripts

```bash
npm start                # Production start
npm run dev              # Development with auto-reload
npm test                 # Run tests
npm run lint             # Lint code
npm run migrate          # Run database migrations
```

## Troubleshooting

### Database Connection Failed
```bash
# Ensure MySQL is running
sudo systemctl start mysql

# Check credentials in .env
# Verify database: mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
```

### PM2 Issues
```bash
# View logs
pm2 logs payment-backend

# Restart
pm2 restart payment-backend

# Reload
pm2 reload payment-backend
```

## Dependencies

- `express` - Web framework
- `mysql2` - MySQL driver
- `cors` - Cross-origin support
- `helmet` - Security headers
- `express-validator` - Input validation
- `uuid` - Unique ID generation
- `dotenv` - Environment config

## Development Dependencies

- `nodemon` - Auto-reload
- `eslint` - Code linting
- `jest` - Testing
- `supertest` - HTTP testing

## Best Practices Implemented

1. Clean MVC architecture
2. Service layer for business logic
3. Proper error handling
4. Input validation
5. Database transactions
6. Security headers
7. CORS configuration
8. Logging and monitoring
9. Environment-based configuration
10. Scalable database design

## Support

For issues and questions, create a GitHub issue or contact the development team.

---

**Version:** 1.0.0
**Last Updated:** January 2024
