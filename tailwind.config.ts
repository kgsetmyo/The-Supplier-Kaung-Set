import type { Config } from "tailwindcss";

/**
 * Tailwind v4 primarily configures via CSS, but `darkMode: "class"`
 * is kept here for tooling / clarity with next-themes.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
