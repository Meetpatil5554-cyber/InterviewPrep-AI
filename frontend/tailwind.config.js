/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12172B",
        inkline: "#1D2440",
        paper: "#F6F4EE",
        amber: "#F2A93B",
        teal: "#2BB3A3",
        coral: "#E3573E",
        slate: "#8A93B2",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
