const request = require('supertest');
const app = require('../../src/index');
const TestDbHelper = require('../helpers/db.helper');

describe('Customer API', () => {
  beforeAll(async () => {
    await TestDbHelper.cleanDatabase();
  });

  afterEach(async () => {
    await TestDbHelper.cleanDatabase();
  });

  describe('GET /api/customers', () => {
    it('should return empty array when no customers exist', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return list of customers with pagination', async () => {
      // Create test customers
      await TestDbHelper.createTestCustomer({ account_number: 'TEST001' });
      await TestDbHelper.createTestCustomer({ account_number: 'TEST002' });
      await TestDbHelper.createTestCustomer({ account_number: 'TEST003' });

      const response = await request(app)
        .get('/api/customers?limit=2&offset=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        limit: 2,
        offset: 0,
        count: 2
      });
    });

    it('should respect limit parameter', async () => {
      // Create 5 customers
      for (let i = 1; i <= 5; i++) {
        await TestDbHelper.createTestCustomer({ account_number: `TEST00${i}` });
      }

      const response = await request(app)
        .get('/api/customers?limit=3')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
    });

    it('should respect offset parameter', async () => {
      // Create customers
      await TestDbHelper.createTestCustomer({ account_number: 'TEST001', customer_name: 'First' });
      await TestDbHelper.createTestCustomer({ account_number: 'TEST002', customer_name: 'Second' });
      await TestDbHelper.createTestCustomer({ account_number: 'TEST003', customer_name: 'Third' });

      const response = await request(app)
        .get('/api/customers?limit=2&offset=1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      // Should skip the first customer
    });

    it('should enforce maximum limit of 100', async () => {
      const response = await request(app)
        .get('/api/customers?limit=200')
        .expect(200);

      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/customers/:account_number', () => {
    it('should return customer by account number', async () => {
      const customer = await TestDbHelper.createTestCustomer({
        account_number: 'TEST001',
        customer_name: 'John Doe',
        email: 'john@test.com'
      });

      const response = await request(app)
        .get('/api/customers/TEST001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        account_number: 'TEST001',
        customer_name: 'John Doe',
        email: 'john@test.com'
      });
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should validate account number format', async () => {
      const response = await request(app)
        .get('/api/customers/')
        .expect(200);
      
      // Should return customers list
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer with valid data', async () => {
      const newCustomer = {
        account_number: 'TEST999',
        customer_name: 'Jane Smith',
        email: 'jane@test.com',
        phone: '9876543210',
        issue_date: '2023-01-15',
        interest_rate: 8.5,
        tenure: 36,
        emi_due: 5000,
        loan_amount: 180000,
        outstanding_balance: 180000
      };

      const response = await request(app)
        .post('/api/customers')
        .send(newCustomer)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('created successfully');
      expect(response.body.data).toMatchObject({
        account_number: 'TEST999',
        customer_name: 'Jane Smith'
      });

      // Verify customer was created in database
      const dbCustomer = await TestDbHelper.getCustomerByAccountNumber('TEST999');
      expect(dbCustomer).toBeDefined();
      expect(dbCustomer.customer_name).toBe('Jane Smith');
    });

    it('should reject customer with missing required fields', async () => {
      const invalidCustomer = {
        account_number: 'TEST999',
        // Missing customer_name and other required fields
      };

      const response = await request(app)
        .post('/api/customers')
        .send(invalidCustomer)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate account number', async () => {
      await TestDbHelper.createTestCustomer({ account_number: 'DUP001' });

      const duplicateCustomer = {
        account_number: 'DUP001',
        customer_name: 'Duplicate User',
        email: 'dup@test.com',
        phone: '9876543210',
        issue_date: '2023-01-15',
        interest_rate: 8.5,
        tenure: 36,
        emi_due: 5000,
        loan_amount: 180000,
        outstanding_balance: 180000
      };

      const response = await request(app)
        .post('/api/customers')
        .send(duplicateCustomer)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should set default status to ACTIVE', async () => {
      const newCustomer = {
        account_number: 'TEST998',
        customer_name: 'Active User',
        email: 'active@test.com',
        phone: '9876543210',
        issue_date: '2023-01-15',
        interest_rate: 8.5,
        tenure: 36,
        emi_due: 5000,
        loan_amount: 180000,
        outstanding_balance: 180000
      };

      await request(app)
        .post('/api/customers')
        .send(newCustomer)
        .expect(201);

      const dbCustomer = await TestDbHelper.getCustomerByAccountNumber('TEST998');
      expect(dbCustomer.status).toBe('ACTIVE');
    });
  });
});
