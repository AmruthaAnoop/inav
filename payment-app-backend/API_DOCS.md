# API Documentation

Complete API documentation for the Payment Collection System.

## 📚 Documentation Access

### Swagger UI (Interactive)
Once the server is running, access the interactive API documentation at:
- **URL:** `http://localhost:5000/api-docs`
- **Features:** Try out API endpoints directly from the browser

### Postman Collection
Import the Postman collection for testing:
- **File:** `postman_collection.json`
- **Import:** Open Postman → Import → Select file

## 🚀 Base URL

```
Development: http://localhost:5000/api
Production: https://api.paymentcollection.com/api
```

## 🔑 Pagination

All list endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-indexed) |
| `limit` | integer | 20 | 100 | Items per page |

### Pagination Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 📋 API Endpoints

### Health Check

#### Get Health Status
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Payment Collection API is running",
  "timestamp": "2023-12-16T10:30:00.000Z"
}
```

---

### Customers

#### Get All Customers
```http
GET /api/customers?limit=50&offset=0
```

**Query Parameters:**
- `limit` (optional): Number of customers to return (default: 50, max: 100)
- `offset` (optional): Number of customers to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "email": "rahul@example.com",
      "phone": "9876543210",
      "issue_date": "2023-01-15",
      "interest_rate": 8.5,
      "tenure": 36,
      "emi_due": 5000.00,
      "loan_amount": 180000,
      "outstanding_balance": 150000,
      "status": "ACTIVE",
      "created_at": "2023-01-15T00:00:00.000Z",
      "updated_at": "2023-12-16T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

#### Get Customer by Account Number
```http
GET /api/customers/:account_number
```

**Path Parameters:**
- `account_number` (required): Customer account number (e.g., ACC001)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "account_number": "ACC001",
    "customer_name": "Rahul Kumar",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "issue_date": "2023-01-15",
    "interest_rate": 8.5,
    "tenure": 36,
    "emi_due": 5000.00,
    "loan_amount": 180000,
    "outstanding_balance": 150000,
    "status": "ACTIVE"
  }
}
```

#### Create New Customer
```http
POST /api/customers
```

**Request Body:**
```json
{
  "account_number": "ACC004",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543213",
  "issue_date": "2023-12-16",
  "interest_rate": 8.5,
  "tenure": 36,
  "emi_due": 5000,
  "loan_amount": 180000,
  "outstanding_balance": 180000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 4,
    "account_number": "ACC004",
    "customer_name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543213"
  }
}
```

---

### Payments

#### Process Payment
```http
POST /api/payments
```

**Request Body:**
```json
{
  "account_number": "ACC001",
  "payment_amount": 5000.00,
  "payment_method": "UPI",
  "transaction_id": "TXN123456789",
  "remarks": "Monthly EMI payment"
}
```

**Fields:**
- `account_number` (required): Customer account number
- `payment_amount` (required): Payment amount
- `payment_method` (optional): UPI | CARD | NET_BANKING | CHEQUE (default: UPI)
- `transaction_id` (optional): External transaction ID
- `remarks` (optional): Payment notes

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": 1,
    "payment_reference_id": "PAY-1702727400000-a1b2c3d4",
    "status": "SUCCESS",
    "payment_date": "2023-12-16T10:30:00.000Z"
  }
}
```

#### Get All Payments (Paginated)
```http
GET /api/payments?page=1&limit=20&status=SUCCESS&payment_method=UPI
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): PENDING | SUCCESS | FAILED | REVERSED
- `payment_method` (optional): UPI | CARD | NET_BANKING | CHEQUE
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "payment_reference_id": "PAY-1702727400000-a1b2c3d4",
      "customer_id": 1,
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "payment_date": "2023-12-16T10:30:00.000Z",
      "payment_amount": 5000.00,
      "status": "SUCCESS",
      "payment_method": "UPI",
      "transaction_id": "TXN123456789",
      "remarks": "Monthly EMI payment"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Get Payment History by Account
```http
GET /api/payments/:account_number?page=1&limit=20
```

**Path Parameters:**
- `account_number` (required): Customer account number

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** Same as Get All Payments with pagination

#### Get Detailed Payment History
```http
GET /api/payments/history/:account_number
```

**Path Parameters:**
- `account_number` (required): Customer account number

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "outstanding_balance": 145000
    },
    "payments": [
      {
        "payment_reference_id": "PAY-1702727400000-a1b2c3d4",
        "payment_date": "2023-12-16T10:30:00.000Z",
        "payment_amount": 5000.00,
        "status": "SUCCESS",
        "payment_method": "UPI"
      }
    ],
    "statistics": {
      "total_payments": 10,
      "total_paid": 50000,
      "failed_payments": 0,
      "last_payment_date": "2023-12-16T10:30:00.000Z",
      "avg_payment_amount": 5000
    }
  }
}
```

#### Get Dashboard Statistics
```http
GET /api/payments/stats/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 150,
    "outstandingBalance": 5000000,
    "totalCollected": 250000,
    "transactions": 500
  }
}
```

---

## 🔒 Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 💡 Examples

### Example: Process Payment with cURL

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "ACC001",
    "payment_amount": 5000.00,
    "payment_method": "UPI",
    "remarks": "Monthly EMI"
  }'
```

### Example: Get Paginated Payments

```bash
curl "http://localhost:5000/api/payments?page=1&limit=10&status=SUCCESS"
```

### Example: Get Customer Details

```bash
curl http://localhost:5000/api/customers/ACC001
```

---

## 🧪 Testing with Postman

1. Import the Postman collection: `postman_collection.json`
2. Set the environment variable `baseUrl` to `http://localhost:5000/api`
3. Test all endpoints with pre-configured requests

---

## 📊 Environment Variables

Configure these in your `.env` file:

```env
# Pagination defaults
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payment_collection_db
```

---

## 🔗 Additional Resources

- [Swagger UI Documentation](http://localhost:5000/api-docs) - Interactive API docs
- [Postman Collection](./postman_collection.json) - Import for testing
- [Backend README](./README.md) - Setup and deployment guide
