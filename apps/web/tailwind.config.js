/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2340', // navy-deep — dark backgrounds, nav, footer
          light: '#1F3864', // navy-mid — secondary navy elements
        },
        emerald: {
          DEFAULT: '#1E9D75', // reserved for AI-generated content + CTAs only
          dark: '#167A5C',
          soft: '#E4F3EC',
        },
        paper: {
          DEFAULT: '#FBF9F4', // document-representing cards
          line: '#E8E2D4',
        },
        ink: {
          DEFAULT: '#101826', // primary text
          soft: '#4B5768', // secondary/descriptive text
        },
        redline: '#C24444', // warnings, strikethrough, errors only
        surface: '#F1F3F6', // general page background
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      boxShadow: {
        // Unified elevation system — every floating element introduced in
        // Batch 3 (dropdowns, drawers, modals, toasts) references one of
        // these instead of a one-off shadow value.
        'level-1': '0 1px 3px rgba(15,35,64,0.06)', // fixed on-page cards
        'level-2': '0 4px 12px rgba(15,35,64,0.12)', // dropdown menus, toasts
        'level-3': '0 8px 24px rgba(15,35,64,0.18)', // side drawers
        'level-4': '0 20px 50px rgba(15,35,64,0.28)', // modals
      },
    },
  },
  plugins: [],
};
