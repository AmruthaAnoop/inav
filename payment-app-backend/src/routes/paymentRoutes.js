const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const PaymentService = require('../services/PaymentService');
const { validatePayment, validateAccountNumber } = require('../middleware/validation');

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a new payment
 *     tags: [Payments]
 *     description: Process a payment for a customer loan account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_number
 *               - payment_amount
 *             properties:
 *               account_number:
 *                 type: string
 *                 description: Customer account number
 *                 example: ACC001
 *               payment_amount:
 *                 type: number
 *                 format: float
 *                 description: Payment amount
 *                 example: 5000.00
 *               payment_method:
 *                 type: string
 *                 enum: [UPI, CARD, NET_BANKING, CHEQUE]
 *                 default: UPI
 *                 description: Payment method
 *                 example: UPI
 *               transaction_id:
 *                 type: string
 *                 description: External transaction ID
 *                 example: TXN123456789
 *               remarks:
 *                 type: string
 *                 description: Payment remarks
 *                 example: Monthly EMI payment
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment processed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     payment_reference_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     payment_date:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validatePayment, async (req, res) => {
  try {
    const { account_number, payment_amount, payment_method, transaction_id, remarks } = req.body;

    const result = await PaymentService.processPayment({
      account_number,
      payment_amount: parseFloat(payment_amount),
      payment_method,
      transaction_id,
      remarks
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment: result.payment,
        customer: result.customer
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments with pagination
 *     tags: [Payments]
 *     description: Retrieve paginated list of all payments with optional filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED, REVERSED]
 *         description: Filter by payment status
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [UPI, CARD, NET_BANKING, CHEQUE]
 *         description: Filter by payment method
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments until this date
 *     responses:
 *       200:
 *         description: Successfully retrieved payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20, parseInt(process.env.MAX_PAGE_SIZE) || 100);
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.payment_method) filters.payment_method = req.query.payment_method;
    if (req.query.start_date) filters.start_date = req.query.start_date;
    if (req.query.end_date) filters.end_date = req.query.end_date;

    const [payments, total] = await Promise.all([
      Payment.findAll(filters, limit, offset),
      Payment.countAll(filters)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/payments/{account_number}:
 *   get:
 *     summary: Get payment history by account number
 *     tags: [Payments]
 *     description: Retrieve paginated payment history for a specific customer
 *     parameters:
 *       - in: path
 *         name: account_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer account number
 *         example: ACC001
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved payment history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:account_number', validateAccountNumber, async (req, res) => {
  try {
    const { account_number } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20, parseInt(process.env.MAX_PAGE_SIZE) || 100);
    const offset = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.findByAccountNumber(account_number, limit, offset),
      Payment.countByAccountNumber(account_number)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/payments/history/{account_number}:
 *   get:
 *     summary: Get detailed payment history with statistics
 *     tags: [Payments]
 *     description: Retrieve comprehensive payment history with customer info and stats
 *     parameters:
 *       - in: path
 *         name: account_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer account number
 *         example: ACC001
 *     responses:
 *       200:
 *         description: Successfully retrieved detailed payment history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total_payments:
 *                           type: integer
 *                         total_paid:
 *                           type: number
 *                         failed_payments:
 *                           type: integer
 *                         last_payment_date:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history/:account_number', validateAccountNumber, async (req, res) => {
  try {
    const { account_number } = req.params;

    const history = await PaymentService.getPaymentHistory(account_number);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/payments/stats/dashboard:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Payments]
 *     description: Retrieve aggregated statistics for dashboard display
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: integer
 *                       description: Total number of customers
 *                       example: 150
 *                     outstandingBalance:
 *                       type: number
 *                       description: Total outstanding balance
 *                       example: 5000000
 *                     totalCollected:
 *                       type: number
 *                       description: Total amount collected this month
 *                       example: 250000
 *                     transactions:
 *                       type: integer
 *                       description: Total number of transactions
 *                       example: 500
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats/dashboard', async (req, res) => {
  try {
    const summary = await PaymentService.getDashboardSummary();

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
