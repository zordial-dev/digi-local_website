/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DIGILOCAL LUXURY PALETTE (Oxblood x Nude x Warm Cream)
        cream: '#F6F0E8',         // 60% Dominant Background
        'soft-cream': '#EEE5DA',    // Soft Alternate Section Background
        espresso: '#211A19',      // 20% Main Text & Dark Surfaces
        oxblood: '#541D26',       // 10% Primary Brand / CTA
        'oxblood-hover': '#6B2732',// Hover / Active Oxblood
        nude: '#D6B7A5',          // 7% Secondary Accent / Soft Highlights
        gold: '#C8A878',          // 3% Micro-Accent Champagne Gold
        'border-tone': '#E5DAD0', // Refined Subtle Border
        
        // TAILWIND SEMANTIC MAP
        primary: '#541D26',
        'primary-hover': '#6B2732',
        'primary-card': '#FFFFFF',
        'primary-foreground': '#FFFFFF',
        background: '#F6F0E8',
        card: '#FFFFFF',
        foreground: '#211A19',
        ink: '#211A19',
        'ink-secondary': 'rgba(33, 26, 25, 0.75)',
        accent: '#D6B7A5',
        secondary: '#D6B7A5',
        border: '#E5DAD0',
        'muted-foreground': 'rgba(33, 26, 25, 0.75)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
