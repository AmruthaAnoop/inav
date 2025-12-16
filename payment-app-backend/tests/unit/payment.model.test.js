const Payment = require('../../src/models/Payment');
const TestDbHelper = require('../helpers/db.helper');

describe('Payment Model', () => {
  let testCustomer;

  beforeAll(async () => {
    await TestDbHelper.cleanDatabase();
  });

  beforeEach(async () => {
    await TestDbHelper.cleanDatabase();
    testCustomer = await TestDbHelper.createTestCustomer({
      account_number: 'PAYMODEL001',
      outstanding_balance: 100000
    });
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        customer_id: testCustomer.id,
        account_number: testCustomer.account_number,
        payment_amount: 5000,
        payment_method: 'UPI',
        transaction_id: 'TXN123',
        remarks: 'Test payment'
      };

      const result = await Payment.create(paymentData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('payment_reference_id');
      expect(result).toHaveProperty('status', 'SUCCESS');
      expect(result).toHaveProperty('payment_date');
    });

    it('should reduce customer outstanding balance', async () => {
      const initialBalance = testCustomer.outstanding_balance;
      const paymentAmount = 5000;

      await Payment.create({
        customer_id: testCustomer.id,
        account_number: testCustomer.account_number,
        payment_amount: paymentAmount,
        payment_method: 'UPI'
      });

      const updatedCustomer = await TestDbHelper.getCustomerByAccountNumber(
        testCustomer.account_number
      );

      expect(parseFloat(updatedCustomer.outstanding_balance)).toBe(
        parseFloat(initialBalance) - paymentAmount
      );
    });

    it('should generate unique payment reference ID', async () => {
      const payment1 = await Payment.create({
        customer_id: testCustomer.id,
        account_number: testCustomer.account_number,
        payment_amount: 1000,
        payment_method: 'UPI'
      });

      const payment2 = await Payment.create({
        customer_id: testCustomer.id,
        account_number: testCustomer.account_number,
        payment_amount: 1000,
        payment_method: 'UPI'
      });

      expect(payment1.payment_reference_id).not.toBe(payment2.payment_reference_id);
    });

    it('should rollback on error', async () => {
      const initialBalance = testCustomer.outstanding_balance;

      // Try to create payment with invalid customer_id
      await expect(
        Payment.create({
          customer_id: 99999,
          account_number: 'INVALID',
          payment_amount: 5000,
          payment_method: 'UPI'
        })
      ).rejects.toThrow();

      // Check that customer balance hasn't changed
      const customer = await TestDbHelper.getCustomerByAccountNumber(
        testCustomer.account_number
      );
      expect(parseFloat(customer.outstanding_balance)).toBe(
        parseFloat(initialBalance)
      );
    });
  });

  describe('findByAccountNumber', () => {
    beforeEach(async () => {
      // Create test payments
      for (let i = 1; i <= 5; i++) {
        await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number,
          { payment_amount: 1000 * i }
        );
      }
    });

    it('should find payments by account number', async () => {
      const payments = await Payment.findByAccountNumber(
        testCustomer.account_number,
        10,
        0
      );

      expect(payments).toHaveLength(5);
      expect(payments[0]).toHaveProperty('payment_reference_id');
      expect(payments[0]).toHaveProperty('payment_amount');
    });

    it('should respect limit parameter', async () => {
      const payments = await Payment.findByAccountNumber(
        testCustomer.account_number,
        3,
        0
      );

      expect(payments).toHaveLength(3);
    });

    it('should handle offset correctly', async () => {
      const payments = await Payment.findByAccountNumber(
        testCustomer.account_number,
        2,
        2
      );

      expect(payments).toHaveLength(2);
    });

    it('should return empty array for non-existent account', async () => {
      const payments = await Payment.findByAccountNumber('NOTFOUND', 10, 0);
      expect(payments).toEqual([]);
    });
  });

  describe('countByAccountNumber', () => {
    it('should count payments for account', async () => {
      // Create 7 payments
      for (let i = 1; i <= 7; i++) {
        await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number
        );
      }

      const count = await Payment.countByAccountNumber(testCustomer.account_number);
      expect(count).toBe(7);
    });

    it('should return 0 for account with no payments', async () => {
      const count = await Payment.countByAccountNumber('NOPAYMENTS');
      expect(count).toBe(0);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create payments with different attributes
      for (let i = 1; i <= 10; i++) {
        await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number,
          {
            payment_method: i % 2 === 0 ? 'UPI' : 'CARD',
            status: i % 3 === 0 ? 'FAILED' : 'SUCCESS',
            payment_amount: 1000 * i
          }
        );
      }
    });

    it('should find all payments with pagination', async () => {
      const payments = await Payment.findAll({}, 5, 0);
      expect(payments).toHaveLength(5);
    });

    it('should filter by status', async () => {
      const payments = await Payment.findAll({ status: 'SUCCESS' }, 20, 0);
      
      expect(payments.length).toBeGreaterThan(0);
      payments.forEach(payment => {
        expect(payment.status).toBe('SUCCESS');
      });
    });

    it('should filter by payment method', async () => {
      const payments = await Payment.findAll({ payment_method: 'UPI' }, 20, 0);
      
      expect(payments.length).toBeGreaterThan(0);
      payments.forEach(payment => {
        expect(payment.payment_method).toBe('UPI');
      });
    });
  });

  describe('countAll', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 8; i++) {
        await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number,
          {
            status: i % 2 === 0 ? 'SUCCESS' : 'FAILED',
            payment_method: 'UPI'
          }
        );
      }
    });

    it('should count all payments', async () => {
      const count = await Payment.countAll({});
      expect(count).toBe(8);
    });

    it('should count with status filter', async () => {
      const count = await Payment.countAll({ status: 'SUCCESS' });
      expect(count).toBe(4);
    });

    it('should count with payment method filter', async () => {
      const count = await Payment.countAll({ payment_method: 'UPI' });
      expect(count).toBe(8);
    });
  });

  describe('findByReferenceId', () => {
    it('should find payment by reference ID', async () => {
      const created = await TestDbHelper.createTestPayment(
        testCustomer.id,
        testCustomer.account_number,
        { payment_reference_id: 'UNIQUE-REF-123' }
      );

      const payment = await Payment.findByReferenceId('UNIQUE-REF-123');

      expect(payment).toBeDefined();
      expect(payment.payment_reference_id).toBe('UNIQUE-REF-123');
    });

    it('should return null for non-existent reference ID', async () => {
      const payment = await Payment.findByReferenceId('NOTFOUND');
      expect(payment).toBeNull();
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics for customer', async () => {
      // Create payments
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

      const stats = await Payment.getPaymentStats(testCustomer.id);

      expect(stats).toBeDefined();
      expect(stats.total_payments).toBe(3);
      expect(parseFloat(stats.total_paid)).toBe(8000);
      expect(parseInt(stats.failed_payments)).toBe(1);
      expect(stats).toHaveProperty('last_payment_date');
    });
  });
});
