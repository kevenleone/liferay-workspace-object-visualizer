import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import sortKeys from 'eslint-plugin-sort-keys';

export default tseslint.config(
    {
        ignores: [
            'dist',
            'src-tauri/target',
            'src-tauri/target/**',
            'src-tauri/**/out/**',
            '@vite/**',
        ],
    },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        settings: {
            'import/resolver': {
                typescript: true,
                node: true,
            },
        },
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'import': importPlugin,
            'sort-keys': sortKeys,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'import/order': ['error', { 'newlines-between': 'always' }],
            'sort-keys/sort-keys-fix': ['error', 'asc', { caseSensitive: false }],
        },
    },
);
