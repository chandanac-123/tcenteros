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
        'secondary-bg': "url('/src/assets/images/landingsecondary.svg')",
        'smart-bg':"url('/src/assets/images/smart-bg-image.svg')",
        'img-bg':"url('/src/assets/images/bgimage.svg')",
      },
      colors: {
        primary: 'rgb(var(--primary))',
        secondary: 'rgb(var(--secondary))',
        grey: '#3A3A3A',
        primarybg: '#FFFFFF4D',
        secondarybg: '#F7EDFF',
        textgrey:'#848586',
        bordergrey:'#DBDBDB',
        primarybglight:'#0062D224',
        greylight:'#3A3A3A24',
        bordergreylight:'#D4D4D4',
        textblack:'#000000',
        secondary_light:"#8B24E21F",
        pricing_text:"#808080",
        textwhite:'#FFFFFF',
        tableborder:'#D9D9D9',
        progress_yellow:'#FFCD0FFC',
        progress_blue:'#55EFC2',
        progress_green:'#B0F6B5',
        filter_border:"#8F8F8F",
        green_text:'#34C759',
        green_bg:'#DEF4E6',
        red_text:'#EB4824',
        red_bg:'#EA292914',
        search_bg:'#FFFFFF1A',
        switch_bg:'#D3D6E4',
        tab_bg:'#7676801F',
        primary_light:'#4581FF',
        grey_text:'#4A4747'  ,
        delete_red:'#AD3F2B',

      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
