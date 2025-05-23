import React from "react";

import { createTheme, ThemeProvider as Provider } from "@mui/material";

const ThemeContext = React.createContext({
    toggleColorMode: () => {},
    colorMode: false,
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [storedPreference, setStoredPreference] = React.useState(
        window.localStorage.getItem("mode"),
    );

    const prefersDarkMode =
        storedPreference !== null ? storedPreference === "dark" : true;
    const toggle = React.useMemo(
        () => () =>
            setStoredPreference(() => {
                const output = prefersDarkMode ? "light" : "dark";
                window.localStorage.setItem("mode", output); // persist in localStorage
                return output;
            }),
        [prefersDarkMode],
    );

    const theme = React.useMemo(
        () =>
            createTheme({
                components: {
                    MuiTypography: {
                        styleOverrides: {
                            root: {
                                wordWrap: "break-word",
                            },
                        },
                    },
                },
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                    primary: {
                        main: "#d8d8d8",
                        contrastText: "#d8d8d8",
                    },
                    secondary: {
                        main: "#e74c3c",
                        contrastText: "#b8b8b8",
                    },
                    background: {
                        default: prefersDarkMode ? "#111111" : "#cdcdcd",
                        paper: prefersDarkMode ? "#111111" : "#bfbfbf",
                    },
                },
                typography: {
                    fontFamily: `'inter-variable', sans-serif`,
                    htmlFontSize: 16,
                    h1: {
                        fontFamily: `'neue-haas-grotesk-display', sans-serif`,
                        fontWeight: 700,
                        fontSize: "2.2rem",
                        lineHeight: "2.2rem",
                        margin: "0.5rem 0",
                        color: prefersDarkMode ? "#E8E8E8CC" : "#2B2B2B",
                    },
                    h2: {
                        fontFamily: `'neue-haas-grotesk-display', sans-serif`,
                        fontWeight: 600,
                        fontSize: "1.6rem",
                        color: prefersDarkMode ? "#E8E8E8CC" : "#3B3B3B",
                    },
                    h3: {
                        paddingTop: "0.12em",
                        lineHeight: "1.6rem",
                        fontSize: "1.6rem",
                        fontVariationSettings: `'wght' 700`,
                        margin: "0.5rem 0",
                        color: prefersDarkMode ? "#E8E8E8CC" : "#4B4B4B",
                    },
                    h4: {
                        lineHeight: "1.3rem",
                        fontSize: "1.2rem",
                        fontVariationSettings: `'wght' 600`,
                        margin: "0.3rem 0",
                        color: prefersDarkMode ? "#E8E8E8CC" : "#4B4B4B",
                    },
                    h5: {
                        fontSize: "1.4rem",
                        fontVariationSettings: `'wght' 500`,
                        margin: "0.5rem 0",
                        color: prefersDarkMode ? "#E8E8E8CC" : "#5B5B5B",
                    },
                    h6: {
                        fontSize: "1rem",
                        fontVariationSettings: `'wght' 500`,
                        margin: "0.5rem 0",
                        color: prefersDarkMode ? "#E8E8E8CC" : "#5B5B5B",
                    },
                    body1: {
                        fontSize: "1rem",
                        fontVariationSettings: `'wght' 500`,
                        lineHeight: "1.3rem",
                        color: prefersDarkMode ? "#AEAEAECC" : "#2C2C2C",
                    },
                },
            }),
        [prefersDarkMode],
    );

    const value = { toggleColorMode: toggle, colorMode: prefersDarkMode };
    return (
        <ThemeContext.Provider value={value}>
            <Provider theme={theme}>{children}</Provider>
        </ThemeContext.Provider>
    );
};

export { ThemeProvider, ThemeContext };
