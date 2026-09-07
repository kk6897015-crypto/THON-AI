/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0E0A09',
        surface: '#181110',
        'surface-elevated': '#221715',
        'surface-card': '#261917',
        'surface-inner': '#140E0D',
        claude: {
          white: '#FFFFFF',
          sand: '#FAF6F4',
          peach: '#F5E8E2',
          'peach-muted': '#D8C3BB',
          coral: '#DE3C25',
          'coral-hover': '#F04C34',
          'coral-light': '#F87059',
          'coral-subtle': 'rgba(222, 60, 37, 0.12)',
          espresso: '#2D1815',
          'espresso-light': '#3E2420',
          'espresso-dark': '#1E1210',
          obsidian: '#0E0A09',
          border: 'rgba(245, 232, 226, 0.12)',
          'border-strong': 'rgba(245, 232, 226, 0.22)',
          'border-coral': 'rgba(222, 60, 37, 0.35)',
        },
        arounda: {
          void: '#0E0A09',
          slate: '#1A1211',
          indigo: '#DE3C25',
          cyan: '#F5E8E2',
          magenta: '#E53E2B',
          emerald: '#F5E8E2',
          amber: '#F58A7A',
          purple: '#DE3C25'
        },
        unstop: {
          blue: '#DE3C25',
          navy: '#2D1815',
          cyan: '#F5E8E2',
          emerald: '#E53E2B',
          amber: '#F58A7A',
          purple: '#DE3C25',
          rose: '#E53E2B'
        },
        accent: {
          DEFAULT: '#DE3C25',
          mint: '#F5E8E2',
          cyan: '#F58A7A',
          hover: '#F04C34',
          muted: 'rgba(222, 60, 37, 0.15)'
        },
        border: {
          subtle: 'rgba(245, 232, 226, 0.1)',
          strong: 'rgba(245, 232, 226, 0.2)',
          accent: 'rgba(222, 60, 37, 0.35)'
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Lora', '"Source Serif 4"', 'Georgia', 'serif'],
        display: ['Newsreader', 'Lora', '"Source Serif 4"', 'Georgia', 'serif'],
        heading: ['Newsreader', 'Lora', '"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'equalizer': 'equalizer 1.2s ease-in-out infinite alternate'
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(1.15)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        equalizer: {
          '0%': { height: '20%' },
          '100%': { height: '100%' }
        }
      }
    },
  },
  plugins: [],
}


