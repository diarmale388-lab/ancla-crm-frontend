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
        // Paleta ANCLA: "Luxury Modular Architecture & High-Ticket Real Estate"
        navy: {
          950: '#0a0e17', // Canvas Base ANCLA
          900: '#111827', // Paneles / Layout ANCLA
          800: '#1a2332', // Tarjetas / Modales elevadas
          700: '#243044', // Bordes e Inputs marcados
        },
        gold: {
          50: '#fdf9f3',
          100: '#f5ede0',
          200: '#e8dcc8',
          300: '#d6c3a1',
          400: '#d6c3a1', // Oro claro (hover / highlights)
          500: '#c5a880', // Oro Champagne ANCLA (acento de marca)
          600: '#a88a5f', // Oro oscuro (active state)
          700: '#8b7350',
          800: '#6e5c40',
        },
        brand: {
          success: '#10b981', // Reservado ÚNICAMENTE para indicador En línea / Activo
          successHover: '#059669',
          purple: '#7c3aed', // Color Contextual Sofi AI
          purpleSubtle: 'rgba(124, 58, 237, 0.12)',
        }
      }
    },
  },
  plugins: [],
}
