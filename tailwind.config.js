/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta premium oscura
        dark: {
          950: '#0b0f19', // Background principal
          900: '#0f172a', // Paneles / Sidebar
          800: '#1e293b', // Chat burbuja izquierda
          700: '#334155', // Bordes / inputs
        }
      }
    },
  },
  plugins: [],
}
