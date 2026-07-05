import { type Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F4B400",
        "primary-dark": "#D99A00",
        "primary-light": "#FFF3C4",
        "background-soft": "#FFFBEA",
        "border-soft": "#F1E2A8",
        "text-main": "#2F2F2F",
        "text-muted": "#6B6B6B",
      },
    },
  },
  plugins: [],
} satisfies Config;
