import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          light: "#60A5FA",
          bg: "rgba(59, 130, 246, 0.1)",
        },
        accent: {
          red: "#EF4444",
          yellow: "#F59E0B",
          green: "#10B981",
        },
        background: {
          light: "#FFFFFF",
          dark: "#111827",
        },
        surface: {
          light: "#F9FAFB",
          dark: "#1F2937",
          hover: {
            light: "#F3F4F6",
            dark: "#374151",
          },
        },
        text: {
          primary: {
            light: "#111827",
            dark: "#F9FAFB",
          },
          secondary: {
            light: "#4B5563",
            dark: "#9CA3AF",
          },
          muted: {
            light: "#6B7280",
            dark: "#6B7280",
          },
        },
        border: {
          light: "#E5E7EB",
          dark: "#374151",
        },
        status: {
          online: "#34D399",
          offline: "#6B7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
