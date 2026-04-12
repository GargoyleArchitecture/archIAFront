export default {
  plugins: {
    '@tailwindcss/postcss': {},
    // autoprefixer no es necesario en Tailwind v4:
    // usa Lightning CSS internamente para vendor prefixes.
  },
}
