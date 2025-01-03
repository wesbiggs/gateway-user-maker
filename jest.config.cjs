module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    "^(\\.\\.?\\/.+)\\.js$": "$1"
  }
};
