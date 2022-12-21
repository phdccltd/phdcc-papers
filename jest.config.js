const { defaults } = require('jest-config');
console.log("jest.config.js")
/** @type {import('jest').Config} */
const config = {
  //preset: '@nuxt/test-utils',
  globalSetup: './jest.once.js',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '<rootDir>/components/**/*.vue',
    '<rootDir>/pages/**/*.vue'
  ],
};

module.exports = config;

