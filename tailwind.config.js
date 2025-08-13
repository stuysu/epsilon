/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        fontFamily: {
            sans: ["inter-variable", "system-ui", "sans-serif"],
            display: [
                "neue-haas-grotesk-display",
                "inter-variable",
                "sans-serif",
            ],
        },

        extend: {
            colors: {
                bg: "var(--bg-main)",

                layer: {
                    1: "var(--layer-primary)",
                    2: "var(--layer-secondary)",
                    3: "var(--layer-tertiary)",
                },

                typography: {
                    1: "var(--text-primary)",
                    2: "var(--text-secondary)",
                    3: "var(--text-tertiary)",
                },

                accent: "var(--accent)",

                blue: "var(--blue)",
                green: "var(--green)",
                yellow: "var(--yellow)",
                red: "var(--red)",
                beige: "var(--beige)",
                divider: "var(--divider)",

                blurDark: "var(--blur-dark)",
                blurLight: "var(--blur-light)",
            },
            boxShadow: {
                module: "0 0 1.5px 0 rgba(255, 255, 255, 0.25) inset",
                control: "0 0 2px 0 rgba(255, 255, 255, 0.3) inset",
            },
        },
    },
    plugins: [],
};
