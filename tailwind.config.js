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
          50: '#fffbeb',
          400: '#f59e0b', // Oro claro (hover / highlights)
          500: '#d97706', // Oro elegante (CTA primario / acento de marca)
          600: '#b45309', // Oro oscuro (active state)
        },
        brand: {
          emerald: '#10b981', // Reservado como semántico de éxito, no como acento de marca
          emeraldHover: '#059669',
          purple: '#7c3aed', // Color Contextual Sofi AI
          purpleSubtle: 'rgba(124, 58, 237, 0.12)',
        }
      }
    },
  },
  plugins: [],
}
