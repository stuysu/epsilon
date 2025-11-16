import React, { CSSProperties, useEffect, useState } from "react";
import "./styles/app.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeProvider";
import UserProvider from "./contexts/UserProvider";
import AlertDisplay from "./components/ui/AlertDisplay";
import Pages from "./modules";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CssBaseline, styled } from "@mui/material";
import { SnackbarProvider, MaterialDesignContent } from "notistack";
import { Scrollbars } from "react-custom-scrollbars-2";
import { OrgListProvider } from "./contexts/OrgListContext";

const SnackbarOverride = styled(MaterialDesignContent)(() => ({
    borderRadius: "10px",
    fontSize: "14px",
    fontVariationSettings: "'wght' 700",
    padding: "7px 15px",
    boxShadow:
        "0 4px 4px 0 var(--shadow-base), 0 0 1px 0 var(--shadow-antithesis) inset, 0 1px 3px 0 var(--shadow-decoration) inset",
}));

const App = () => {
    const [autoHeightMax, setAutoHeightMax] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setAutoHeightMax(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        // Cleanup function to remove the event listener
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Custom thumb component with type annotations
    const renderThumb = ({
        style,
        ...props
    }: {
        style: CSSProperties;
        [key: string]: any;
    }) => {
        const thumbStyle: CSSProperties = {
            backgroundColor: "grey",
            borderRadius: "4px", // Adjust this value as needed to match your design
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ThemeProvider>
                    <CssBaseline />
                    <AlertDisplay />
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
            </LocalizationProvider>
        </Scrollbars>
    );
};

export default App;
