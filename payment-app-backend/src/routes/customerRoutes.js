const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { validateAccountNumber } = require('../middleware/validation');

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all active customers
 *     tags: [Customers]
 *     description: Retrieve a list of all active customers with pagination
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of customers to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of customers to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved customers
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
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     count:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const customers = await Customer.findAll(limit, offset);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        limit,
        offset,
        count: customers.length
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers/{account_number}:
 *   get:
 *     summary: Get customer by account number
 *     tags: [Customers]
 *     description: Retrieve detailed customer information including payment stats
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
 *         description: Successfully retrieved customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
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
router.get('/:account_number', validateAccountNumber, async (req, res) => {
  try {
    const { account_number } = req.params;

    const customer = await Customer.findWithPaymentInfo(account_number);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create new customer
 *     tags: [Customers]
 *     description: Create a new customer account (Admin endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_number
 *               - customer_name
 *               - issue_date
 *               - interest_rate
 *               - tenure
 *               - emi_due
 *             properties:
 *               account_number:
 *                 type: string
 *                 example: ACC004
 *               customer_name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: '9876543213'
 *               issue_date:
 *                 type: string
 *                 format: date
 *                 example: '2023-12-16'
 *               interest_rate:
 *                 type: number
 *                 example: 8.5
 *               tenure:
 *                 type: integer
 *                 example: 36
 *               emi_due:
 *                 type: number
 *                 example: 5000
 *               loan_amount:
 *                 type: number
 *                 example: 180000
 *               outstanding_balance:
 *                 type: number
 *                 example: 180000
 *     responses:
 *       201:
 *         description: Customer created successfully
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
 *                   example: Customer created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
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
router.post('/', async (req, res) => {
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
    } = req.body;

    // Validation
    if (!account_number || !customer_name || !issue_date || !emi_due) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: account_number, customer_name, issue_date, emi_due'
      });
    }

    const customer = await Customer.create({
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
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Handle duplicate account number
    if (error.message.includes('Duplicate entry')) {
      return res.status(409).json({
        success: false,
        message: 'Account number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
