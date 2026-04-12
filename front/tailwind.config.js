/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {

      /* --------------------------------------------------------
         FONT FAMILIES
         Consumen las CSS vars de tokens.css
      -------------------------------------------------------- */
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans:  ['var(--font-sans)'],
        mono:  ['var(--font-mono)'],
      },

      /* --------------------------------------------------------
         FONT WEIGHTS
         Agrega `font-regular` que Tailwind no incluye por defecto
      -------------------------------------------------------- */
      fontWeight: {
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      /* --------------------------------------------------------
         FONT SIZES — Tipografía semántica de Figma
         Formato: [fontSize, { lineHeight, letterSpacing }]

         Clases generadas:
           Display → text-display-{2xl|xl|lg|md|sm|xs}
           Body    → text-body-{xl|lg|md|sm|xs}
      -------------------------------------------------------- */
      fontSize: {
        /* Display */
        'display-2xl': [
          'var(--text-display-2xl)',
          { lineHeight: 'var(--leading-display-2xl)', letterSpacing: 'var(--tracking-tight)' },
        ],
        'display-xl': [
          'var(--text-display-xl)',
          { lineHeight: 'var(--leading-display-xl)', letterSpacing: 'var(--tracking-tight)' },
        ],
        'display-lg': [
          'var(--text-display-lg)',
          { lineHeight: 'var(--leading-display-lg)', letterSpacing: 'var(--tracking-tight)' },
        ],
        'display-md': [
          'var(--text-display-md)',
          { lineHeight: 'var(--leading-display-md)', letterSpacing: 'var(--tracking-tight)' },
        ],
        'display-sm': [
          'var(--text-display-sm)',
          { lineHeight: 'var(--leading-display-sm)', letterSpacing: 'var(--tracking-normal)' },
        ],
        'display-xs': [
          'var(--text-display-xs)',
          { lineHeight: 'var(--leading-display-xs)', letterSpacing: 'var(--tracking-normal)' },
        ],

        /* Body */
        'body-xl': [
          'var(--text-xl)',
          { lineHeight: 'var(--leading-xl)', letterSpacing: 'var(--tracking-normal)' },
        ],
        'body-lg': [
          'var(--text-lg)',
          { lineHeight: 'var(--leading-lg)', letterSpacing: 'var(--tracking-normal)' },
        ],
        'body-md': [
          'var(--text-md)',
          { lineHeight: 'var(--leading-md)', letterSpacing: 'var(--tracking-normal)' },
        ],
        'body-sm': [
          'var(--text-sm)',
          { lineHeight: 'var(--leading-sm)', letterSpacing: 'var(--tracking-normal)' },
        ],
        'body-xs': [
          'var(--text-xs)',
          { lineHeight: 'var(--leading-xs)', letterSpacing: 'var(--tracking-normal)' },
        ],
      },

      /* --------------------------------------------------------
         COLORS
         Cada paleta referencia sus CSS vars. Soporta todas las
         utilidades de Tailwind: bg-, text-, border-, ring-, etc.
      -------------------------------------------------------- */
      colors: {
        white: 'var(--color-white)',
        black: 'var(--color-black)',

        gray: {
          25:  'var(--color-gray-25)',
          50:  'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
        },

        brand: {
          25:  'var(--color-brand-25)',
          50:  'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },

        secondary: {
          25:  'var(--color-secondary-25)',
          50:  'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
        },

        error: {
          25:  'var(--color-error-25)',
          50:  'var(--color-error-50)',
          100: 'var(--color-error-100)',
          200: 'var(--color-error-200)',
          300: 'var(--color-error-300)',
          400: 'var(--color-error-400)',
          500: 'var(--color-error-500)',
          600: 'var(--color-error-600)',
          700: 'var(--color-error-700)',
          800: 'var(--color-error-800)',
          900: 'var(--color-error-900)',
        },

        warning: {
          25:  'var(--color-warning-25)',
          50:  'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          200: 'var(--color-warning-200)',
          300: 'var(--color-warning-300)',
          400: 'var(--color-warning-400)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
          700: 'var(--color-warning-700)',
          800: 'var(--color-warning-800)',
          900: 'var(--color-warning-900)',
        },

        success: {
          25:  'var(--color-success-25)',
          50:  'var(--color-success-50)',
          100: 'var(--color-success-100)',
          200: 'var(--color-success-200)',
          300: 'var(--color-success-300)',
          400: 'var(--color-success-400)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
          700: 'var(--color-success-700)',
          800: 'var(--color-success-800)',
          900: 'var(--color-success-900)',
        },
      },

      /* --------------------------------------------------------
         BOX SHADOWS + FOCUS RINGS
         Las sombras compuestas (sm, md, lg, xl) se listan con
         múltiples capas; las focus rings usan spread 0 0 0 Npx.
      -------------------------------------------------------- */
      boxShadow: {
        xs:    'var(--shadow-xs)',
        sm:    'var(--shadow-sm)',
        md:    'var(--shadow-md)',
        lg:    'var(--shadow-lg)',
        xl:    'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        '3xl': 'var(--shadow-3xl)',

        /* Focus rings — usar como: shadow-focus-primary */
        'focus-primary':       'var(--ring-primary-100)',
        'focus-gray':          'var(--ring-gray-100)',
        'focus-error':         'var(--ring-error-100)',
        'focus-primary-solid': 'var(--ring-primary-600)',
        'focus-gray-solid':    'var(--ring-gray-600)',
      },

      /* --------------------------------------------------------
         BORDER RADIUS
      -------------------------------------------------------- */
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        full: 'var(--radius-full)',
      },

      /* --------------------------------------------------------
         SPACING
         Extiende (no reemplaza) la escala por defecto de Tailwind
         con los tokens explícitos del UI Kit.
      -------------------------------------------------------- */
      spacing: {
        1:  'var(--spacing-1)',
        2:  'var(--spacing-2)',
        3:  'var(--spacing-3)',
        4:  'var(--spacing-4)',
        6:  'var(--spacing-6)',
        10: 'var(--spacing-10)',
      },

      /* --------------------------------------------------------
         BACKGROUND IMAGES — Gradientes de marca
         Usar como: bg-gradient-linear-90-600-500
      -------------------------------------------------------- */
      backgroundImage: {
        'gradient-angular':           'var(--gradient-angular)',
        'gradient-linear-90-600-500': 'var(--gradient-linear-90-600-500)',
        'gradient-linear-45-700-600': 'var(--gradient-linear-45-700-600)',
        'gradient-linear-45-800-600': 'var(--gradient-linear-45-800-600)',
        'gradient-linear-90-800-600': 'var(--gradient-linear-90-800-600)',
        'gradient-linear-26-800-700': 'var(--gradient-linear-26-800-700)',
        'gradient-linear-45-900-600': 'var(--gradient-linear-45-900-600)',
      },

    },
  },

  plugins: [],
}
