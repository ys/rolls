import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Padding utilities
    'pb-24',
    // Status colors - background
    'bg-amber-400',
    'bg-cyan-400',
    'bg-orange-400',
    'bg-green-400',
    'bg-purple-400',
    'bg-blue-400',
    'bg-zinc-400',
    // Status colors - text
    'text-amber-400',
    'text-cyan-400',
    'text-orange-400',
    'text-green-400',
    'text-purple-400',
    'text-blue-400',
    'text-zinc-400',
    // Dark mode text colors (used in conditional classes)
    'dark:text-amber-400',
    'dark:text-cyan-400',
    'dark:text-orange-400',
    'dark:text-green-400',
    'dark:text-purple-400',
    'dark:text-blue-400',
    'dark:text-zinc-400',
    // Common conditional classes
    'bg-white',
    'dark:bg-zinc-600',
    'dark:bg-zinc-900',
    'text-zinc-900',
    'dark:text-white',
    'text-zinc-500',
    'dark:text-zinc-400',
    'border-zinc-300',
    'dark:border-zinc-700',
    'hover:bg-zinc-100',
    'dark:hover:bg-zinc-800',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["iA Writer Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
