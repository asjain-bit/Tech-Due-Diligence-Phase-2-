export default {
  '*.{ts,tsx}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{js,mjs,cjs,json,css,md}': ['prettier --write'],
}
