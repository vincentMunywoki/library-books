

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF", // Custom primary color
        secondary: "#9333EA", // Custom secondary color
        accent: "#FACC15", // Custom accent color
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"), // Adds better form styles
    require("@tailwindcss/typography"), // Enhances text styles
    require("@tailwindcss/aspect-ratio"), // Helps manage aspect ratios
  ],
};

export default config;

