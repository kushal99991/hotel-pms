import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  js.configs.recommended,

  ...tseslint.configs.recommended,

  react.configs.flat.recommended,

  reactHooks.configs['recommended-latest'],

  reactRefresh.configs.vite,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },

    plugins: {
      prettier,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // Prettier
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // General
      'import/extensions': 'off',
      'no-extra-semi': 'error',
      'no-console': 'off',
      camelcase: 'off',
      'no-unused-expressions': 'error',
      'no-unused-labels': 'error',
    },
  },

  // File-specific overrides
  {
    files: ['src/services/**/*', '__tests__/**/*'],
    rules: {
      camelcase: 'off',
    },
  },
])
