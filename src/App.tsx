import "./styles/app.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeProvider";
import UserProvider from "./contexts/UserProvider";
import AlertDisplay from "./components/ui/AlertDisplay";
import TimezoneNotice from "./components/ui/TimezoneNotice";
import Pages from "./modules";
import { SnackbarProvider, MaterialDesignContent } from "notistack";
import { Scrollbars } from "react-custom-scrollbars-2";
import { OrgListProvider } from "./contexts/OrgListContext";
import React, { CSSProperties, forwardRef, useEffect, useState } from "react";

const snackbarStyle: CSSProperties = {
    borderRadius: "10px",
    fontSize: "14px",
    fontVariationSettings: "'wght' 700",
    padding: "7px 15px",
    boxShadow:
        "0 4px 4px 0 var(--shadow-base), 0 0 1px 0 var(--shadow-antithesis) inset, 0 1px 3px 0 var(--shadow-decoration) inset",
};

const SnackbarOverride = forwardRef<HTMLDivElement, any>((props, ref) => (
    <MaterialDesignContent ref={ref} {...props} style={snackbarStyle} />
));

const App = () => {
    const [autoHeightMax, setAutoHeightMax] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setAutoHeightMax(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const renderThumb = ({
        style,
        ...props
    }: {
        style: CSSProperties;
        [key: string]: any;
    }) => {
        const thumbStyle: CSSProperties = {
            backgroundColor: "grey",
            borderRadius: "4px",
        };
        return <div style={{ ...style, ...thumbStyle }} {...props} />;
    };

    return (
        <Scrollbars
            universal
            autoHeight
            autoHeightMin={100}
            autoHeightMax={autoHeightMax}
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
            renderThumbVertical={renderThumb} // Apply the custom thumb component here
        >
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
                        <UserProvider>
                            <OrgListProvider>
                                <Pages />
                            </OrgListProvider>
                        </UserProvider>
                    </BrowserRouter>
                </SnackbarProvider>
            </ThemeProvider>
        </Scrollbars>
    );
};

export default App;
