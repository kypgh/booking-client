import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        brand: "#5C7AEA", // static fallback
        // Status colors
        success: "var(--success)",
        "success-foreground": "var(--success-foreground)",
        warning: "var(--warning)",
        "warning-foreground": "var(--warning-foreground)",
        info: "var(--info)",
        "info-foreground": "var(--info-foreground)",
        // Systematic color palette
        "color-1": "var(--color-1)",
        "color-1-foreground": "var(--color-1-foreground)",
        "color-1-light": "var(--color-1-light)",
        "color-1-dark": "var(--color-1-dark)",
        "color-2": "var(--color-2)",
        "color-2-foreground": "var(--color-2-foreground)",
        "color-2-light": "var(--color-2-light)",
        "color-2-dark": "var(--color-2-dark)",
        "color-3": "var(--color-3)",
        "color-3-foreground": "var(--color-3-foreground)",
        "color-3-light": "var(--color-3-light)",
        "color-3-dark": "var(--color-3-dark)",
        "color-4": "var(--color-4)",
        "color-4-foreground": "var(--color-4-foreground)",
        "color-4-light": "var(--color-4-light)",
        "color-4-dark": "var(--color-4-dark)",
        "color-5": "var(--color-5)",
        "color-5-foreground": "var(--color-5-foreground)",
        "color-5-light": "var(--color-5-light)",
        "color-5-dark": "var(--color-5-dark)",
        "color-6": "var(--color-6)",
        "color-6-foreground": "var(--color-6-foreground)",
        "color-6-light": "var(--color-6-light)",
        "color-6-dark": "var(--color-6-dark)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
