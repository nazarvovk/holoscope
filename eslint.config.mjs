import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginJest from 'eslint-plugin-jest'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['src/**/*.ts'],
  },
  {
    ignores: ['dist', 'temp'],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginPrettierRecommended,
    rules: {
      ...pluginPrettierRecommended.rules,
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf',
          printWidth: 100,
          semi: false,
          singleQuote: true,
          jsxSingleQuote: true,
          trailingComma: 'all',
        },
      ],
    },
  },
  pluginJest.configs['flat/recommended'],
  {
    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-debugger': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-explicit-any': 'off', // FIXME
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
]
