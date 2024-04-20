import "./App.css";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./comps/context/ThemeProvider";
import UserProvider from "./comps/context/UserProvider";
import Pages from "./pages";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CssBaseline } from "@mui/material";

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider>
        <CssBaseline />
        <BrowserRouter>
          <UserProvider>
            <Pages />
          </UserProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
