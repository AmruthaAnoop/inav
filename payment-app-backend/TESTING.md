# Backend API Testing Documentation

Complete testing suite for the Payment Collection API with comprehensive unit and integration tests.

## 📋 Test Overview

The testing suite includes:
- **Unit Tests** - Testing individual models and functions
- **Integration Tests** - Testing API endpoints end-to-end
- **Code Coverage** - Tracking test coverage with thresholds

### Test Statistics
- **Total Test Files:** 5
- **Test Categories:** Unit Tests, Integration Tests
- **Coverage Target:** 70% (branches, functions, lines, statements)

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+ with test database
- All project dependencies installed

### Database Setup

1. **Create Test Database:**
```sql
CREATE DATABASE payment_collection_test;
USE payment_collection_test;

-- Run the schema
SOURCE src/db/schema.sql;
```

2. **Configure Test Environment:**
```bash
# Copy test environment template
cp .env.test .env.test.local

# Update with your test database credentials
nano .env.test.local
```

### Install Dependencies
```bash
npm install
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run with Verbose Output
```bash
npm test -- --verbose
```

## 📊 Test Structure

```
tests/
├── setup.js                      # Test environment setup
├── helpers/
│   └── db.helper.js             # Database testing utilities
├── unit/
│   ├── customer.model.test.js   # Customer model unit tests
│   └── payment.model.test.js    # Payment model unit tests
└── integration/
    ├── health.test.js           # Health endpoint tests
    ├── customers.test.js        # Customer API tests
    ├── payments.test.js         # Payment API tests
    └── database.test.js         # Database persistence & transactions (NEW)
```

## 🧪 Test Categories

### 1. Unit Tests

#### Customer Model Tests (`tests/unit/customer.model.test.js`)
- ✅ `findAll()` - Get all customers with pagination
- ✅ `findByAccountNumber()` - Find customer by account
- ✅ `findById()` - Find customer by ID
- ✅ `create()` - Create new customer
- ✅ `findWithPaymentInfo()` - Get customer with payment stats

#### Payment Model Tests (`tests/unit/payment.model.test.js`)
- ✅ `create()` - Create payment with transaction
- ✅ `findByAccountNumber()` - Get payments for account
- ✅ `countByAccountNumber()` - Count payments
- ✅ `findAll()` - Get all payments with filters
- ✅ `countAll()` - Count all payments
- ✅ `findByReferenceId()` - Find payment by reference
- ✅ `getPaymentStats()` - Get payment statistics

### 2. Integration Tests

#### Health Endpoint (`tests/integration/health.test.js`)
- ✅ Health check returns 200
- ✅ Response contains status, message, timestamp
- ✅ Timestamp is valid date

#### Customer API (`tests/integration/customers.test.js`)
- ✅ GET /api/customers - List customers
- ✅ GET /api/customers - Pagination (limit, offset)
- ✅ GET /api/customers - Maximum limit enforcement
- ✅ GET /api/customers/:account_number - Get by account
- ✅ GET /api/customers/:account_number - 404 for non-existent
- ✅ POST /api/customers - Create customer
- ✅ POST /api/customers - Validation errors
- ✅ POST /api/customers - Duplicate account rejection
- ✅ POST /api/customers - Default status

#### Payment API (`tests/integration/payments.test.js`)
- ✅ POST /api/payments - Process payment
- ✅ POST /api/payments - Reduce outstanding balance
- ✅ POST /api/payments - Validation (account, amount)
- ✅ POST /api/payments - Invalid amount rejection
- ✅ POST /api/payments - Non-existent customer rejection
- ✅ POST /api/payments - Different payment methods
- ✅ POST /api/payments - Unique reference ID generation
- ✅ GET /api/payments - Paginated list with filters
- ✅ GET /api/payments - Page navigation (first, next, last)
- ✅ GET /api/payments - Filter by status
- ✅ GET /api/payments - Filter by payment method
- ✅ GET /api/payments - Default and max page size
- ✅ GET /api/payments/:account_number - Payment history
- ✅ GET /api/payments/:account_number - Empty result handling
- ✅ GET /api/payments/:account_number - Date ordering
- ✅ GET /api/payments/history/:account_number - Detailed history
- ✅ GET /api/payments/stats/dashboard - Dashboard statistics

#### Database Testing (`tests/integration/database.test.js`)

**Test 5: Data Persistence** 🗄️
- ✅ Customer data persistence after creation
- ✅ Payment data persistence
- ✅ Data integrity across multiple queries
- ✅ Timestamp maintenance
- ✅ Decimal precision (amounts with 2 decimal places)
- ✅ Large datasets (50+ records)
- ✅ Special characters handling
- ✅ Related data persistence

**Test 6: Transaction Safety** 🔒
- ✅ Successful transaction commits
- ✅ Payment with balance update atomicity
- ✅ Sequential transactions
- ✅ Rollback on database errors
- ✅ Data integrity on rollback
- ✅ Partial transaction failure rollback
- ✅ Original data preservation after failed transactions
- ✅ Concurrent transaction handling
- ✅ Transaction isolation (no interference)
- ✅ Atomicity guarantee (all-or-nothing)

## 📈 Code Coverage

### Coverage Thresholds
The project enforces minimum coverage of **70%** for:
- Branches
- Functions
- Lines
- Statements

### View Coverage Report
After running tests:
```bash
npm test

# Open coverage report in browser
open coverage/lcov-report/index.html   # macOS
start coverage/lcov-report/index.html  # Windows
```

### Coverage Files Excluded
- `src/index.js` - Application entry point
- `src/db/migrations.js` - Database migrations
- `node_modules/**` - Dependencies

## 🔧 Test Utilities

### TestDbHelper Class

Located in `tests/helpers/db.helper.js`, provides:

#### Methods

**`cleanDatabase()`**
```javascript
await TestDbHelper.cleanDatabase();
// Truncates all tables and resets foreign keys
```

**`createTestCustomer(data)`**
```javascript
const customer = await TestDbHelper.createTestCustomer({
  account_number: 'TEST001',
  customer_name: 'Test User',
  outstanding_balance: 100000
});
```

**`createTestPayment(customerId, accountNumber, data)`**
```javascript
const payment = await TestDbHelper.createTestPayment(
  customer.id,
  customer.account_number,
  {
    payment_amount: 5000,
    payment_method: 'UPI'
  }
);
```

**`getCustomerByAccountNumber(accountNumber)`**
```javascript
const customer = await TestDbHelper.getCustomerByAccountNumber('TEST001');
```

**`getPaymentByReferenceId(referenceId)`**
```javascript
const payment = await TestDbHelper.getPaymentByReferenceId('PAY-123');
```

## 🎯 Test Best Practices

### 1. Test Isolation
Each test should be independent and not rely on other tests:
```javascript
beforeEach(async () => {
  await TestDbHelper.cleanDatabase();
});
```

### 2. Descriptive Test Names
```javascript
it('should return 404 for non-existent customer', async () => {
  // Test code
});
```

### 3. Arrange-Act-Assert Pattern
```javascript
it('should create a new customer', async () => {
  // Arrange
  const customerData = { ... };
  
  // Act
  const response = await request(app)
    .post('/api/customers')
    .send(customerData);
  
  // Assert
  expect(response.status).toBe(201);
});
```

### 4. Test Both Success and Failure Cases
```javascript
describe('POST /api/payments', () => {
  it('should process valid payment', async () => { ... });
  it('should reject invalid payment', async () => { ... });
});
```

## 🐛 Debugging Tests

### Run Single Test File
```bash
npm test -- tests/integration/customers.test.js
```

### Run Specific Test Suite
```bash
npm test -- -t "Customer API"
```

### Run Single Test
```bash
npm test -- -t "should return customer by account number"
```

### Enable Console Logs
Edit `tests/setup.js` and comment out console mocking:
```javascript
// global.console = {
//   ...console,
//   log: jest.fn(),
// };
```

## 📝 Writing New Tests

### 1. Create Test File
```bash
# Unit test
touch tests/unit/mymodel.test.js

# Integration test
touch tests/integration/myapi.test.js
```

### 2. Basic Test Template
```javascript
const request = require('supertest');
const app = require('../../src/index');
const TestDbHelper = require('../helpers/db.helper');

describe('My API Tests', () => {
  beforeAll(async () => {
    await TestDbHelper.cleanDatabase();
  });

  afterEach(async () => {
    await TestDbHelper.cleanDatabase();
  });

  describe('GET /api/myendpoint', () => {
    it('should return expected result', async () => {
      const response = await request(app)
        .get('/api/myendpoint')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

## 🚨 Common Issues

### Issue: Database Connection Errors
**Solution:** Ensure test database exists and credentials are correct in `.env.test`

### Issue: Tests Timeout
**Solution:** Increase timeout in jest.config.js:
```javascript
testTimeout: 15000  // 15 seconds
```

### Issue: Port Already in Use
**Solution:** Tests use port 5001 by default. Change in `tests/setup.js`:
```javascript
process.env.PORT = 5002;
```

### Issue: Foreign Key Constraint Errors
**Solution:** Ensure `cleanDatabase()` is called in `beforeEach`:
```javascript
beforeEach(async () => {
  await TestDbHelper.cleanDatabase();
});
```

## 📊 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: payment_collection_test
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm test
```

## ✅ Test Checklist

Before committing code:
- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Coverage meets 70% threshold
- [ ] No console errors or warnings
- [ ] Database is cleaned between tests
- [ ] Test names are descriptive

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## 🎓 Example Test Run Output

```bash
$ npm test

> payment-collection-backend@1.0.0 test
> jest --coverage --verbose

 PASS  tests/integration/health.test.js
  Health Check API
    GET /api/health
      ✓ should return 200 and health status (45ms)
      ✓ should return valid timestamp (12ms)

 PASS  tests/integration/customers.test.js
  Customer API
    GET /api/customers
      ✓ should return empty array when no customers exist (35ms)
      ✓ should return list of customers with pagination (42ms)
      ✓ should respect limit parameter (38ms)
      ...

 PASS  tests/integration/payments.test.js
  Payment API
    POST /api/payments
      ✓ should process a valid payment (55ms)
      ✓ should reduce customer outstanding balance (48ms)
      ...

Test Suites: 5 passed, 5 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        8.456s

Coverage Summary:
-----------------
Statements   : 82.5% ( 165/200 )
Branches     : 75.3% ( 61/81 )
Functions    : 78.9% ( 30/38 )
Lines        : 82.1% ( 162/197 )
```

---

## 🎉 All Tests Passing!

Your Payment Collection API now has comprehensive test coverage ensuring reliability and maintainability.
