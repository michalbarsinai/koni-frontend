/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        koni: ["Fredoka", "sans-serif"],
      },
      colors: {
        // Primary orange — main actions, highlights, brand presence
        brand: {
          50:  "#fff5ec",
          100: "#ffe6cc",
          200: "#ffc999",
          300: "#ffa55c",
          400: "#ff7f2a",
          500: "#e06828",   // Koni primary orange
          600: "#c05218",
          700: "#9a3f12",
          800: "#7a3210",
          900: "#63280d",
        },
        // Navy blue — headers, primary text, professional anchor
        navy: {
          50:  "#eef2f9",
          100: "#d5dfee",
          200: "#adbedd",
          300: "#7e97c7",
          400: "#5575b4",
          500: "#3a5899",
          600: "#2c4480",
          700: "#1e2d4f",   // Main navy
          800: "#172340",
          900: "#111a32",
        },
        // Coral red — negative balances, alerts, debt indicators
        coral: {
          50:  "#fff1f1",
          100: "#ffdede",
          200: "#ffbebe",
          300: "#ff8e8e",
          400: "#e85c5c",   // Main coral
          500: "#d44444",
          600: "#b03030",
          700: "#8e2626",
          800: "#732020",
          900: "#5e1b1b",
        },
        // Mint green — credit/positive transactions, success confirmations
        mint: {
          50:  "#edfdf7",
          100: "#d2f9ec",
          200: "#a8f0da",
          300: "#70e2c3",
          400: "#3ecfa8",   // Main mint
          500: "#25b592",
          600: "#1c9178",
          700: "#197462",
          800: "#175d50",
          900: "#154d43",
        },
        // Amber — positive balances, success states, warm accents
        golden: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#f5b84c",   // Main amber/golden
          500: "#e6990e",
          600: "#c47d0a",
          700: "#9d6307",
          800: "#7c4f08",
          900: "#633f07",
        },
      },
    },
  },
  plugins: [],
};
