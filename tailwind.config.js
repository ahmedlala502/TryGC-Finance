/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#563593',
        accent: '#e9640d',
        bg: '#f8f9fc',
        bg2: '#fff',
        bg3: '#f1f3f8',
        border: '#e2e5ef',
        border2: '#d0d5e8',
        text: '#1a1d2e',
        text2: '#3d4162',
        muted: '#8890b0',
      },
      borderRadius: {
        md: '12px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        md: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
