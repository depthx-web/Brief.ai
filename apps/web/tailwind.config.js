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
        surface: '#F4F6F8', // general page background
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
