CREATE DATABASE IF NOT EXISTS payment_collection_db;
CREATE USER IF NOT EXISTS 'payment_user'@'localhost' IDENTIFIED BY 'PaymentApp2025!';
GRANT ALL PRIVILEGES ON payment_collection_db.* TO 'payment_user'@'localhost';
FLUSH PRIVILEGES;
