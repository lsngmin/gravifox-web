/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  safelist: [
    "bg-gradient-to-br",
    "from-white",
    "to-gray-200",
    "shadow-md",
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.5rem',
      },
      animation: {
        'floating': 'floating 2s ease-in-out infinite',
      },
      keyframes: {
        floating: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

