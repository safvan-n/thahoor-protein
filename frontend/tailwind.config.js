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
                    DEFAULT: "#b91c1c", // Red 700 - Butchery Red
                    foreground: "#ffffff"
                },
                secondary: {
                    DEFAULT: "#f97316", // Orange 500 - Hero Background
                    foreground: "#ffffff"
                },
                background: "#ffffff",
                foreground: "#1c1917", // Stone 900
                muted: "#f5f5f4", // Stone 100
                border: "#e7e5e4", // Stone 200
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
            }
        },
    },
    plugins: [],
}
