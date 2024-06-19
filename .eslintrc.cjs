module.exports = {
  "env": {
    "browser": true
  },
  "extends": [
    "eslint:recommended",
    "love",
    "prettier"
  ],
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
  },
}