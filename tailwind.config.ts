import type { Config } from 'tailwindcss'

// Palette: the inside of a jewellery box. Deep green velvet (after tsavorite, the green garnet
// first found in Tsavo), champagne metal for anything you can act on, and a green gem glint for focus.
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        velvet: { DEFAULT: '#0C2620', deep: '#071814', soft: '#12332B', raised: '#174036' },
        champagne: { DEFAULT: '#D8C3A0', bright: '#F0E2C6', dim: '#9E8C6E' },
        tsavorite: '#2BB673',
        mist: '#E9EEEA',
        copper: '#C07A45',
      },
      fontFamily: {
        display: ['Italiana', 'Didot', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display scale for Italiana, which is thin and needs size to carry.
        'display-sm': ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.05' }],
        'display-md': ['clamp(3rem, 7vw, 5.5rem)', { lineHeight: '1' }],
        'display-xl': ['clamp(6rem, 24vw, 22rem)', { lineHeight: '0.8', letterSpacing: '-0.02em' }],
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
} satisfies Config
