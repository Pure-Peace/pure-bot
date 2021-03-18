module.exports = {
    env: {
        es2021: true,
        node: true
    },
    extends: [
        'standard'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        'no-undef': 0,
        camelcase: 0,
        indent: ['error', 4],
        'prefer-promise-reject-errors': 0,
        semi: [
            'error',
            'always',
            { omitLastInOneLineBlock: true }
        ]
    }
};
