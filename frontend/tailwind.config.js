/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0A0F0F',
        surface: '#111918',
        border: '#1E2D2D',
        primary: '#0D9488',
        primaryHover: '#0F766E',
        primaryGlow: '#14B8A6',
        secondary: '#6B7280',
        secondaryLight: '#9CA3AF',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        text: '#F0FDF4',
        textMuted: '#6B7280',
        textData: '#99F6E4',
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', "sans-serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      fontSize: {
        "10xl": "10rem",
        "12xl": "12rem",
        "14xl": "14rem",
      },
      animation: {
        "grain": "grain 0.8s steps(1) infinite",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-right": "slideRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.6s ease forwards",
        "count-up": "countUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "bar-fill": "barFill 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "border-grow": "borderGrow 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -5%)" },
          "20%": { transform: "translate(-10%, 5%)" },
          "30%": { transform: "translate(5%, -10%)" },
          "40%": { transform: "translate(-5%, 15%)" },
          "50%": { transform: "translate(-10%, 5%)" },
          "60%": { transform: "translate(15%, 0)" },
          "70%": { transform: "translate(0, 10%)" },
          "80%": { transform: "translate(-15%, 0)" },
          "90%": { transform: "translate(10%, 5%)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(32px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideRight: {
          from: { opacity: 0, transform: "translateX(-32px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        barFill: {
          from: { width: "0%" },
          to: { width: "var(--bar-width)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.8)" },
        },
        borderGrow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
    },
  },
  plugins: [],
};
