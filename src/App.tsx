import React, { useState, useEffect } from "react";
import "./App.css";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./comps/context/ThemeProvider";
import UserProvider from "./comps/context/UserProvider";
import Pages from "./pages";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CssBaseline } from "@mui/material";

import { SnackbarProvider } from "notistack";
import { Scrollbars } from 'react-custom-scrollbars-2';

const App = () => {
    const [autoHeightMax, setAutoHeightMax] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setAutoHeightMax(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Scrollbars 
        universal
        autoHeight
        autoHeightMin={100}
        autoHeightMax={autoHeightMax}
         autoHide
        // Hide delay in ms
        autoHideTimeout={1000}
        // Duration for hide animation in ms.
        autoHideDuration={200}
        >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider>
                <CssBaseline />
                <SnackbarProvider maxSnack={4} autoHideDuration={3000}>
                    <BrowserRouter>
                        <UserProvider>
                            <Pages />
                        </UserProvider>
                    </BrowserRouter>
                </SnackbarProvider>
            </ThemeProvider>
        </LocalizationProvider>
        </Scrollbars>
    );
};

export default App;