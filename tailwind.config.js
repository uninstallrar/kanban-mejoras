/** @type {import('tailwindcss').Config} */
export default {
  // 'class' permite alternar tema oscuro/claro de forma manual con la clase .dark
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidad corporativa "panel de gobernanza": azul pizarra + acento ámbar
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        // Paleta neutra (slate) usada para superficies en modo claro/oscuro
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
