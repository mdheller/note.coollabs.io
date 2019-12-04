module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/recommended', '@vue/standard'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/camelcase': 'warn',
    'vue/eqeqeq': 'warn',
    'vue/key-spacing': 'warn',
    'vue/arrow-spacing': 'warn'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
