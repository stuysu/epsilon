import "./styles/app.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeProvider";
import UserProvider from "./contexts/UserProvider";
import InvitesProvider from "./contexts/InvitesProvider";
import AlertDisplay from "./components/ui/AlertDisplay";
import TimezoneNotice from "./components/ui/TimezoneNotice";
import Pages from "./modules";
import {
    SnackbarProvider,
    MaterialDesignContent,
    type CustomContentProps,
} from "notistack";
import { CSSProperties, forwardRef } from "react";
import ScrollToTopOnNavigate from "./components/ScrollToTopOnNavigate";
import { MotionConfig } from "framer-motion";

const snackbarStyle: CSSProperties = {
    borderRadius: "10px",
    fontSize: "14px",
    fontVariationSettings: "'wght' 700",
    padding: "7px 15px",
    boxShadow:
        "0 4px 4px 0 var(--shadow-base), 0 0 1px 0 var(--shadow-antithesis) inset, 0 1px 3px 0 var(--shadow-decoration) inset",
};

// darker than notistack's, so the white text is at least 4.5:1
const variantBackground: Partial<
    Record<CustomContentProps["variant"], string>
> = {
    success: "#2e7d32",
    warning: "#b45309",
    info: "#1565c0",
};

const SnackbarOverride = forwardRef<HTMLDivElement, CustomContentProps>(
    (props, ref) => (
        <MaterialDesignContent
            ref={ref}
            {...props}
            style={{
                ...snackbarStyle,
                backgroundColor: variantBackground[props.variant],
            }}
        />
    ),
);

const App = () => {
    return (
        // animations of position and size are skipped for reduced motion
        <MotionConfig reducedMotion="user">
            <ThemeProvider>
                <AlertDisplay />
                <TimezoneNotice />
                <SnackbarProvider
                    Components={{
                        default: SnackbarOverride,
                        success: SnackbarOverride,
                        error: SnackbarOverride,
                        warning: SnackbarOverride,
                        info: SnackbarOverride,
                    }}
                    maxSnack={3}
                    autoHideDuration={5000}
                >
                    <BrowserRouter>
                        <ScrollToTopOnNavigate />
                        <UserProvider>
                            <InvitesProvider>
                                <Pages />
                            </InvitesProvider>
                        </UserProvider>
                    </BrowserRouter>
                </SnackbarProvider>
            </ThemeProvider>
        </MotionConfig>
    );
};

export default App;
