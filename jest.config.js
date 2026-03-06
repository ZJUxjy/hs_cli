module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/game/logic/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};
