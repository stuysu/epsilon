import { Box, Typography } from "@mui/material";
import LoginButton from "./buttons/LoginButton";
import React, { useContext } from "react";
import UserContext from "../../contexts/UserContext";

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
        <div
            className={
                "w-full h-[70vh] px-14 flex flex-col justify-center items-center"
            }
        >
            <i className="bx bx-lock bx-lg text-blue-500 mb-5"></i>
            <Typography align="center" variant="h1" marginBottom={5}>
                Sign in to {page}.
            </Typography>
            <LoginButton />
        </div>
    );
};

export default LoginGate;
