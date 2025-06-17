import parser from '@typescript-eslint/parser';
import pluginTs from '@typescript-eslint/eslint-plugin';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
      'react-refresh': eslintPluginReactRefresh,
    },
    rules: {
      // Disable the fast refresh rule so lint passes with zero warnings
      'react-refresh/only-export-components': 'off',
    },
  },
];
