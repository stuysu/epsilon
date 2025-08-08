import { Box, Typography } from "@mui/material";
import LoginButton from "./LoginButton";
import React, { useContext } from "react";
import UserContext from "../context/UserContext";

type Props = {
    page?: string;
    children: React.JSX.Element | React.JSX.Element[];
    sx?: object;
};
const LoginGate = ({ page, children, sx }: Props): React.JSX.Element => {
    const user: UserContextType = useContext(UserContext);

    if (!page) page = "access this page";
    if (user.signed_in) return <Box sx={sx}>{children}</Box>;
    return (
        <Box
            sx={{
                width: "100%",
                height: "70vh",
                paddingX: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <i className="bx bx-lock bx-lg text-blue-500 mb-5"></i>
            <Typography align="center" variant="h1" marginBottom={5}>
                Sign in to Epsilon to {page}.
            </Typography>
            <LoginButton />
        </Box>
    );
};

export default LoginGate;
