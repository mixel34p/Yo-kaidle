/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        secondary: '#1D3557',
        background: '#F1FAEE',
        accent: '#A8DADC',
        neutral: '#457B9D',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'confetti': 'confetti 5s ease-in-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(-10px)', opacity: 1 },
          '100%': { transform: 'translateY(100vh)', opacity: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
