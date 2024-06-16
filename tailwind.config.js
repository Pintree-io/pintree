module.exports = {
  mode: 'jit',
  purge: ['./**/*.html'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
  ],
}