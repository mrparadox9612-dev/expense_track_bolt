module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "accent-1": "var(--accent-1)",
        "accent-2": "var(--accent-2)",
        "grey-1": "var(--grey-1)",
        "grey-2": "var(--grey-2)",
        "grey-3": "var(--grey-3)",
        "grey-4": "var(--grey-4)",
        "primary-1": "var(--primary-1)",
        "primary-2": "var(--primary-2)",
        "secondary-1": "var(--secondary-1)",
        "secondary-2": "var(--secondary-2)",
        "secondary-3": "var(--secondary-3)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        "body-large": "var(--body-large-font-family)",
        "body-large-emphasized": "var(--body-large-emphasized-font-family)",
        "body-medium": "var(--body-medium-font-family)",
        "body-medium-emphasized": "var(--body-medium-emphasized-font-family)",
        "body-small": "var(--body-small-font-family)",
        "body-small-emphasized": "var(--body-small-emphasized-font-family)",
        "heading-large-emphasized":
          "var(--heading-large-emphasized-font-family)",
        "heading-medium-emphasized":
          "var(--heading-medium-emphasized-font-family)",
        "heading-small": "var(--heading-small-font-family)",
        "heading-small-emphasized":
          "var(--heading-small-emphasized-font-family)",
        "label-medium": "var(--label-medium-font-family)",
        "label-small": "var(--label-small-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [],
  darkMode: ["class"],
};
