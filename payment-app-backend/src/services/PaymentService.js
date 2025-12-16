const Payment = require('../models/Payment');
const Customer = require('../models/Customer');

class PaymentService {
  /**
   * Process payment for a customer
   */
  static async processPayment(paymentData) {
    try {
      // Validate customer exists
      const customer = await Customer.findByAccountNumber(paymentData.account_number);
      if (!customer) {
        const error = new Error('Customer not found');
        error.status = 404;
        throw error;
      }

      // Validate payment amount
      if (paymentData.payment_amount <= 0) {
        const error = new Error('Payment amount must be greater than 0');
        error.status = 400;
        throw error;
      }

      if (paymentData.payment_amount > customer.outstanding_balance) {
        const error = new Error('Payment amount exceeds outstanding balance');
        error.status = 400;
        throw error;
      }

      // Create payment record
      const paymentRecord = await Payment.create({
        customer_id: customer.id,
        account_number: paymentData.account_number,
        payment_amount: paymentData.payment_amount,
        payment_method: paymentData.payment_method || 'UPI',
        transaction_id: paymentData.transaction_id,
        remarks: paymentData.remarks
      });

      // Get updated customer info
      const updatedCustomer = await Customer.findById(customer.id);

      return {
        success: true,
        payment: paymentRecord,
        customer: {
          account_number: updatedCustomer.account_number,
          customer_name: updatedCustomer.customer_name,
          outstanding_balance: updatedCustomer.outstanding_balance,
          emi_due: updatedCustomer.emi_due
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment history for customer
   */
  static async getPaymentHistory(accountNumber) {
    try {
      const customer = await Customer.findByAccountNumber(accountNumber);
      if (!customer) {
        const error = new Error('Customer not found');
        error.status = 404;
        throw error;
      }

      const history = await Payment.getPaymentHistory(accountNumber);
      const stats = await Payment.getPaymentStats(customer.id);

      return {
        customer: {
          account_number: customer.account_number,
          customer_name: customer.customer_name,
          outstanding_balance: customer.outstanding_balance
        },
        statistics: stats,
        transactions: history
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get dashboard summary
   */
  static async getDashboardSummary() {
    try {
      const pool = require('../config/database');
      
      // Total customers
      const [customers] = await pool.query(
        'SELECT COUNT(*) as count FROM customers WHERE status = "ACTIVE"'
      );
      
      // Total collections this month
      const [collections] = await pool.query(
        `SELECT SUM(payment_amount) as total 
         FROM payments 
         WHERE status = "SUCCESS" 
         AND MONTH(payment_date) = MONTH(CURRENT_DATE())
         AND YEAR(payment_date) = YEAR(CURRENT_DATE())`
      );
      
      // Outstanding balance
      const [outstanding] = await pool.query(
        'SELECT SUM(outstanding_balance) as total FROM customers WHERE status = "ACTIVE"'
      );
      
      // Total transactions
      const [transactions] = await pool.query(
        'SELECT COUNT(*) as count FROM payments WHERE status = "SUCCESS"'
      );
      
      // Recent payments
      const [recentPayments] = await pool.query(
        'SELECT * FROM payments ORDER BY payment_date DESC LIMIT 20'
      );

      return {
        totalCustomers: customers[0].count || 0,
        totalCollected: collections[0].total || 0,
        outstandingBalance: outstanding[0].total || 0,
        transactions: transactions[0].count || 0,
        recentPayments
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard summary: ${error.message}`);
    }
  }
}

module.exports = PaymentService;
