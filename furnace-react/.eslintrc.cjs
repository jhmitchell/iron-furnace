module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    // The project doesn't use PropTypes (or TypeScript) for component props
    'react/prop-types': 'off',
    // Apostrophes and quotes in JSX text (e.g. "Furnace's") render correctly
    'react/no-unescaped-entities': 'off',
  },
}
