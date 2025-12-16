# Payment Collection API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently no authentication required. Add JWT in future:

```
Authorization: Bearer <token>
```

## Response Format

All responses are in JSON format with the following structure:

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Error description",
    "path": "/api/endpoint",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Successful GET |
| 201 | Created - Successful POST |
| 400 | Bad Request - Validation error |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error |

## Endpoints

### 1. Health Check

#### Request

```
GET /health
```

#### Response

```json
{
  "status": "OK",
  "message": "Payment Collection API is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### cURL Example

```bash
curl http://localhost:5000/api/health
```

---

## Customers Endpoints

### 2. Get All Customers

Retrieve a list of all active customers with pagination.

#### Request

```
GET /customers?limit=50&offset=0
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of records (default: 50, max: 100) |
| offset | integer | No | Offset for pagination (default: 0) |

#### Response (200)

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
      "loan_amount": 180000.00,
      "outstanding_balance": 150000.00,
      "status": "ACTIVE",
      "created_at": "2023-01-15T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

#### cURL Example

```bash
curl "http://localhost:5000/api/customers?limit=10&offset=0"
```

---

### 3. Get Customer by Account Number

Retrieve detailed information about a specific customer.

#### Request

```
GET /customers/:account_number
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| account_number | string | Yes | Customer's account number |

#### Response (200)

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
    "outstanding_balance": 150000.00,
    "status": "ACTIVE",
    "total_payments": 5,
    "total_paid": 25000.00,
    "last_payment_date": "2024-01-10T10:30:00Z"
  }
}
```

#### Error Response (404)

```json
{
  "success": false,
  "error": {
    "status": 404,
    "message": "Customer not found"
  }
}
```

#### cURL Example

```bash
curl http://localhost:5000/api/customers/ACC001
```

---

### 4. Create Customer

Create a new customer record (Admin endpoint).

#### Request

```
POST /customers
Content-Type: application/json
```

#### Request Body

```json
{
  "account_number": "ACC004",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543213",
  "issue_date": "2024-01-01",
  "interest_rate": 8.75,
  "tenure": 36,
  "emi_due": 5500.00,
  "loan_amount": 198000.00,
  "outstanding_balance": 195000.00
}
```

#### Response (201)

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

#### Error Response (400)

```json
{
  "success": false,
  "message": "Required fields missing: account_number, customer_name, issue_date, emi_due"
}
```

#### Error Response (409)

```json
{
  "success": false,
  "message": "Account number already exists"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "ACC004",
    "customer_name": "John Doe",
    "email": "john@example.com",
    "issue_date": "2024-01-01",
    "interest_rate": 8.75,
    "tenure": 36,
    "emi_due": 5500,
    "loan_amount": 198000,
    "outstanding_balance": 195000
  }'
```

---

## Payments Endpoints

### 5. Process Payment

Process a payment for a customer.

#### Request

```
POST /payments
Content-Type: application/json
```

#### Request Body

```json
{
  "account_number": "ACC001",
  "payment_amount": 5000,
  "payment_method": "UPI",
  "transaction_id": "TXN123456789",
  "remarks": "Monthly EMI payment"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| account_number | string | Yes | Customer's account number |
| payment_amount | number | Yes | Amount to pay (> 0) |
| payment_method | string | No | UPI, CARD, NET_BANKING, CHEQUE |
| transaction_id | string | No | External transaction reference |
| remarks | string | No | Payment notes (max 500 chars) |

#### Response (201)

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "success": true,
    "payment": {
      "id": 1,
      "payment_reference_id": "PAY-1705315200000-abc12345",
      "status": "SUCCESS",
      "payment_date": "2024-01-15T10:30:00Z"
    },
    "customer": {
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "outstanding_balance": 145000.00,
      "emi_due": 5000.00
    }
  }
}
```

#### Error Response (404)

```json
{
  "success": false,
  "message": "Customer not found"
}
```

#### Error Response (400)

```json
{
  "success": false,
  "message": "Payment amount exceeds outstanding balance"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "ACC001",
    "payment_amount": 5000,
    "payment_method": "UPI",
    "transaction_id": "TXN123456789",
    "remarks": "Monthly EMI"
  }'
```

---

### 6. Get Payment History

Retrieve payment history for a customer.

#### Request

```
GET /payments/:account_number?limit=50&offset=0
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| account_number | string | Yes | Customer's account number |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of records (default: 50, max: 100) |
| offset | integer | No | Offset for pagination (default: 0) |

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "payment_reference_id": "PAY-1705315200000-abc12345",
      "customer_id": 1,
      "account_number": "ACC001",
      "payment_date": "2024-01-15T10:30:00Z",
      "payment_amount": 5000.00,
      "status": "SUCCESS",
      "payment_method": "UPI",
      "transaction_id": "TXN123456789",
      "remarks": "Monthly EMI payment"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

#### cURL Example

```bash
curl "http://localhost:5000/api/payments/ACC001?limit=10"
```

---

### 7. Get Payment History with Statistics

Retrieve detailed payment history with statistics.

#### Request

```
GET /payments/history/:account_number
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| account_number | string | Yes | Customer's account number |

#### Response (200)

```json
{
  "success": true,
  "data": {
    "customer": {
      "account_number": "ACC001",
      "customer_name": "Rahul Kumar",
      "outstanding_balance": 145000.00
    },
    "statistics": {
      "total_payments": 5,
      "total_paid": 25000.00,
      "failed_payments": 0,
      "last_payment_date": "2024-01-15",
      "avg_payment_amount": 5000.00
    },
    "transactions": [
      {
        "payment_reference_id": "PAY-1705315200000-abc12345",
        "payment_date": "2024-01-15T10:30:00Z",
        "payment_amount": 5000.00,
        "status": "SUCCESS",
        "payment_method": "UPI"
      }
    ]
  }
}
```

#### cURL Example

```bash
curl http://localhost:5000/api/payments/history/ACC001
```

---

### 8. Get Dashboard Summary

Retrieve overall dashboard statistics.

#### Request

```
GET /payments/stats/dashboard
```

#### Response (200)

```json
{
  "success": true,
  "data": {
    "totalCustomers": 3,
    "totalCollections": 75000.00,
    "outstandingBalance": 510000.00,
    "recentPayments": [
      {
        "id": 1,
        "account_number": "ACC001",
        "payment_amount": 5000.00,
        "payment_date": "2024-01-15T10:30:00Z",
        "status": "SUCCESS"
      }
    ]
  }
}
```

#### cURL Example

```bash
curl http://localhost:5000/api/payments/stats/dashboard
```

---

## Validation Rules

### Account Number

- Required for all customer and payment endpoints
- Minimum 3 characters
- Cannot be empty

### Payment Amount

- Must be a valid decimal number
- Must be greater than 0
- Cannot exceed outstanding balance

### Payment Method

- Allowed values: UPI, CARD, NET_BANKING, CHEQUE
- Default: UPI

### Remarks

- Maximum 500 characters
- Optional field

---

## Rate Limiting

Currently no rate limiting implemented. Add in future releases.

---

## CORS Configuration

```
Allowed Origins: http://localhost:19000, http://localhost:8081
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
```

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Validation Error | Check request parameters |
| 404 | Customer not found | Verify account number |
| 404 | Resource not found | Check endpoint path |
| 409 | Account number already exists | Use different account number |
| 500 | Internal Server Error | Check server logs |

---

## Example Workflows

### Complete Payment Flow

1. **Search Customer**
   ```bash
   GET /customers/ACC001
   ```

2. **Process Payment**
   ```bash
   POST /payments
   Body: {
     "account_number": "ACC001",
     "payment_amount": 5000,
     "payment_method": "UPI"
   }
   ```

3. **Get Updated History**
   ```bash
   GET /payments/history/ACC001
   ```

---

## Testing with Postman

1. Import the API endpoints
2. Set base URL: `http://localhost:5000/api`
3. Use provided cURL examples
4. Test with sample data (ACC001, ACC002, ACC003)

---

## Rate Limits (Future)

- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Versioning

Current API Version: 1.0.0

---

**Last Updated:** January 2024
**Documentation Version:** 1.0
