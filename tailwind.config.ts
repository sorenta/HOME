import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Izmantojam HSL, lai saskanētu ar globals.css mainīgajiem
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        border: "hsl(var(--border))",
      },
      borderRadius: {
        // Šis ļaus izmantot klasi 'rounded-theme'
        theme: "var(--radius)",
      },
      boxShadow: {
        // Šis ļaus izmantot klasi 'shadow-theme'
        theme: "var(--theme-shadow)",
      }
    },
  },
  plugins: [],
};

export default config;