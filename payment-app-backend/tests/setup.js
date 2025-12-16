// Test setup file - runs before all tests
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '3306';
process.env.DB_USER = process.env.TEST_DB_USER || 'root';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'Amrutha@2025';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'payment_collection_test';
process.env.CORS_ORIGIN = 'http://localhost:19000';
process.env.DEFAULT_PAGE_SIZE = '20';
process.env.MAX_PAGE_SIZE = '100';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
