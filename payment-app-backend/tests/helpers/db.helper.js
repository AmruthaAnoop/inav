const pool = require('../../src/config/database');

/**
 * Database helper utilities for testing
 */
class TestDbHelper {
  /**
   * Clean all tables
   */
  static async cleanDatabase() {
    try {
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      await pool.query('TRUNCATE TABLE payments');
      await pool.query('TRUNCATE TABLE payment_schedule');
      await pool.query('TRUNCATE TABLE customers');
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  }

  /**
   * Create test customer
   */
  static async createTestCustomer(data = {}) {
    const defaultCustomer = {
      account_number: data.account_number || `TEST${Date.now()}`,
      customer_name: data.customer_name || 'Test Customer',
      email: data.email || `test${Date.now()}@example.com`,
      phone: data.phone || '9999999999',
      issue_date: data.issue_date || '2023-01-01',
      interest_rate: data.interest_rate || 8.5,
      tenure: data.tenure || 36,
      emi_due: data.emi_due || 5000,
      loan_amount: data.loan_amount || 180000,
      outstanding_balance: data.outstanding_balance || 150000,
      status: data.status || 'ACTIVE'
    };

    const query = `
      INSERT INTO customers (
        account_number, customer_name, email, phone, 
        issue_date, interest_rate, tenure, emi_due, 
        loan_amount, outstanding_balance, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      defaultCustomer.account_number,
      defaultCustomer.customer_name,
      defaultCustomer.email,
      defaultCustomer.phone,
      defaultCustomer.issue_date,
      defaultCustomer.interest_rate,
      defaultCustomer.tenure,
      defaultCustomer.emi_due,
      defaultCustomer.loan_amount,
      defaultCustomer.outstanding_balance,
      defaultCustomer.status
    ]);

    return {
      id: result.insertId,
      ...defaultCustomer
    };
  }

  /**
   * Create test payment
   */
  static async createTestPayment(customerId, accountNumber, data = {}) {
    const defaultPayment = {
      payment_reference_id: data.payment_reference_id || `TEST-PAY-${Date.now()}`,
      payment_date: data.payment_date || new Date(),
      payment_amount: data.payment_amount || 5000,
      status: data.status || 'SUCCESS',
      payment_method: data.payment_method || 'UPI',
      transaction_id: data.transaction_id || null,
      remarks: data.remarks || null
    };

    const query = `
      INSERT INTO payments (
        payment_reference_id, customer_id, account_number,
        payment_date, payment_amount, status, payment_method,
        transaction_id, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      defaultPayment.payment_reference_id,
      customerId,
      accountNumber,
      defaultPayment.payment_date,
      defaultPayment.payment_amount,
      defaultPayment.status,
      defaultPayment.payment_method,
      defaultPayment.transaction_id,
      defaultPayment.remarks
    ]);

    return {
      id: result.insertId,
      ...defaultPayment,
      customer_id: customerId,
      account_number: accountNumber
    };
  }

  /**
   * Get customer by account number
   */
  static async getCustomerByAccountNumber(accountNumber) {
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE account_number = ?',
      [accountNumber]
    );
    return rows[0] || null;
  }

  /**
   * Get payment by reference ID
   */
  static async getPaymentByReferenceId(referenceId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE payment_reference_id = ?',
      [referenceId]
    );
    return rows[0] || null;
  }

  /**
   * Close database connection pool
   */
  static async closePool() {
    try {
      await pool.end();
    } catch (error) {
      console.error('Error closing pool:', error);
    }
  }
}

module.exports = TestDbHelper;
