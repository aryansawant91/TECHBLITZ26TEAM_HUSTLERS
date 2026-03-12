export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },
      colors: {
        clinic: {
          50: "#f0fdf6", 100: "#dcfce9", 200: "#bbf7d2",
          400: "#4ade80", 500: "#22c55e", 600: "#16a34a",
          700: "#15803d", 800: "#166534", 900: "#14532d",
        }
      }
    }
  },
  plugins: []
}
