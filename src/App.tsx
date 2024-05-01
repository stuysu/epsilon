import "./App.css";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./comps/context/ThemeProvider";
import UserProvider from "./comps/context/UserProvider";
import Pages from "./pages";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CssBaseline } from "@mui/material";

import { SnackbarProvider } from "notistack";

const App = () => {
    return (
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
    );
};

export default App;
