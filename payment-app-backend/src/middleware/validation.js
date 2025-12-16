const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Validation rules for payments
const validatePayment = [
  body('account_number')
    .trim()
    .notEmpty().withMessage('Account number is required')
    .isLength({ min: 3 }).withMessage('Account number must be at least 3 characters'),
  body('payment_amount')
    .isFloat({ min: 0.01 }).withMessage('Payment amount must be a valid number greater than 0'),
  body('payment_method')
    .optional()
    .isIn(['UPI', 'CARD', 'NET_BANKING', 'CHEQUE']).withMessage('Invalid payment method'),
  body('transaction_id')
    .optional()
    .trim(),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks must not exceed 500 characters'),
  handleValidationErrors
];

// Validation rules for account number
const validateAccountNumber = [
  param('account_number')
    .trim()
    .notEmpty().withMessage('Account number is required')
    .isLength({ min: 3 }).withMessage('Account number must be at least 3 characters'),
  handleValidationErrors
];

module.exports = {
  validatePayment,
  validateAccountNumber,
  handleValidationErrors
};
