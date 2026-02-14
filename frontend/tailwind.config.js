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
        'smart-bg': "url('/src/assets/images/smart-bg-image.svg')",
        'img-bg': "url('/src/assets/images/bgimage.svg')"
      },
      colors: {
        primary: 'rgb(var(--primary))',
        secondary: 'rgb(var(--secondary))',
        grey: '#3A3A3A',
        primarybg: '#FFFFFF4D',
        secondarybg: '#F7EDFF',
        textgrey: '#848586',
        bordergrey: '#DBDBDB',
        primarybglight: '#0062D224',
        greylight: '#3A3A3A24',
        bordergreylight: '#D4D4D4',
        textblack: '#000000',
        secondary_light: '#8B24E21F',
        pricing_text: '#808080',
        textwhite: '#FFFFFF',
        tableborder: '#D9D9D9',
        progress_yellow: '#FFCD0FFC',
        progress_blue: '#55EFC2',
        progress_green: '#B0F6B5',
        filter_border: '#8F8F8F',
        green_text: '#34C759',
        green_bg: '#DEF4E6',
        red_text: '#EB4824',
        red_bg: '#EA292914',
        search_bg: '#FFFFFF1A',
        switch_bg: '#D3D6E4',
        tab_bg: '#7676801F',
        primary_light: '#4581FF',
        grey_text: '#4A4747',
        delete_red: '#AD3F2B',
        day_select_bg: '#EEF3FF',
        day_select: '#CDDDFF',
        plan_bg_grey: '#E8ECFF',
        plan_grey: '#7287FD',
        plan_bg_green: '#F2FFCC',
        plan_green: '#8EB41C',
        plan_bg_blue: '#E1F2F6',
        plan_blue: '#4EABC3',
        plan_bg_purple: '#7E02F61F',
        plan_purple: '#8B24E2',
        badge_blue:'#00AFB5',
        badge_blue_bg:'#E6FFFD',
        badge_yellow:'#DDAF00FC',
        badge_yellow_bg:'#F9F0D0FC',
        badge_bg_green:'#CCFFCC',
        tabelsubtitle:'#504E4E',
        barchartexpense:'#8A00FF',
        revenue_other:'#A3AED0',
        memberprogress_light:'#4581FF45',
        inventory_light:'#FFCD0F45',
        purchase_light:'#EB492545',
          
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
