/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif']
      },
      backgroundImage: {
        'primary-bg': "url('/src/assets/images/landingprimary.svg')",
        'secondary-bg': "url('/src/assets/images/landingsecondary.svg')"
      },
      colors: {
        primary: '#1452D4',
        secondary: '#8B24E2',
        grey: '#3A3A3A',
        primarybg: '#FFFFFF4D',
        secondarybg: '#F7EDFF',
        textgrey:'#848586',
        bordergrey:'#DBDBDB'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
