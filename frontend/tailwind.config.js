/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#b91c1c", // Red 700 - Brand Crimson
                    light: "#dc2626",
                    dark: "#991b1b",
                    50: "#fef2f2",
                    100: "#fee2e2",
                    foreground: "#ffffff"
                },
                secondary: {
                    DEFAULT: "#ea580c", // Brand Amber / Orange
                    light: "#f97316",
                    dark: "#c2410c",
                    foreground: "#ffffff"
                },
                brand: {
                    red: "#b91c1c",
                    darkRed: "#7f1d1d",
                    gold: "#d97706",
                    dark: "#121214",
                    cream: "#fcfbfa"
                },
                background: "#ffffff",
                foreground: "#1c1917", // Stone 900
                muted: "#f5f5f4", // Stone 100
                border: "#e7e5e4", // Stone 200
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
                serif: ['Playfair Display', 'serif'],
            }
        },
    },
    plugins: [],
}
