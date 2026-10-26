/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#09090b',
        panel: '#121214',
        surface: '#18181b',
        stroke: '#27272a',
        'stroke-hover': '#3f3f46',
        accent: '#10b981',
        'accent-dim': 'rgba(16, 185, 129, 0.1)',
        'text-main': '#f4f4f5',
        'text-dim': '#a1a1aa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};