module.exports = {
  "env": {
    "browser": false,
    "es6": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "jest", 'prettier'],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "prettier",
  ],
  "rules": {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'lf',
        printWidth: 100,
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
  }
}
