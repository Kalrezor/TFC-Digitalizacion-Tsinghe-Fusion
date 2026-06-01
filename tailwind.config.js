/**
 * Configuracion de Tailwind CSS.
 * Define que archivos escanea Tailwind y extiende el tema visual de la app.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Archivos donde Tailwind busca clases CSS usadas por React.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Colores personalizados usados por la interfaz del restaurante.
      colors: {
        // Paleta Minimalista: Perla, Dorado, Verde
        pearl: {
          50: '#fefdfb',
          100: '#fdfbf7',
          200: '#faf5ed',
          300: '#f5ede3',
          400: '#f0e5d9',
          500: '#e8dccf', // Color de fondo principal
          600: '#d9cbb8',
          700: '#c0b5a0',
          800: '#a89988',
          900: '#8f7d70',
        },
        gold: {
          50: '#fffef5',
          100: '#fffce8',
          200: '#fffacd',
          300: '#fff8b3',
          400: '#ffe680',
          500: '#ffd700', // Oro principal
          600: '#ffcc00',
          700: '#ffb300',
          800: '#ff9900',
          900: '#e68900',
        },
        sage: {
          50: '#f7fbf7',
          100: '#f1f9f3',
          200: '#e0f3e5',
          300: '#c9ead7',
          400: '#9fd6b0',
          500: '#6db888', // Verde sage principal
          600: '#568d6e',
          700: '#406b53',
          800: '#2d4a3a',
          900: '#1a2e23',
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2e8b57', // Verde matizado
          600: '#228b22',
          700: '#166534',
          800: '#145230',
          900: '#0f3d1f',
        }
      },
      // Familias tipograficas reutilizables desde clases Tailwind.
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        elegant: ['"Georgia"', 'serif'],
      },
      // Espaciados extra que no vienen por defecto en Tailwind.
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      // Radios de borde ajustados al estilo visual del proyecto.
      borderRadius: {
        none: '0',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      // Sombras personalizadas para tarjetas, paneles y elementos elevados.
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
        soft: '0 2px 4px rgba(0, 0, 0, 0.08)',
        md: '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
      // Duraciones de transicion adicionales.
      transitionDuration: {
        250: '250ms',
      }
    },
  },
  // Plugins adicionales de Tailwind. Ahora mismo no hay ninguno.
  plugins: [],
}
