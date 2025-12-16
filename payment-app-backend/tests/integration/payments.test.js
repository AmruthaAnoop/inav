const request = require('supertest');
const app = require('../../src/index');
const TestDbHelper = require('../helpers/db.helper');

describe('Payment API', () => {
  let testCustomer;

  beforeAll(async () => {
    await TestDbHelper.cleanDatabase();
  });

  beforeEach(async () => {
    await TestDbHelper.cleanDatabase();
    // Create a test customer for payment tests
    testCustomer = await TestDbHelper.createTestCustomer({
      account_number: 'PAY001',
      customer_name: 'Payment Test User',
      outstanding_balance: 100000
    });
  });

  afterAll(async () => {
    await TestDbHelper.cleanDatabase();
  });

  describe('POST /api/payments', () => {
    it('should process a valid payment', async () => {
      const paymentData = {
        account_number: 'PAY001',
        payment_amount: 5000,
        payment_method: 'UPI',
        transaction_id: 'TXN123456',
        remarks: 'Test payment'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('processed successfully');
      expect(response.body.data.payment).toHaveProperty('payment_reference_id');
      expect(response.body.data.payment).toHaveProperty('status', 'SUCCESS');
      expect(response.body.data.payment).toHaveProperty('payment_date');
    });

    it('should reduce customer outstanding balance after payment', async () => {
      const initialBalance = testCustomer.outstanding_balance;
      const paymentAmount = 5000;

      await request(app)
        .post('/api/payments')
        .send({
          account_number: 'PAY001',
          payment_amount: paymentAmount,
          payment_method: 'UPI'
        })
        .expect(201);

      const updatedCustomer = await TestDbHelper.getCustomerByAccountNumber('PAY001');
      expect(parseFloat(updatedCustomer.outstanding_balance)).toBe(
        parseFloat(initialBalance) - paymentAmount
      );
    });

    it('should reject payment with missing account number', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          payment_amount: 5000,
          payment_method: 'UPI'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment with missing amount', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          account_number: 'PAY001',
          payment_method: 'UPI'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment with invalid amount', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          account_number: 'PAY001',
          payment_amount: -100,
          payment_method: 'UPI'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment for non-existent customer', async () => {
      const response = await request(app)
        .post('/api/payments')
        .send({
          account_number: 'NONEXISTENT',
          payment_amount: 5000,
          payment_method: 'UPI'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should accept different payment methods', async () => {
      const methods = ['UPI', 'CARD', 'NET_BANKING', 'CHEQUE'];

      for (const method of methods) {
        const response = await request(app)
          .post('/api/payments')
          .send({
            account_number: 'PAY001',
            payment_amount: 1000,
            payment_method: method
          })
          .expect(201);

        expect(response.body.success).toBe(true);
      }
    });

    it('should generate unique payment reference ID', async () => {
      const response1 = await request(app)
        .post('/api/payments')
        .send({
          account_number: 'PAY001',
          payment_amount: 1000,
          payment_method: 'UPI'
        })
        .expect(201);

      const response2 = await request(app)
        .post('/api/payments')
        .send({
          account_number: 'PAY001',
          payment_amount: 1000,
          payment_method: 'UPI'
        })
        .expect(201);

      expect(response1.body.data.payment.payment_reference_id).not.toBe(
        response2.body.data.payment.payment_reference_id
      );
    });
  });

  describe('GET /api/payments', () => {
    beforeEach(async () => {
      // Create multiple payments for testing
      for (let i = 1; i <= 25; i++) {
        await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number,
          {
            payment_amount: 1000 * i,
            payment_method: i % 2 === 0 ? 'UPI' : 'CARD',
            status: i % 3 === 0 ? 'FAILED' : 'SUCCESS'
          }
        );
      }
    });

    it('should return paginated list of payments', async () => {
      const response = await request(app)
        .get('/api/payments?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false
      });
    });

    it('should return second page correctly', async () => {
      const response = await request(app)
        .get('/api/payments?page=2&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 10,
        hasNextPage: true,
        hasPreviousPage: true
      });
    });

    it('should return last page correctly', async () => {
      const response = await request(app)
        .get('/api/payments?page=3&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toMatchObject({
        page: 3,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: true
      });
    });

    it('should filter by payment status', async () => {
      const response = await request(app)
        .get('/api/payments?status=SUCCESS')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(payment => {
        expect(payment.status).toBe('SUCCESS');
      });
    });

    it('should filter by payment method', async () => {
      const response = await request(app)
        .get('/api/payments?payment_method=UPI')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(payment => {
        expect(payment.payment_method).toBe('UPI');
      });
    });

    it('should use default page size from environment', async () => {
      const response = await request(app)
        .get('/api/payments')
        .expect(200);

      expect(response.body.pagination.limit).toBe(20);
    });

    it('should enforce maximum page size', async () => {
      const response = await request(app)
        .get('/api/payments?limit=500')
        .expect(200);

      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/payments/:account_number', () => {
    beforeEach(async () => {
      // Create payments for specific account
      for (let i = 1; i <= 15; i++) {
        await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number,
          { payment_amount: 1000 * i }
        );
      }
    });

    it('should return payment history for account with pagination', async () => {
      const response = await request(app)
        .get('/api/payments/PAY001?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2
      });
    });

    it('should return empty array for account with no payments', async () => {
      const newCustomer = await TestDbHelper.createTestCustomer({
        account_number: 'NOPAY001'
      });

      const response = await request(app)
        .get('/api/payments/NOPAY001?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return payments in descending order by date', async () => {
      const response = await request(app)
        .get('/api/payments/PAY001?limit=5')
        .expect(200);

      const dates = response.body.data.map(p => new Date(p.payment_date).getTime());
      
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });

  describe('GET /api/payments/history/:account_number', () => {
    beforeEach(async () => {
      // Create payments with different statuses
      await TestDbHelper.createTestPayment(testCustomer.id, testCustomer.account_number, {
        payment_amount: 5000,
        status: 'SUCCESS'
      });
      await TestDbHelper.createTestPayment(testCustomer.id, testCustomer.account_number, {
        payment_amount: 3000,
        status: 'SUCCESS'
      });
      await TestDbHelper.createTestPayment(testCustomer.id, testCustomer.account_number, {
        payment_amount: 2000,
        status: 'FAILED'
      });
    });

    it('should return detailed payment history with statistics', async () => {
      const response = await request(app)
        .get('/api/payments/history/PAY001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('customer');
      expect(response.body.data).toHaveProperty('transactions');
      expect(response.body.data).toHaveProperty('statistics');
    });

    it('should return 404 for non-existent account', async () => {
      const response = await request(app)
        .get('/api/payments/history/NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/stats/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/payments/stats/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCustomers');
      expect(response.body.data).toHaveProperty('outstandingBalance');
      expect(response.body.data).toHaveProperty('totalCollected');
      expect(response.body.data).toHaveProperty('transactions');
    });

    it('should return numeric values for all stats', async () => {
      const response = await request(app)
        .get('/api/payments/stats/dashboard')
        .expect(200);

      const { data } = response.body;
      expect(typeof data.totalCustomers).toBe('number');
      expect(['number', 'string']).toContain(typeof data.outstandingBalance);
      expect(['number', 'string']).toContain(typeof data.totalCollected);
      expect(typeof data.transactions).toBe('number');
    });
  });
});
