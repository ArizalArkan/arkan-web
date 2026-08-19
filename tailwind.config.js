/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        fontFamily: {
          // neo-brutalist system
          display: ['Archivo Black', 'sans-serif'],
          sans: ['Space Grotesk', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
          // retained for the not-yet-converted sections
          generalsans: ['General Sans', 'sans-serif'],
          instrument: ['Instrument Serif', 'serif'],
          manrope: ['Manrope', 'sans-serif'],
        },
        colors: {
          paper: {
            DEFAULT: '#FDF6E3',
            2: '#F5EFDC',
          },
          ink: {
            DEFAULT: '#0A0A0A',
          },
          nb: {
            yellow: '#FFD93D',
            pink: '#FF6B9D',
            lime: '#A8E10C',
            sky: '#7DD3FC',
          },
          black: {
            DEFAULT: '#000',
            100: '#010103',
            200: '#0E0E10',
            300: '#1C1C21',
            500: '#3A3A49',
            600: '#1A1A1A',
          },
          white: {
            DEFAULT: '#FFFFFF',
            800: '#E4E4E6',
            700: '#D6D9E9',
            600: '#AFB0B6',
            500: '#62646C',
          },
        },
        borderWidth: {
          3: '3px',
        },
        boxShadow: {
          nb: '4px 4px 0 0 #0A0A0A',
          'nb-lg': '8px 8px 0 0 #0A0A0A',
          'nb-xl': '12px 12px 0 0 #0A0A0A',
          'nb-pink': '4px 4px 0 0 #FF6B9D',
          'nb-lime': '4px 4px 0 0 #A8E10C',
          'nb-sky': '4px 4px 0 0 #7DD3FC',
          'nb-xl-pink': '12px 12px 0 0 #FF6B9D',
        },
        backgroundImage: {
          terminal: "url('/assets/terminal.png')",
        },
      },
    },
    plugins: [],
  };
