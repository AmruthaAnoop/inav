-- Create Database
CREATE DATABASE IF NOT EXISTS payment_collection_db;
USE payment_collection_db;

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  issue_date DATE NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  tenure INT NOT NULL,
  emi_due DECIMAL(12, 2) NOT NULL,
  loan_amount DECIMAL(15, 2),
  outstanding_balance DECIMAL(15, 2),
  status ENUM('ACTIVE', 'CLOSED', 'DEFAULT') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_account_number (account_number),
  INDEX idx_status (status),
  INDEX idx_customer_outstanding (outstanding_balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_reference_id VARCHAR(100) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  payment_date DATETIME NOT NULL,
  payment_amount DECIMAL(12, 2) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REVERSED') DEFAULT 'PENDING',
  payment_method ENUM('UPI', 'CARD', 'NET_BANKING', 'CHEQUE') DEFAULT 'UPI',
  transaction_id VARCHAR(100),
  remarks VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id),
  INDEX idx_account_number (account_number),
  INDEX idx_payment_date (payment_date),
  INDEX idx_status (status),
  INDEX idx_reference_id (payment_reference_id),
  INDEX idx_payment_customer_date (customer_id, payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Schedule Table
CREATE TABLE IF NOT EXISTS payment_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  due_date DATE NOT NULL,
  due_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status ENUM('PENDING', 'PAID', 'OVERDUE') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id),
  INDEX idx_due_date (due_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data (Optional)
INSERT INTO customers (account_number, customer_name, email, phone, issue_date, interest_rate, tenure, emi_due, loan_amount, outstanding_balance, status)
VALUES 
  ('ACC001', 'Rahul Kumar', 'rahul@example.com', '9876543210', '2023-01-15', 8.50, 36, 5000.00, 180000, 150000, 'ACTIVE'),
  ('ACC002', 'Priya Singh', 'priya@example.com', '9876543211', '2023-02-20', 9.00, 48, 4500.00, 216000, 195000, 'ACTIVE'),
  ('ACC003', 'Amit Patel', 'amit@example.com', '9876543212', '2023-03-10', 8.75, 36, 5500.00, 198000, 165000, 'ACTIVE');
