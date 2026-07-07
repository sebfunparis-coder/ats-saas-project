/**
 * Jest config for ESM + Node 18+
 *
 * Run: node --experimental-vm-modules node_modules/.bin/jest
 */
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/src/__tests__/**/*.test.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/models/**/*.js',
    'src/middleware/**/*.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
