# 🧪 Quick Test Reference Card

## Setup (One Time)

```bash
# 1. Create test database
mysql -u root -p -e "CREATE DATABASE payment_collection_test;"
mysql -u root -p payment_collection_test < src/db/schema.sql

# 2. Configure environment
cp .env.test .env.test.local
# Edit credentials in .env.test.local

# 3. Verify setup
npm test
```

## Daily Commands

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Specific test file
npm test -- tests/integration/customers.test.js

# Specific test by name
npm test -- -t "should process a valid payment"

# Coverage report
npm test
# Then open: coverage/lcov-report/index.html
```

## Test Structure

```
tests/
├── setup.js                      # Global config
├── helpers/
│   └── db.helper.js             # Database utils
├── unit/
│   ├── customer.model.test.js   # 15+ tests
│   └── payment.model.test.js    # 20+ tests
└── integration/
    ├── health.test.js           # 2 tests
    ├── customers.test.js        # 12+ tests
    └── payments.test.js         # 25+ tests
```

## Quick Debugging

```bash
# Run with verbose output
npm test -- --verbose

# Run single test suite
npm test -- -t "Customer API"

# See console logs (edit tests/setup.js first)
# Comment out: global.console = { ... }
```

## Coverage Thresholds

- **Target:** 70% minimum
- **Location:** coverage/lcov-report/index.html
- **Check:** Automatically verified on `npm test`

## Common Helpers

```javascript
// In any test file:
const TestDbHelper = require('../helpers/db.helper');

// Clean database
await TestDbHelper.cleanDatabase();

// Create test customer
const customer = await TestDbHelper.createTestCustomer({
  account_number: 'TEST001'
});

// Create test payment
const payment = await TestDbHelper.createTestPayment(
  customer.id,
  customer.account_number
);
```

## Checklist Before Commit

- [ ] `npm test` passes
- [ ] Coverage ≥ 70%
- [ ] New features have tests
- [ ] No console errors

---

**Full Guide:** [TESTING.md](./TESTING.md)
