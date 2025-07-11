import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['dist/**/*', 'node_modules/**/*', '.build/**/*'],
    },
    ...compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'plugin:prettier/recommended'
    ),
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            prettier,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2018,
            sourceType: 'module',

            parserOptions: {
                project: 'tsconfig.json',
            },
        },

        settings: {
            node: true,
        },

        rules: {
            'require-await': 'error',
            'no-return-await': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'off',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '[iI]gnored',
                    argsIgnorePattern: '^_',
                },
            ],

            'object-shorthand': ['error', 'always'],
        },
    },
];
