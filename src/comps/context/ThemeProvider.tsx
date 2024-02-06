import React from "react";

import { createTheme, ThemeProvider as Provider, useMediaQuery } from "@mui/material";

const ThemeContext = React.createContext({
	toggleColorMode: () => {},
	colorMode: false
});

const ThemeProvider = ({ children } : { children: React.ReactNode }) => {
	// dark mode detection/toggles/context may become obsolete in a new version of MUI with the <CssVarsProvider> component
	// using a home-made solution for now since it's still marked experimental
	const browserPreference = useMediaQuery("(prefers-color-scheme: dark)");
	const [storedPreference, setStoredPreference] = React.useState(window.localStorage.getItem("mode"));

	const prefersDarkMode = storedPreference !== null ? storedPreference === "dark" : browserPreference;
	const toggle = React.useMemo(
		() => () =>
			setStoredPreference(() => {
				const output = prefersDarkMode ? "light" : "dark";
				window.localStorage.setItem("mode", output); // persist in localStorage
				return output;
			}),
		[prefersDarkMode]
	);

	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? "dark" : "light",
					primary: {
						main: "#e66767",
						contrastText: "#fff"
					},
					secondary: {
						main: "#546de5",
						contrastText: "#fff"
					},
					button: {
						main: prefersDarkMode ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
					},
					background: {
						default: prefersDarkMode ? "#262630" : "#FFFFFF",
						paper: prefersDarkMode ? "#262630" : "#FFFFFF"
					},
					transparency: prefersDarkMode
						? {
								background: "rgba(255, 255, 255, 0.08)",
								border: "rgba(255, 255, 255, 0.1)",
								borderDarker: "rgba(255, 255, 255, 0.24)",
								text: "rgba(255, 255, 255, 0.8)",
								textLighter: "rgba(255, 255, 255, 0.4)"
						  }
						: {
								background: "rgba(0, 0, 0, 0.08)",
								border: "rgba(0, 0, 0, 0.1)",
								borderDarker: "rgba(0, 0, 0, 0.24)",
								text: "rgba(0, 0, 0, 0.8)",
								textLighter: "rgba(0,0,0,0.4)"
						  }
				},
				typography: {
					fontFamily: `'Roboto Condensed', sans-serif`,
					htmlFontSize: 16,
					h1: {
						fontSize: "3rem",
						fontWeight: 700,
						margin: "0.5rem 0"
					},
					h2: {
						fontSize: "2.6rem",
						fontWeight: 700,
						margin: "0.5rem 0"
					},
					h3: {
						fontSize: "2.2rem",
						fontWeight: 500,
						margin: "0.5rem 0"
					},
					h4: {
						fontSize: "1.8rem",
						fontWeight: 500,
						margin: "0.5rem 0"
					},
					h5: {
						fontSize: "1.4rem",
						fontWeight: 400,
						margin: "0.5rem 0"
					},
					h6: {
						fontSize: "1rem",
						fontWeight: 400,
						margin: "0.5rem 0"
					}
				},
				components: {
					MuiPaper: {
						styleOverrides: {
							root: {
								backgroundImage: "unset",
								boxShadow: prefersDarkMode
									? "0px 2px 1px -1px rgba(255,255,255,0.2),0px 1px 1px 0px rgba(255,255,255,0.14),0px 1px 3px 0px rgba(255,255,255,0.12)"
									: "" // change from {} to match types
							}
						}
					},
					MuiTab: {
						styleOverrides: { root: { minWidth: "160px" } }
					}
				},
				// restores legacy breakpoint values
				breakpoints: {
					values: {
						xs: 0,
						sm: 600,
						md: 960,
						lg: 1280,
						xl: 1920
					}
				}
			}),
		[prefersDarkMode]
	);

	const value = { toggleColorMode: toggle, colorMode: prefersDarkMode };
	return (
		<ThemeContext.Provider value={value}>
			<Provider theme={theme}>{children}</Provider>
		</ThemeContext.Provider>
	);
};

export { ThemeProvider, ThemeContext };