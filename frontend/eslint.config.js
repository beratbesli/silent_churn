import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{js,jsx}', '*.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      // Keep the stable runtime invariants enabled. The plugin's current
      // compiler preset also includes experimental data-flow rules that flag
      // valid async loading effects, so it is intentionally not applied.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-unused-vars': ['error', {
        args: 'after-used',
        caughtErrors: 'none',
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }],
      'no-console': 'warn',
    },
  },
  {
    files: ['*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // These legacy one-off migration scripts intentionally report progress
      // to the terminal; browser source remains covered by no-console above.
      'no-console': 'off',
    },
  },
]
