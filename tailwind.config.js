/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
        status: {
          masuk: { DEFAULT: '#6B7280', bg: '#F3F4F6' },
          diagnosa: { DEFAULT: '#3B82F6', bg: '#EFF6FF' },
          proses: { DEFAULT: '#F59E0B', bg: '#FFFBEB' },
          tunggu: { DEFAULT: '#F97316', bg: '#FFF7ED' },
          selesai: { DEFAULT: '#10B981', bg: '#ECFDF5' },
          diambil: { DEFAULT: '#065F46', bg: '#D1FAE5' },
        },
        semantic: {
          danger: { DEFAULT: '#EF4444', bg: '#FEF2F2' },
          warning: { DEFAULT: '#F59E0B', bg: '#FFFBEB' },
          success: { DEFAULT: '#10B981', bg: '#ECFDF5' },
          info: { DEFAULT: '#3B82F6', bg: '#EFF6FF' },
        }
      },
    },
  },
  plugins: [],
}
