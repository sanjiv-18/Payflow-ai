/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          main: "#0B0F14",
          sidebar: "#101820",
          card: "#151F29",
          elevated: "#1B2933",
          border: "#263640",
          text: "#F8FAFC",
          sub: "#94A3B8",
        },
        brand: {
          blue: "#10B981", // primary emerald accent
          mint: "#34D399", // secondary mint accent
          emerald: "#10B981",
          violet: "#34D399",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(16, 185, 129, 0.3)",
        "glow-emerald": "0 0 20px -5px rgba(16, 185, 129, 0.35)",
        "glow-violet": "0 0 20px -5px rgba(52, 211, 153, 0.3)",
        card: "0 4px 20px 0 rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
}
