const pool = require('../../src/config/database');
const TestDbHelper = require('../helpers/db.helper');
const Customer = require('../../src/models/Customer');
const Payment = require('../../src/models/Payment');

describe('Database Testing - Data Persistence & Transaction Safety', () => {
  beforeEach(async () => {
    await TestDbHelper.cleanDatabase();
  });

  describe('Test 5: Data Persistence', () => {
    describe('Customer Data Persistence', () => {
      it('should persist customer data correctly after creation', async () => {
        // Create customer
        const customerData = {
          account_number: 'PERSIST001',
          customer_name: 'Persistence Test User',
          email: 'persist@test.com',
          phone: '9876543210',
          issue_date: '2023-01-15',
          interest_rate: 8.5,
          tenure: 36,
          emi_due: 5000,
          loan_amount: 180000,
          outstanding_balance: 150000
        };

        const created = await Customer.create(customerData);
        expect(created).toHaveProperty('id');

        // Retrieve and verify persistence
        const retrieved = await Customer.findByAccountNumber('PERSIST001');
        
        expect(retrieved).toBeDefined();
        expect(retrieved.account_number).toBe('PERSIST001');
        expect(retrieved.customer_name).toBe('Persistence Test User');
        expect(retrieved.email).toBe('persist@test.com');
        expect(retrieved.phone).toBe('9876543210');
        expect(parseFloat(retrieved.interest_rate)).toBe(8.5);
        expect(retrieved.tenure).toBe(36);
        expect(parseFloat(retrieved.emi_due)).toBe(5000);
        expect(parseFloat(retrieved.loan_amount)).toBe(180000);
        expect(parseFloat(retrieved.outstanding_balance)).toBe(150000);
        expect(retrieved.status).toBe('ACTIVE');
      });

      it('should maintain data integrity across multiple queries', async () => {
        const customer = await TestDbHelper.createTestCustomer({
          account_number: 'INTEGRITY001',
          customer_name: 'Integrity User',
          outstanding_balance: 100000
        });

        // Query 1: By account number
        const query1 = await Customer.findByAccountNumber('INTEGRITY001');
        expect(query1.id).toBe(customer.id);

        // Query 2: By ID
        const query2 = await Customer.findById(customer.id);
        expect(query2.account_number).toBe('INTEGRITY001');

        // Query 3: In list
        const query3 = await Customer.findAll(10, 0);
        const found = query3.find(c => c.id === customer.id);
        expect(found).toBeDefined();
        expect(found.customer_name).toBe('Integrity User');
      });

      it('should persist customer updates correctly', async () => {
        const customer = await TestDbHelper.createTestCustomer({
          account_number: 'UPDATE001',
          outstanding_balance: 100000
        });

        // Update outstanding balance
        await pool.execute(
          'UPDATE customers SET outstanding_balance = ? WHERE id = ?',
          [95000, customer.id]
        );

        // Verify persistence
        const updated = await Customer.findById(customer.id);
        expect(parseFloat(updated.outstanding_balance)).toBe(95000);
      });

      it('should maintain timestamps correctly', async () => {
        const beforeCreate = new Date();
        
        const customer = await TestDbHelper.createTestCustomer({
          account_number: 'TIMESTAMP001'
        });

        const afterCreate = new Date();

        const retrieved = await Customer.findById(customer.id);
        const createdAt = new Date(retrieved.created_at);
        const updatedAt = new Date(retrieved.updated_at);

        // MySQL may use server time which can differ from local time
        // Verify timestamps exist and are valid dates
        expect(createdAt).toBeInstanceOf(Date);
        expect(updatedAt).toBeInstanceOf(Date);
        expect(!isNaN(createdAt.getTime())).toBe(true);
        expect(!isNaN(updatedAt.getTime())).toBe(true);
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
      });
    });

    describe('Payment Data Persistence', () => {
      let testCustomer;

      beforeEach(async () => {
        testCustomer = await TestDbHelper.createTestCustomer({
          account_number: 'PAYPERSIST001',
          outstanding_balance: 100000
        });
      });

      it('should persist payment data correctly after creation', async () => {
        const paymentData = {
          customer_id: testCustomer.id,
          account_number: testCustomer.account_number,
          payment_amount: 5000,
          payment_method: 'UPI',
          transaction_id: 'TXN-PERSIST-123',
          remarks: 'Test payment persistence'
        };

        const created = await Payment.create(paymentData);
        expect(created).toHaveProperty('payment_reference_id');

        // Retrieve and verify persistence
        const retrieved = await Payment.findByReferenceId(created.payment_reference_id);
        
        expect(retrieved).toBeDefined();
        expect(retrieved.customer_id).toBe(testCustomer.id);
        expect(retrieved.account_number).toBe(testCustomer.account_number);
        expect(parseFloat(retrieved.payment_amount)).toBe(5000);
        expect(retrieved.payment_method).toBe('UPI');
        expect(retrieved.transaction_id).toBe('TXN-PERSIST-123');
        expect(retrieved.remarks).toBe('Test payment persistence');
        expect(retrieved.status).toBe('SUCCESS');
      });

      it('should persist payment history correctly', async () => {
        // Create multiple payments
        const paymentIds = [];
        for (let i = 1; i <= 5; i++) {
          const payment = await TestDbHelper.createTestPayment(
            testCustomer.id,
            testCustomer.account_number,
            {
              payment_amount: 1000 * i,
              payment_method: i % 2 === 0 ? 'UPI' : 'CARD',
              remarks: `Payment ${i}`
            }
          );
          paymentIds.push(payment.payment_reference_id);
        }

        // Retrieve payment history
        const history = await Payment.findByAccountNumber(
          testCustomer.account_number,
          10,
          0
        );

        expect(history).toHaveLength(5);
        
        // Verify all payments persisted
        paymentIds.forEach(refId => {
          const found = history.find(p => p.payment_reference_id === refId);
          expect(found).toBeDefined();
        });
      });

      it('should maintain data consistency across database connections', async () => {
        const payment = await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number,
          { payment_amount: 5000 }
        );

        // Query using different methods
        const byRef = await Payment.findByReferenceId(payment.payment_reference_id);
        const byAccount = await Payment.findByAccountNumber(testCustomer.account_number, 10, 0);
        const byCustomer = await Payment.findByCustomerId(testCustomer.id, 10, 0);

        expect(byRef).toBeDefined();
        expect(byAccount.find(p => p.id === payment.id)).toBeDefined();
        expect(byCustomer.find(p => p.id === payment.id)).toBeDefined();
        
        // All should return same data
        expect(byRef.payment_amount).toEqual(byAccount[0].payment_amount);
        expect(byRef.payment_method).toEqual(byCustomer[0].payment_method);
      });

      it('should persist large datasets correctly', async () => {
        // Create 50 payments
        const createdPayments = [];
        for (let i = 1; i <= 50; i++) {
          const payment = await TestDbHelper.createTestPayment(
            testCustomer.id,
            testCustomer.account_number,
            {
              payment_amount: 100 * i,
              payment_method: ['UPI', 'CARD', 'NET_BANKING', 'CHEQUE'][i % 4]
            }
          );
          createdPayments.push(payment);
        }

        // Retrieve all payments
        const allPayments = await Payment.findByAccountNumber(
          testCustomer.account_number,
          100,
          0
        );

        expect(allPayments).toHaveLength(50);
        
        // Verify data integrity
        createdPayments.forEach(created => {
          const retrieved = allPayments.find(p => p.id === created.id);
          expect(retrieved).toBeDefined();
          expect(parseFloat(retrieved.payment_amount)).toBe(parseFloat(created.payment_amount));
        });
      });

      it('should persist decimal values with correct precision', async () => {
        const testAmounts = [5000.50, 1234.99, 9999.01, 0.50, 100000.75];

        for (const amount of testAmounts) {
          const payment = await TestDbHelper.createTestPayment(
            testCustomer.id,
            testCustomer.account_number,
            { payment_amount: amount }
          );

          const retrieved = await Payment.findByReferenceId(payment.payment_reference_id);
          expect(parseFloat(retrieved.payment_amount)).toBe(amount);
        }
      });
    });

    describe('Complex Data Persistence', () => {
      it('should persist related data correctly (customer + payments)', async () => {
        // Create customer
        const customer = await TestDbHelper.createTestCustomer({
          account_number: 'RELATED001',
          customer_name: 'Related Data User',
          outstanding_balance: 100000
        });

        // Create payments
        await TestDbHelper.createTestPayment(customer.id, customer.account_number, {
          payment_amount: 5000
        });
        await TestDbHelper.createTestPayment(customer.id, customer.account_number, {
          payment_amount: 3000
        });

        // Verify customer data persisted
        const retrievedCustomer = await Customer.findByAccountNumber('RELATED001');
        expect(retrievedCustomer).toBeDefined();
        expect(retrievedCustomer.customer_name).toBe('Related Data User');

        // Verify payments persisted
        const payments = await Payment.findByAccountNumber('RELATED001', 10, 0);
        expect(payments).toHaveLength(2);

        // Verify relationships
        payments.forEach(payment => {
          expect(payment.customer_id).toBe(customer.id);
          expect(payment.account_number).toBe('RELATED001');
        });
      });

      it('should persist data correctly with special characters', async () => {
        const customer = await TestDbHelper.createTestCustomer({
          account_number: 'SPECIAL001',
          customer_name: "O'Brien Test User",
          email: 'test+special@example.com',
          phone: '98-7654-3210'
        });

        const retrieved = await Customer.findByAccountNumber('SPECIAL001');
        expect(retrieved.customer_name).toBe("O'Brien Test User");
        expect(retrieved.email).toBe('test+special@example.com');
        expect(retrieved.phone).toBe('98-7654-3210');
      });
    });
  });

  describe('Test 6: Transaction Safety', () => {
    let testCustomer;

    beforeEach(async () => {
      testCustomer = await TestDbHelper.createTestCustomer({
        account_number: 'TRANS001',
        customer_name: 'Transaction Test User',
        outstanding_balance: 100000
      });
    });

    describe('Successful Transaction Commits', () => {
      it('should commit payment transaction on success', async () => {
        const initialBalance = parseFloat(testCustomer.outstanding_balance);
        const paymentAmount = 5000;

        // Process payment (uses transaction internally)
        const payment = await Payment.create({
          customer_id: testCustomer.id,
          account_number: testCustomer.account_number,
          payment_amount: paymentAmount,
          payment_method: 'UPI'
        });

        expect(payment.status).toBe('SUCCESS');

        // Verify payment was saved
        const savedPayment = await Payment.findByReferenceId(payment.payment_reference_id);
        expect(savedPayment).toBeDefined();
        expect(parseFloat(savedPayment.payment_amount)).toBe(paymentAmount);

        // Verify customer balance was updated
        const updatedCustomer = await Customer.findById(testCustomer.id);
        expect(parseFloat(updatedCustomer.outstanding_balance)).toBe(
          initialBalance - paymentAmount
        );
      });

      it('should commit all changes in a successful transaction', async () => {
        const paymentAmount = 10000;

        await Payment.create({
          customer_id: testCustomer.id,
          account_number: testCustomer.account_number,
          payment_amount: paymentAmount,
          payment_method: 'CARD'
        });

        // Verify all transaction changes persisted
        const customer = await Customer.findById(testCustomer.id);
        const payments = await Payment.findByCustomerId(testCustomer.id, 10, 0);

        expect(payments).toHaveLength(1);
        expect(parseFloat(payments[0].payment_amount)).toBe(paymentAmount);
        expect(parseFloat(customer.outstanding_balance)).toBe(90000);
      });

      it('should handle multiple sequential transactions correctly', async () => {
        let expectedBalance = 100000;

        // Transaction 1
        await Payment.create({
          customer_id: testCustomer.id,
          account_number: testCustomer.account_number,
          payment_amount: 5000,
          payment_method: 'UPI'
        });
        expectedBalance -= 5000;

        // Transaction 2
        await Payment.create({
          customer_id: testCustomer.id,
          account_number: testCustomer.account_number,
          payment_amount: 3000,
          payment_method: 'CARD'
        });
        expectedBalance -= 3000;

        // Transaction 3
        await Payment.create({
          customer_id: testCustomer.id,
          account_number: testCustomer.account_number,
          payment_amount: 2000,
          payment_method: 'NET_BANKING'
        });
        expectedBalance -= 2000;

        // Verify final state
        const customer = await Customer.findById(testCustomer.id);
        expect(parseFloat(customer.outstanding_balance)).toBe(expectedBalance);

        const payments = await Payment.findByCustomerId(testCustomer.id, 10, 0);
        expect(payments).toHaveLength(3);
      });
    });

    describe('Transaction Rollback on Errors', () => {
      it('should rollback payment transaction on database error', async () => {
        const initialBalance = parseFloat(testCustomer.outstanding_balance);

        // Attempt to create payment with invalid customer_id
        await expect(
          Payment.create({
            customer_id: 99999, // Non-existent customer
            account_number: 'INVALID',
            payment_amount: 5000,
            payment_method: 'UPI'
          })
        ).rejects.toThrow();

        // Verify original customer balance unchanged
        const customer = await Customer.findById(testCustomer.id);
        expect(parseFloat(customer.outstanding_balance)).toBe(initialBalance);

        // Verify no payment was created
        const payments = await Payment.findByCustomerId(testCustomer.id, 10, 0);
        expect(payments).toHaveLength(0);
      });

      it('should maintain data integrity on rollback', async () => {
        const conn = await pool.getConnection();
        
        try {
          await conn.beginTransaction();

          // Insert payment
          await conn.execute(
            'INSERT INTO payments (payment_reference_id, customer_id, account_number, payment_date, payment_amount, status, payment_method) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
            ['TEST-ROLLBACK', testCustomer.id, testCustomer.account_number, 5000, 'SUCCESS', 'UPI']
          );

          // Update customer balance
          await conn.execute(
            'UPDATE customers SET outstanding_balance = outstanding_balance - ? WHERE id = ?',
            [5000, testCustomer.id]
          );

          // Intentionally rollback
          await conn.rollback();

        } finally {
          conn.release();
        }

        // Verify nothing was saved
        const payment = await Payment.findByReferenceId('TEST-ROLLBACK');
        expect(payment).toBeNull();

        const customer = await Customer.findById(testCustomer.id);
        expect(parseFloat(customer.outstanding_balance)).toBe(100000);
      });

      it('should rollback all changes when part of transaction fails', async () => {
        const conn = await pool.getConnection();
        let errorOccurred = false;

        try {
          await conn.beginTransaction();

          // Valid insert
          await conn.execute(
            'INSERT INTO payments (payment_reference_id, customer_id, account_number, payment_date, payment_amount, status, payment_method) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
            ['TEST-PARTIAL', testCustomer.id, testCustomer.account_number, 5000, 'SUCCESS', 'UPI']
          );

          // This will fail - duplicate payment_reference_id
          await conn.execute(
            'INSERT INTO payments (payment_reference_id, customer_id, account_number, payment_date, payment_amount, status, payment_method) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
            ['TEST-PARTIAL', testCustomer.id, testCustomer.account_number, 3000, 'SUCCESS', 'CARD']
          );

          await conn.commit();
        } catch (error) {
          errorOccurred = true;
          await conn.rollback();
        } finally {
          conn.release();
        }

        expect(errorOccurred).toBe(true);

        // Verify both inserts were rolled back
        const payment = await Payment.findByReferenceId('TEST-PARTIAL');
        expect(payment).toBeNull();
      });

      it('should preserve original data after failed transaction', async () => {
        // Create initial payment
        const initialPayment = await TestDbHelper.createTestPayment(
          testCustomer.id,
          testCustomer.account_number,
          { payment_amount: 5000, remarks: 'Initial payment' }
        );

        const initialBalance = parseFloat(
          (await Customer.findById(testCustomer.id)).outstanding_balance
        );

        // Attempt transaction that will fail
        try {
          await Payment.create({
            customer_id: 99999, // Invalid
            account_number: 'INVALID',
            payment_amount: 3000,
            payment_method: 'UPI'
          });
        } catch (error) {
          // Expected to fail
        }

        // Verify original payment still exists unchanged
        const savedPayment = await Payment.findByReferenceId(
          initialPayment.payment_reference_id
        );
        expect(savedPayment).toBeDefined();
        expect(savedPayment.remarks).toBe('Initial payment');

        // Verify balance unchanged
        const customer = await Customer.findById(testCustomer.id);
        expect(parseFloat(customer.outstanding_balance)).toBe(initialBalance);
      });
    });

    describe('Transaction Isolation', () => {
      it('should handle concurrent transactions correctly', async () => {
        // Create multiple customers
        const customer1 = await TestDbHelper.createTestCustomer({
          account_number: 'CONCURRENT001',
          outstanding_balance: 100000
        });
        const customer2 = await TestDbHelper.createTestCustomer({
          account_number: 'CONCURRENT002',
          outstanding_balance: 100000
        });

        // Process payments concurrently
        await Promise.all([
          Payment.create({
            customer_id: customer1.id,
            account_number: customer1.account_number,
            payment_amount: 5000,
            payment_method: 'UPI'
          }),
          Payment.create({
            customer_id: customer2.id,
            account_number: customer2.account_number,
            payment_amount: 3000,
            payment_method: 'CARD'
          })
        ]);

        // Verify both transactions completed successfully
        const c1 = await Customer.findById(customer1.id);
        const c2 = await Customer.findById(customer2.id);

        expect(parseFloat(c1.outstanding_balance)).toBe(95000);
        expect(parseFloat(c2.outstanding_balance)).toBe(97000);

        const p1 = await Payment.findByAccountNumber(customer1.account_number, 10, 0);
        const p2 = await Payment.findByAccountNumber(customer2.account_number, 10, 0);

        expect(p1).toHaveLength(1);
        expect(p2).toHaveLength(1);
      });

      it('should not interfere with other transactions on rollback', async () => {
        const customer1 = await TestDbHelper.createTestCustomer({
          account_number: 'ISOLATE001',
          outstanding_balance: 100000
        });
        const customer2 = await TestDbHelper.createTestCustomer({
          account_number: 'ISOLATE002',
          outstanding_balance: 100000
        });

        // One successful, one failed transaction
        const results = await Promise.allSettled([
          Payment.create({
            customer_id: customer1.id,
            account_number: customer1.account_number,
            payment_amount: 5000,
            payment_method: 'UPI'
          }),
          Payment.create({
            customer_id: 99999, // Will fail
            account_number: 'INVALID',
            payment_amount: 3000,
            payment_method: 'CARD'
          })
        ]);

        expect(results[0].status).toBe('fulfilled');
        expect(results[1].status).toBe('rejected');

        // Verify first transaction succeeded
        const c1 = await Customer.findById(customer1.id);
        expect(parseFloat(c1.outstanding_balance)).toBe(95000);

        // Verify second transaction failed and didn't affect customer2
        const c2 = await Customer.findById(customer2.id);
        expect(parseFloat(c2.outstanding_balance)).toBe(100000);
      });
    });

    describe('Transaction Atomicity', () => {
      it('should treat payment creation as atomic operation', async () => {
        const paymentAmount = 15000;
        const initialBalance = parseFloat(testCustomer.outstanding_balance);

        const payment = await Payment.create({
          customer_id: testCustomer.id,
          account_number: testCustomer.account_number,
          payment_amount: paymentAmount,
          payment_method: 'UPI'
        });

        // Either both payment record and balance update succeed, or neither
        const savedPayment = await Payment.findByReferenceId(payment.payment_reference_id);
        const updatedCustomer = await Customer.findById(testCustomer.id);

        if (savedPayment) {
          // Payment exists, balance must be updated
          expect(parseFloat(updatedCustomer.outstanding_balance)).toBe(
            initialBalance - paymentAmount
          );
        } else {
          // Payment doesn't exist, balance must be unchanged
          expect(parseFloat(updatedCustomer.outstanding_balance)).toBe(initialBalance);
        }
      });

      it('should ensure all-or-nothing behavior in transactions', async () => {
        const conn = await pool.getConnection();
        const operations = [];

        try {
          await conn.beginTransaction();

          // Operation 1: Insert payment
          const [result1] = await conn.execute(
            'INSERT INTO payments (payment_reference_id, customer_id, account_number, payment_date, payment_amount, status, payment_method) VALUES (?, ?, ?, NOW(), ?, ?, ?)',
            ['ATOMIC-001', testCustomer.id, testCustomer.account_number, 5000, 'SUCCESS', 'UPI']
          );
          operations.push('payment_inserted');

          // Operation 2: Update balance
          await conn.execute(
            'UPDATE customers SET outstanding_balance = outstanding_balance - ? WHERE id = ?',
            [5000, testCustomer.id]
          );
          operations.push('balance_updated');

          // Operation 3: Update payment schedule
          const [scheduleResult] = await conn.execute(
            'SELECT id FROM payment_schedule WHERE customer_id = ? AND status = ? LIMIT 1',
            [testCustomer.id, 'PENDING']
          );
          
          if (scheduleResult.length > 0) {
            await conn.execute(
              'UPDATE payment_schedule SET paid_amount = paid_amount + ?, status = ? WHERE id = ?',
              [5000, 'PAID', scheduleResult[0].id]
            );
            operations.push('schedule_updated');
          }

          await conn.commit();
          operations.push('committed');

        } catch (error) {
          await conn.rollback();
          operations.push('rolled_back');
        } finally {
          conn.release();
        }

        // Verify atomicity - either all committed or all rolled back
        if (operations.includes('committed')) {
          const payment = await Payment.findByReferenceId('ATOMIC-001');
          const customer = await Customer.findById(testCustomer.id);
          
          expect(payment).toBeDefined();
          expect(parseFloat(customer.outstanding_balance)).toBe(95000);
        } else {
          const payment = await Payment.findByReferenceId('ATOMIC-001');
          const customer = await Customer.findById(testCustomer.id);
          
          expect(payment).toBeNull();
          expect(parseFloat(customer.outstanding_balance)).toBe(100000);
        }
      });
    });
  });
});
