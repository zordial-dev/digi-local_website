/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#18281F',
        'primary-card': '#243A2D',
        'primary-foreground': '#F7F4EE',
        secondary: '#EFE8D8',
        background: '#F7F4EE',
        card: '#FFFFFF',
        foreground: '#18281F',
        ink: '#18281F',
        'ink-foreground': '#F7F4EE',
        gold: '#C4A066',
        accent: '#C4A066',
        border: '#E4DCC9',
        'muted-foreground': '#6B7C70',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}


