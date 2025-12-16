const pool = require('../config/database');

class Customer {
  /**
   * Get all customers with optional filters
   */
  static async findAll(limit = 50, offset = 0) {
    try {
      const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 50;
      const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;

      // Some MySQL server-side prepared statements have issues with placeholders in LIMIT/OFFSET.
      // We sanitize and inline numeric values to avoid parameter binding errors.
      const query = `
        SELECT * FROM customers 
        WHERE status = 'ACTIVE'
        ORDER BY created_at DESC 
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;
      const [customers] = await pool.query(query);
      return customers;
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  /**
   * Get customer by account number
   */
  static async findByAccountNumber(accountNumber) {
    try {
      const query = `SELECT * FROM customers WHERE account_number = ?`;
      const [rows] = await pool.execute(query, [accountNumber]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  /**
   * Get customer by ID
   */
  static async findById(id) {
    try {
      const query = `SELECT * FROM customers WHERE id = ?`;
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  /**
   * Create new customer
   */
  static async create(customerData) {
    try {
      const {
        account_number,
        customer_name,
        email,
        phone,
        issue_date,
        interest_rate,
        tenure,
        emi_due,
        loan_amount,
        outstanding_balance
      } = customerData;

      const query = `
        INSERT INTO customers (
          account_number, customer_name, email, phone, 
          issue_date, interest_rate, tenure, emi_due, 
          loan_amount, outstanding_balance, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
      `;

      const [result] = await pool.execute(query, [
        account_number,
        customer_name,
        email,
        phone,
        issue_date,
        interest_rate,
        tenure,
        emi_due,
        loan_amount,
        outstanding_balance
      ]);

      return {
        id: result.insertId,
        account_number,
        customer_name,
        email,
        phone
      };
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

  /**
   * Update customer
   */
  static async update(id, customerData) {
    try {
      const updates = Object.keys(customerData)
        .map(key => `${key} = ?`)
        .join(', ');

      const values = [...Object.values(customerData), id];
      const query = `UPDATE customers SET ${updates} WHERE id = ?`;

      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  /**
   * Get customer with latest payment info
   */
  static async findWithPaymentInfo(accountNumber) {
    try {
      const query = `
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM payments WHERE customer_id = c.id AND status = 'SUCCESS') as total_payments,
          (SELECT SUM(payment_amount) FROM payments WHERE customer_id = c.id AND status = 'SUCCESS') as total_paid,
          (SELECT payment_date FROM payments WHERE customer_id = c.id ORDER BY payment_date DESC LIMIT 1) as last_payment_date
        FROM customers c
        WHERE c.account_number = ?
      `;
      const [rows] = await pool.execute(query, [accountNumber]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching customer with payment info: ${error.message}`);
    }
  }
}

module.exports = Customer;
