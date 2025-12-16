const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Payment {
  /**
   * Create new payment
   */
  static async create(paymentData) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const {
        customer_id,
        account_number,
        payment_amount,
        payment_method = 'UPI',
        transaction_id = null,
        remarks = null
      } = paymentData;

      const payment_reference_id = `PAY-${Date.now()}-${uuidv4().substring(0, 8)}`;
      const payment_date = new Date();

      // Insert payment
      const insertQuery = `
        INSERT INTO payments (
          payment_reference_id, customer_id, account_number, 
          payment_date, payment_amount, status, payment_method, 
          transaction_id, remarks
        ) VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?, ?, ?)
      `;

      const [result] = await conn.execute(insertQuery, [
        payment_reference_id,
        customer_id,
        account_number,
        payment_date,
        payment_amount,
        payment_method,
        transaction_id,
        remarks
      ]);

      // Update customer outstanding balance
      const updateQuery = `
        UPDATE customers 
        SET outstanding_balance = outstanding_balance - ? 
        WHERE id = ?
      `;
      await conn.execute(updateQuery, [payment_amount, customer_id]);

      // Update payment schedule if exists
      const scheduleQuery = `
        UPDATE payment_schedule 
        SET paid_amount = paid_amount + ?, status = 'PAID' 
        WHERE customer_id = ? AND status = 'PENDING'
        LIMIT 1
      `;
      await conn.execute(scheduleQuery, [payment_amount, customer_id]);

      await conn.commit();

      return {
        id: result.insertId,
        payment_reference_id,
        payment_amount,
        payment_method,
        account_number,
        status: 'SUCCESS',
        payment_date
      };
    } catch (error) {
      await conn.rollback();
      throw new Error(`Error creating payment: ${error.message}`);
    } finally {
      conn.release();
    }
  }

  /**
   * Get payments by customer account number
   */
  static async findByAccountNumber(accountNumber, limit = 50, offset = 0) {
    try {
      const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 50;
      const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
      
      const query = `
        SELECT p.* FROM payments p
        WHERE p.account_number = ? AND p.status IN ('SUCCESS', 'FAILED')
        ORDER BY p.payment_date DESC 
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;
      const [payments] = await pool.query(query, [accountNumber]);
      return payments;
    } catch (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }
  }

  /**
   * Get payments by customer ID
   */
  static async findByCustomerId(customerId, limit = 50, offset = 0) {
    try {
      const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 50;
      const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
      
      const query = `
        SELECT * FROM payments 
        WHERE customer_id = ? AND status IN ('SUCCESS', 'FAILED')
        ORDER BY payment_date DESC 
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;
      const [payments] = await pool.query(query, [customerId]);
      return payments;
    } catch (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }
  }

  /**
   * Get payment by reference ID
   */
  static async findByReferenceId(referenceId) {
    try {
      const query = `SELECT * FROM payments WHERE payment_reference_id = ?`;
      const [rows] = await pool.execute(query, [referenceId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching payment: ${error.message}`);
    }
  }

  /**
   * Get payment statistics by customer
   */
  static async getPaymentStats(customerId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN status = 'SUCCESS' THEN payment_amount ELSE 0 END) as total_paid,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_payments,
          MAX(payment_date) as last_payment_date,
          AVG(payment_amount) as avg_payment_amount
        FROM payments 
        WHERE customer_id = ?
      `;
      const [stats] = await pool.execute(query, [customerId]);
      return stats[0] || null;
    } catch (error) {
      throw new Error(`Error fetching payment statistics: ${error.message}`);
    }
  }

  /**
   * Get payment history with details
   */
  static async getPaymentHistory(accountNumber) {
    try {
      const query = `
        SELECT 
          p.payment_reference_id,
          p.payment_date,
          p.payment_amount,
          p.status,
          p.payment_method,
          p.transaction_id,
          c.customer_name,
          c.outstanding_balance
        FROM payments p
        JOIN customers c ON p.customer_id = c.id
        WHERE p.account_number = ?
        ORDER BY p.payment_date DESC
        LIMIT 100
      `;
      const [history] = await pool.execute(query, [accountNumber]);
      return history;
    } catch (error) {
      throw new Error(`Error fetching payment history: ${error.message}`);
    }
  }

  /**
   * Count total payments by account number
   */
  static async countByAccountNumber(accountNumber) {
    try {
      const query = `
        SELECT COUNT(*) as total 
        FROM payments 
        WHERE account_number = ? AND status IN ('SUCCESS', 'FAILED')
      `;
      const [result] = await pool.execute(query, [accountNumber]);
      return result[0].total;
    } catch (error) {
      throw new Error(`Error counting payments: ${error.message}`);
    }
  }

  /**
   * Get all payments with pagination
   */
  static async findAll(filters = {}, limit = 20, offset = 0) {
    try {
      const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.min(limit, 100)) : 20;
      const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND p.status = ?';
        params.push(filters.status);
      }

      if (filters.payment_method) {
        whereClause += ' AND p.payment_method = ?';
        params.push(filters.payment_method);
      }

      if (filters.start_date) {
        whereClause += ' AND p.payment_date >= ?';
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        whereClause += ' AND p.payment_date <= ?';
        params.push(filters.end_date);
      }

      const query = `
        SELECT p.*, c.customer_name, c.account_number
        FROM payments p
        LEFT JOIN customers c ON p.customer_id = c.id
        ${whereClause}
        ORDER BY p.payment_date DESC 
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;
      
      const [payments] = await pool.query(query, params);
      return payments;
    } catch (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }
  }

  /**
   * Count all payments with filters
   */
  static async countAll(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.payment_method) {
        whereClause += ' AND payment_method = ?';
        params.push(filters.payment_method);
      }

      if (filters.start_date) {
        whereClause += ' AND payment_date >= ?';
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        whereClause += ' AND payment_date <= ?';
        params.push(filters.end_date);
      }

      const query = `SELECT COUNT(*) as total FROM payments ${whereClause}`;
      const [result] = await pool.execute(query, params);
      return result[0].total;
    } catch (error) {
      throw new Error(`Error counting payments: ${error.message}`);
    }
  }
}

module.exports = Payment;
