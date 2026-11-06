import type { Config } from 'tailwindcss'

// Modelled on how fine-jewellery shops present their pieces: soft paper and stone backgrounds
// that let gold photograph warmly, near-black type, and a muted gold used only for small accents.
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F5',
        stone: { DEFAULT: '#EFEAE3', deep: '#E4DCD0' },
        ink: { DEFAULT: '#1B1A18', soft: '#6E6862' },
        gold: { DEFAULT: '#9C7A3C', light: '#C9A96E' },
      },
      fontFamily: {
        display: ['"Gilda Display"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['clamp(2rem, 3.6vw, 2.75rem)', { lineHeight: '1.1' }],
        'display-md': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.05' }],
        'display-lg': ['clamp(3rem, 7.5vw, 6.5rem)', { lineHeight: '0.98' }],
      },
      letterSpacing: { label: '0.14em' },
      transitionTimingFunction: { cinematic: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
} satisfies Config
