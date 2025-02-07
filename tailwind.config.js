/** tailwind.config.js **/
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0078D4',   // Azul principal (inspirado em Windows 11 / Microsoft)
          light: '#4CA3FF',
          dark: '#005A9E'
        },
        secondary: {
          DEFAULT: '#2B88D8',
          light: '#5AAEFF',
          dark: '#1B5E99'
        },
        accent: {
          DEFAULT: '#00BCF2',
          light: '#33D6FF',
          dark: '#0093C9'
        },
        neutral: {
          50: '#F9F9F9',
          100: '#F3F3F3',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717'
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Arial', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem'
      },
      boxShadow: {
        custom: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    }
  },
  plugins: []
}
