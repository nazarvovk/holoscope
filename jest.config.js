const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  transform: {
    ...tsjPreset.transform,
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  roots: ['<rootDir>/src'],
  globals: {
    'ts-jest': {
      /**
       * Using a custom config for tests, which sets:
       *
       *   "include": []
       *
       * which makes tests run faster.
       *
       * Ref: https://github.com/kulshekhar/ts-jest/issues/259#issuecomment-617748411
       */
      tsconfig: 'tsconfig.test.json',
    },
  },
};
