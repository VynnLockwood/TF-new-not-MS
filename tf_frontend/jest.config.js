module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest.setup.js'],
    testMatch: [
      '**/__tests__/**/*.(test|spec).[jt]s?(x)',
      '**/?(*.)+(test|spec).[jt]s?(x)',
    ],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',  // Use Babel for JS/TS transformation
      '^.+\\.mjs$': 'babel-jest',      // Transform ESM files
    },
    transformIgnorePatterns: [
      "node_modules/(?!(react-markdown)/)"  // Make sure react-markdown is transpiled
    ],
    reporters: [
      "default",
      [ "jest-html-reporter", {
        "pageTitle": "Test Report",
        "outputPath": "test-report.html",
        "includeFailureMsg": true
      }]
    ],
    globals: {
      'ts-jest': {
        isolatedModules: true, // This can help with performance in TypeScript projects
      },
    },
  };
  