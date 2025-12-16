module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation|react-native-toast-notifications)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};
