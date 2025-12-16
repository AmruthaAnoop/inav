const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Collection API',
      version: '1.0.0',
      description: 'REST API for Payment Collection Mobile App - Manage personal loan payments',
      contact: {
        name: 'API Support',
        email: 'support@paymentcollection.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.paymentcollection.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          required: ['account_number', 'customer_name', 'issue_date', 'interest_rate', 'tenure', 'emi_due'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated customer ID'
            },
            account_number: {
              type: 'string',
              description: 'Unique account number',
              example: 'ACC001'
            },
            customer_name: {
              type: 'string',
              description: 'Customer full name',
              example: 'Rahul Kumar'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
              example: 'rahul@example.com'
            },
            phone: {
              type: 'string',
              description: 'Customer phone number',
              example: '9876543210'
            },
            issue_date: {
              type: 'string',
              format: 'date',
              description: 'Loan issue date',
              example: '2023-01-15'
            },
            interest_rate: {
              type: 'number',
              format: 'float',
              description: 'Interest rate percentage',
              example: 8.5
            },
            tenure: {
              type: 'integer',
              description: 'Loan tenure in months',
              example: 36
            },
            emi_due: {
              type: 'number',
              format: 'float',
              description: 'EMI due amount',
              example: 5000.00
            },
            loan_amount: {
              type: 'number',
              format: 'float',
              description: 'Total loan amount',
              example: 180000
            },
            outstanding_balance: {
              type: 'number',
              format: 'float',
              description: 'Outstanding balance',
              example: 150000
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'CLOSED', 'DEFAULT'],
              description: 'Customer status',
              example: 'ACTIVE'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update timestamp'
            }
          }
        },
        Payment: {
          type: 'object',
          required: ['account_number', 'payment_amount'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated payment ID'
            },
            payment_reference_id: {
              type: 'string',
              description: 'Unique payment reference ID',
              example: 'PAY-1702727400000-a1b2c3d4'
            },
            customer_id: {
              type: 'integer',
              description: 'Customer ID'
            },
            account_number: {
              type: 'string',
              description: 'Customer account number',
              example: 'ACC001'
            },
            payment_date: {
              type: 'string',
              format: 'date-time',
              description: 'Payment date and time'
            },
            payment_amount: {
              type: 'number',
              format: 'float',
              description: 'Payment amount',
              example: 5000.00
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'],
              description: 'Payment status',
              example: 'SUCCESS'
            },
            payment_method: {
              type: 'string',
              enum: ['UPI', 'CARD', 'NET_BANKING', 'CHEQUE'],
              description: 'Payment method',
              example: 'UPI'
            },
            transaction_id: {
              type: 'string',
              description: 'External transaction ID',
              example: 'TXN123456789'
            },
            remarks: {
              type: 'string',
              description: 'Payment remarks',
              example: 'Monthly EMI payment'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update timestamp'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
              example: 20
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 5
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Customers',
        description: 'Customer management endpoints'
      },
      {
        name: 'Payments',
        description: 'Payment processing and history endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/index.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
