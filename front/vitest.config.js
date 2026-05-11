import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * F6 Ciclo 2: configuración Vitest para tests de componentes con
 * Testing Library + jsdom. Coexiste con `vite.config.js` (que sigue
 * siendo el config de build/dev del frontend).
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true, // procesa CSS para que tokens.css y data-mode tengan efecto
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
  },
})
