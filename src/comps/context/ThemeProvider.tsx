import React from "react";

import {
    createTheme,
    ThemeProvider as Provider,
    useMediaQuery,
} from "@mui/material";

const ThemeContext = React.createContext({
    toggleColorMode: () => {},
    colorMode: false,
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    // dark mode detection/toggles/context may become obsolete in a new version of MUI with the <CssVarsProvider> component
    // using a home-made solution for now since it's still marked experimental
    const browserPreference = useMediaQuery("(prefers-color-scheme: dark)");
    const [storedPreference, setStoredPreference] = React.useState(
        window.localStorage.getItem("mode"),
    );

    const prefersDarkMode =
        storedPreference !== null
            ? storedPreference === "dark"
            : browserPreference;
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
                                wordWrap: "break-word"
                            }
                        }
                    }
                },
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                    primary: {
                        main: "#34c5db",
                        contrastText: "#fff",
                    },
                    secondary: {
                        main: "#e74c3c",
                        contrastText: "#fff",
                    },
                    background: {
                        default: prefersDarkMode ? "#071a24" : "#ebf5f2",
                        paper: prefersDarkMode ? "#071a24" : "#ebf5f2",
                    },
                },
                typography: {
                    fontFamily: `'Roboto Condensed', sans-serif`,
                    htmlFontSize: 16,
                    h1: {
                        fontSize: "3rem",
                        fontWeight: 700,
                        margin: "0.5rem 0",
                    },
                    h2: {
                        fontSize: "2.6rem",
                        fontWeight: 700,
                        margin: "0.5rem 0",
                    },
                    h3: {
                        fontSize: "2.2rem",
                        fontWeight: 500,
                        margin: "0.5rem 0",
                    },
                    h4: {
                        fontSize: "1.8rem",
                        fontWeight: 500,
                        margin: "0.5rem 0",
                    },
                    h5: {
                        fontSize: "1.4rem",
                        fontWeight: 400,
                        margin: "0.5rem 0",
                    },
                    h6: {
                        fontSize: "1rem",
                        fontWeight: 400,
                        margin: "0.5rem 0",
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
