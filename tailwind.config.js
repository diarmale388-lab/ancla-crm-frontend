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
        // Paleta Luminance Laddering Alta Gama
        dark: {
          950: '#0b0f19', // Canvas Base (Fondo Nivel 0)
          900: '#0f172a', // Paneles / Layout (Nivel 1)
          800: '#1e293b', // Tarjetas / Modales (Nivel 2)
          700: '#334155', // Bordes e Inputs (Nivel 3)
          600: '#475569',
        },
        brand: {
          emerald: '#10b981', // Color de Acento Primario (CTAs)
          emeraldHover: '#059669',
          purple: '#7c3aed', // Color Contextual Sofi AI
          purpleSubtle: 'rgba(124, 58, 237, 0.12)',
        }
      }
    },
  },
  plugins: [],
}
