const Customer = require('../../src/models/Customer');
const TestDbHelper = require('../helpers/db.helper');

describe('Customer Model', () => {
  beforeEach(async () => {
    await TestDbHelper.cleanDatabase();
  });

  describe('findAll', () => {
    it('should return all active customers', async () => {
      await TestDbHelper.createTestCustomer({ account_number: 'UNIT001' });
      await TestDbHelper.createTestCustomer({ account_number: 'UNIT002' });

      const customers = await Customer.findAll(10, 0);

      expect(customers).toHaveLength(2);
      expect(customers[0]).toHaveProperty('account_number');
      expect(customers[0]).toHaveProperty('customer_name');
    });

    it('should respect limit parameter', async () => {
      for (let i = 1; i <= 5; i++) {
        await TestDbHelper.createTestCustomer({ account_number: `UNIT00${i}` });
      }

      const customers = await Customer.findAll(3, 0);
      expect(customers).toHaveLength(3);
    });

    it('should handle offset correctly', async () => {
      await TestDbHelper.createTestCustomer({ account_number: 'UNIT001' });
      await TestDbHelper.createTestCustomer({ account_number: 'UNIT002' });
      await TestDbHelper.createTestCustomer({ account_number: 'UNIT003' });

      const customers = await Customer.findAll(2, 1);
      expect(customers).toHaveLength(2);
    });
  });

  describe('findByAccountNumber', () => {
    it('should find customer by account number', async () => {
      await TestDbHelper.createTestCustomer({
        account_number: 'FIND001',
        customer_name: 'Find Me'
      });

      const customer = await Customer.findByAccountNumber('FIND001');

      expect(customer).toBeDefined();
      expect(customer.account_number).toBe('FIND001');
      expect(customer.customer_name).toBe('Find Me');
    });

    it('should return null for non-existent account', async () => {
      const customer = await Customer.findByAccountNumber('NOTFOUND');
      expect(customer).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find customer by ID', async () => {
      const created = await TestDbHelper.createTestCustomer({
        account_number: 'ID001'
      });

      const customer = await Customer.findById(created.id);

      expect(customer).toBeDefined();
      expect(customer.id).toBe(created.id);
      expect(customer.account_number).toBe('ID001');
    });

    it('should return null for non-existent ID', async () => {
      const customer = await Customer.findById(99999);
      expect(customer).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const customerData = {
        account_number: 'CREATE001',
        customer_name: 'New Customer',
        email: 'new@test.com',
        phone: '9876543210',
        issue_date: '2023-01-01',
        interest_rate: 8.5,
        tenure: 36,
        emi_due: 5000,
        loan_amount: 180000,
        outstanding_balance: 180000
      };

      const result = await Customer.create(customerData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('account_number', 'CREATE001');
      expect(result).toHaveProperty('customer_name', 'New Customer');

      // Verify in database
      const dbCustomer = await Customer.findByAccountNumber('CREATE001');
      expect(dbCustomer).toBeDefined();
      expect(dbCustomer.email).toBe('new@test.com');
    });

    it('should throw error for duplicate account number', async () => {
      const customerData = {
        account_number: 'DUP001',
        customer_name: 'Duplicate',
        email: 'dup1@test.com',
        phone: '9876543210',
        issue_date: '2023-01-01',
        interest_rate: 8.5,
        tenure: 36,
        emi_due: 5000,
        loan_amount: 180000,
        outstanding_balance: 180000
      };

      await Customer.create(customerData);

      // Try to create duplicate
      await expect(Customer.create(customerData)).rejects.toThrow();
    });
  });

  describe('findWithPaymentInfo', () => {
    it('should return customer with payment information', async () => {
      const customer = await TestDbHelper.createTestCustomer({
        account_number: 'INFO001',
        customer_name: 'Info Customer'
      });

      // Create some payments
      await TestDbHelper.createTestPayment(customer.id, customer.account_number);
      await TestDbHelper.createTestPayment(customer.id, customer.account_number);

      const result = await Customer.findWithPaymentInfo('INFO001');

      expect(result).toBeDefined();
      expect(result.account_number).toBe('INFO001');
      expect(result).toHaveProperty('total_payments');
      expect(result).toHaveProperty('total_paid');
    });

    it('should return null for non-existent customer', async () => {
      const result = await Customer.findWithPaymentInfo('NOTFOUND');
      expect(result).toBeNull();
    });
  });
});
