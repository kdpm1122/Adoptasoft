/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { light: "#F2A65A", DEFAULT: "#D9711A", dark: "#B85A0F" },
        warm: { bg: "#FBE8D3", cream: "#FDF6ED" },
        text: { dark: "#2B2018", muted: "#8C7B6B" },
        border: { DEFAULT: "#E8D5BC" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
      boxShadow: {
        soft: "0 4px 14px 0 rgba(217, 113, 26, 0.25)",
        "soft-lg": "0 10px 28px 0 rgba(217, 113, 26, 0.35)",
        card: "0 1px 2px rgba(43, 32, 24, 0.06), 0 8px 20px -6px rgba(43, 32, 24, 0.12)",
        "card-hover": "0 4px 10px rgba(217, 113, 26, 0.10), 0 20px 36px -10px rgba(43, 32, 24, 0.20)",
        header: "0 6px 20px -6px rgba(184, 90, 15, 0.45)",
      },
      keyframes: {
        fadeInUp: { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-28px, 22px) scale(1.18)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.45s ease-out both",
        "fade-in": "fadeIn 0.2s ease-out both",
        "float-slow": "float 6s ease-in-out infinite",
        "float-slower": "float 8s ease-in-out infinite reverse",
      },
    },
  },
  plugins: [],
};
