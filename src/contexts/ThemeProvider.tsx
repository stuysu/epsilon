import React from "react";
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material";

export type ThemeMode = "light" | "dark" | "system" | "dark-hc" | "orange";

export const ThemeContext = React.createContext<{
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  effectiveMode: "light" | "dark";
}>({
  mode: "system",
  setMode: () => {},
  effectiveMode: "light",
});

const STORAGE_KEY = "mode";

function getInitialMode(): ThemeMode {
    if (typeof window === "undefined") return "dark";
    const raw = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return raw === "light" || raw === "dark" || raw === "system" || raw === "dark-hc" || raw === "orange"
        ? raw
        : "dark";
}

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const applyDOMTheme = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
    root.style.colorScheme = getSystemMode();
  } else {
    // lock variables by forcing data-theme
    root.setAttribute("data-theme", mode);
    root.style.colorScheme = mode;
  }
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = React.useState<ThemeMode>(getInitialMode);

  React.useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyDOMTheme("system");
    mq.addEventListener?.("change", handler);
    applyDOMTheme("system");
    return () => mq.removeEventListener?.("change", handler);
  }, [mode]);

  // persist user choice and apply to DOM whenever mode changes
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
    applyDOMTheme(mode);
  }, [mode]);

  // resolve an effective mode for lingering MUI usage
    const effectiveMode =
        mode === "system"
            ? getSystemMode()
            : mode === "dark-hc"
                ? "dark"
                : mode === "orange"
                    ? "light"
                    : mode;

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: { mode: effectiveMode },
        typography: {
          fontFamily: "inter-variable, system-ui, sans-serif",
          htmlFontSize: 16,
        },
      }),
    [effectiveMode]
  );

  const ctxValue = React.useMemo(
    () => ({ mode, setMode, effectiveMode }),
    [mode, effectiveMode]
  );

  return (
    <ThemeContext.Provider value={ctxValue}>
      <MUIThemeProvider theme={muiTheme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeProvider };
