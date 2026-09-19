import type { Config } from 'tailwindcss';

/**
 * EBRUSHKOBAG palette.
 *
 * The five core colours come straight from the logo. The seasonal extensions
 * (autumn browns, winter navies) exist so Autumn and Winter can go deeper
 * without leaving the brand — they are still read as the same world.
 *
 * Rule of thumb for the whole site: ~70% breathing room, ~30% colour.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── Core brand (from the logo) ───────────────────────────────────
        blush: {
          DEFAULT: '#FEE9EA',
          deep: '#FBD9DC',
          soft: '#FFF5F5',
        },
        periwinkle: {
          DEFAULT: '#88ADFE',
          deep: '#5F8BF5',
          soft: '#C3D4FE',
        },
        hotpink: {
          DEFAULT: '#FF68C4',
          deep: '#E9429F',
        },
        lime: {
          DEFAULT: '#A0DB6B',
          deep: '#7FBC4B',
        },
        sunny: {
          DEFAULT: '#FFDE5A',
          deep: '#F5C92E',
        },

        // ── Seasonal extensions ─────────────────────────────────────────
        lilac: '#CBB8F5',
        turquoise: '#5FD3D0',
        burgundy: '#7A2338',
        chocolate: '#4A2E22',
        dusty: '#D69AA0',
        olive: '#6E7345',
        navy: '#161823',
        charcoal: '#2A2D3A',
        silver: '#C7CCD6',

        // ── Neutrals ────────────────────────────────────────────────────
        cream: '#FFFBF4',
        ink: {
          DEFAULT: '#241A20',
          soft: '#5A4B53',
          muted: '#8F8189',
          line: '#E7D9DB',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['clamp(2.25rem, 6.5vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.75rem, 9vw, 5.75rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(3.25rem, 13vw, 9rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(4rem, 20vw, 17rem)', { lineHeight: '0.82', letterSpacing: '-0.04em' }],
        micro: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.2em' }],
      },
      letterSpacing: {
        label: '0.2em',
        season: '0.34em',
      },
      maxWidth: {
        measure: '36rem',
        editorial: '90rem',
      },
      spacing: {
        section: 'clamp(6rem, 13vw, 12rem)',
        gutter: 'clamp(1.25rem, 5vw, 5rem)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-rise': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(7px)', opacity: '1' },
        },
      },
      animation: {
        // No fill mode: if animations never run, the element stays visible.
        'fade-rise': 'fade-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        'scroll-hint': 'scroll-hint 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        // The logo is a ball of yarn; one turn a minute reads as the ball
        // moving, not as an animation asking to be watched.
        'spin-slow': 'spin 60s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
