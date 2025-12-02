/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-lato)', 'sans-serif'],
  			serif: ['var(--font-playfair)', 'serif'],
  			display: ['var(--font-cinzel)', 'serif']
  		},
  		colors: {
            // Paleta Lumière Original
  			gold: {
  				'100': '#F9F1D8',
  				'200': '#F0DEAA',
  				'300': '#E6CB7D',
  				'400': '#DBB853',
  				'500': '#D4AF37', // Ouro Metálico Principal
  				'600': '#AA8C2C',
  				'700': '#806921',
  				'900': '#423611'
  			},
  			deep: {
  				'800': '#141E1B',
  				'900': '#0A0F0D' // Preto Rico / Fundo Principal
  			},
            // Integração Shadcn
  			background: '#0A0F0D', // deep-900
  			foreground: '#F9F1D8', // gold-100
  			card: {
  				DEFAULT: '#141E1B', // deep-800
  				foreground: '#F9F1D8'
  			},
  			popover: {
  				DEFAULT: '#141E1B',
  				foreground: '#F9F1D8'
  			},
  			primary: {
  				DEFAULT: '#D4AF37', // gold-500
  				foreground: '#0A0F0D'
  			},
  			secondary: {
  				DEFAULT: '#27272a',
  				foreground: '#F9F1D8'
  			},
  			muted: {
  				DEFAULT: '#27272a',
  				foreground: '#a1a1aa'
  			},
  			accent: {
  				DEFAULT: '#1c2e28',
  				foreground: '#D4AF37'
  			},
  			destructive: {
  				DEFAULT: '#7f1d1d',
  				foreground: '#F9F1D8'
  			},
  			border: '#806921', // gold-700 (Sutil)
  			input: '#27272a',
  			ring: '#D4AF37',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
        animation: {
          'fade-in': 'fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          'slide-up': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        keyframes: {
          'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          'slide-up': {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          }
        }
  	}
  },
  plugins: [require("tailwindcss-animate")],
};