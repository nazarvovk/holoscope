const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json',
        isolatedModules: true, // Disable type checking for tests
      },
    ],
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  roots: ['<rootDir>/src'],
};
