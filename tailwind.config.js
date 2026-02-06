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
            mono: ["source-code-pro", "monospace"],
        },

        extend: {
            backgroundImage: {
                lineSeparator:
                    "linear-gradient(to right, var(--divider) 0%, var(--highlight) 25%, var(--divider) 100%)",
            },
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
                prominent:
                    "0 4px 20px 10px var(--shadow-base), 0 3px 4px 2px var(--shadow-base), 0 0 2px 0 var(--shadow-antithesis) inset, 0 -7px 20px 0 var(--shadow-fume) inset",
                control:
                    "0 4px 4px 0 var(--shadow-base), 0 0 1px 0 var(--shadow-antithesis) inset, 0 1px 3px 0 var(--shadow-decoration) inset",
                inner: "0 3px 3px 0 var(--shadow-base) inset, 0 0 2px 0 var(--shadow-antithesis) inset, 0 1px 1px 0 var(--shadow-decoration) inset, 0 -5px 20px 0 var(--shadow-fume) inset",
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                ".scrollbar-none": {
                    "-ms-overflow-style": "none",
                    "scrollbar-width": "none",
                },
                ".scrollbar-none::-webkit-scrollbar": {
                    display: "none",
                },
            });
        },
        ({ addVariant }) => {
            addVariant("scheme-light", ":root[data-scheme='light'] &");
            addVariant("scheme-dark", ":root[data-scheme='dark'] &");
        },
    ],
};
