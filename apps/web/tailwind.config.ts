import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050506',
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#242430',
          500: '#2e2e3d',
          400: '#3d3d52',
          300: '#5a5a78',
        },
        slate: {
          50:  '#f8f8fa',
          100: '#ededf2',
          200: '#d8d8e3',
          300: '#b8b8cc',
          400: '#8a8aa3',
          500: '#636380',
          600: '#4a4a63',
          700: '#363650',
          800: '#252538',
          900: '#181825',
        },
        phosphor: {
          DEFAULT: '#4ade80',
          dim:     '#22c55e',
          glow:    '#86efac',
          muted:   '#166534',
        },
        status: {
          pending:    '#6366f1',
          processing: '#f59e0b',
          completed:  '#4ade80',
          failed:     '#ef4444',
        },
      },
      fontFamily: {
        display: ['Geist', 'var(--font-geist-sans)', 'system-ui'],
        body:    ['Geist Mono', 'var(--font-geist-mono)', 'monospace'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'grid':  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        'glow-phosphor': 'radial-gradient(ellipse at center, rgba(74,222,128,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      boxShadow: {
        'glass':      '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'phosphor':   '0 0 20px rgba(74,222,128,0.3)',
        'inner-glow': 'inset 0 0 20px rgba(74,222,128,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'scan':       'scan 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
