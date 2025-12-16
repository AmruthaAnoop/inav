import api from './api';

// Customer Services
export const customerService = {
  /**
   * Get all active customers
   */
  getAllCustomers: (limit = 50, offset = 0) => {
    return api.get('/customers', {
      params: { limit, offset }
    });
  },

  /**
   * Get customer details by account number
   */
  getCustomerByAccountNumber: (accountNumber) => {
    return api.get(`/customers/${accountNumber}`);
  },

  /**
   * Create new customer (admin only)
   */
  createCustomer: (customerData) => {
    return api.post('/customers', customerData);
  },
};

// Payment Services
export const paymentService = {
  /**
   * Process a new payment
   */
  processPayment: (paymentData) => {
    return api.post('/payments', paymentData);
  },

  /**
   * Get payment history by account number
   */
  getPaymentHistory: (accountNumber, limit = 50, offset = 0) => {
    return api.get(`/payments/${accountNumber}`, {
      params: { limit, offset }
    });
  },

  /**
   * Get detailed payment history with statistics
   */
  getPaymentHistoryWithStats: (accountNumber) => {
    return api.get(`/payments/history/${accountNumber}`);
  },

  /**
   * Get dashboard summary
   */
  getDashboardSummary: () => {
    return api.get('/payments/stats/dashboard');
  },
};

export default {
  customerService,
  paymentService,
};
