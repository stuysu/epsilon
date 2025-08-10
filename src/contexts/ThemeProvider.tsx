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
                    MuiDialogActions: {
                        styleOverrides: {
                            root: {
                                padding: "1rem",
                                display: "flex",
                                gap: "5px",
                            },
                        },
                    },
                    MuiDialog: {
                        defaultProps: {
                            TransitionComponent: React.Fragment,
                        },
                        styleOverrides: {
                            paper: {
                                maxWidth: "600px",
                                width: "75vw",
                                borderRadius: "15px",
                                backgroundColor: "rgba(34, 34, 34, 0.60)",
                                backdropFilter: "blur(50px)",
                                backgroundImage: "none",
                                boxShadow:
                                    "0px 0px 1.5px 0px color(display-p3 1 1 1 / 0.25) inset",
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
                        main: "#979797",
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
                        lineHeight: "1.5rem",
                        fontSize: "1.5rem",
                        fontVariationSettings: `'wght' 700`,
                        margin: "0.5rem 0",
                        color: prefersDarkMode ? "#E8E8E8CC" : "#4B4B4B",
                    },
                    h4: {
                        lineHeight: "1.3rem",
                        fontSize: "1.2rem",
                        fontVariationSettings: `'wght' 600`,
                        margin: "0.2rem 0",
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
                        fontSize: "0.9rem",
                        fontVariationSettings: `'wght' 500`,
                        lineHeight: "1.2rem",
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
