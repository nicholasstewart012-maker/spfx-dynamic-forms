require('@rushstack/eslint-config/patch/modern-module-resolution');
module.exports = {
  extends: [
    "@microsoft/eslint-config-spfx/lib/profiles/default"
  ],
  parserOptions: { tsconfigRootDir: __dirname },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
        'no-void': 'off',
        'no-extra-boolean-cast': 'off',
        '@typescript-eslint/no-extra-boolean-cast': 'off'
      }
    }
  ]
};