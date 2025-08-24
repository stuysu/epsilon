import { Box } from "@mui/material";
import LoginButton from "../buttons/LoginButton";
import React, { useContext } from "react";
import UserContext from "../../../contexts/UserContext";

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
            <i className="bx bx-lock bx-lg text-blue mb-5"></i>
            <h1 className={"text-center mb-5"}>Sign in to {page}.</h1>
            <LoginButton />
        </div>
    );
};

export default LoginGate;
