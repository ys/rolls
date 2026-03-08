import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["iA Writer Mono", "ui-monospace", "monospace"],
      },
      colors: {
        kodak: {
          50:  "#fff8ec",
          100: "#ffefd0",
          200: "#ffdca0",
          300: "#ffc265",
          400: "#ff9f30",
          500: "#FF9500",
          600: "#e07800",
          700: "#b85700",
          800: "#924200",
          900: "#773600",
          950: "#411700",
        },
      },
    },
  },
  plugins: [],
};
export default config;
