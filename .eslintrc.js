/** @format */

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  globals: {
    window: true,
    document: true,
    process: true,
    __DEV__: true,
    __SERVER__: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    // project: ['./tsconfig.json', 'apps/*/tsconfig.json', 'libs/*/tsconfig.json'],
  },
  env: {
    node: true,
  },
  rules: {
    'no-underscore-dangle': 0,
    'jest/valid-title': 0,
    'no-confusing-arrow': 0,
    '@typescript-eslint/indent': 0,
    'operator-linebreak': 0,
    'function-paren-newline': 0,
    'no-param-reassign': 0,
    'comma-dangle': 0,
    'object-curly-newline': 0,
    'implicit-arrow-linebreak': 0,
    'import/prefer-default-export': 0,
    'class-methods-use-this': 0,
    'lines-between-class-members': 0,
    'quote-props': 0,
    'indent': 0,
    'no-nested-ternary': 0,
    'spaced-comment': ['error', 'always', { markers: ['#region', '#endregion', '/'] }],
    'max-len': ['error', { code: 140, ignoreUrls: true }],
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        parser: 'typescript',
        printWidth: 140,
        singleQuote: true,
        useTabs: false,
        tabWidth: 2,
        semi: true,
        bracketSpacing: true,
        trailingComma: 'all',
        arrowParens: 'always',
        insertPragma: true,
        quoteProps: 'consistent',
        jsxSingleQuote: false,
        jsxBracketSameLine: false,
        htmlWhitespaceSensivity: 'css',
        proseWrap: 'never',
      },
    ],
    'no-empty-function': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    'no-use-before-define': 0,
    'no-useless-constructor': 0,
    // '@typescript-eslint/no-var-requires': 0,
  },
};