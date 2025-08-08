import React from "react";
import { Typography } from "@mui/material";
import AsyncButton from "../comps/ui/AsyncButton";
import { PUBLIC_URL } from "../constants";

const ConfirmJoin = () => {
    return (
        <div
            className={
                "w-full flex-col flex justify-center items-center h-[70vh]"
            }
        >
            <img
                src={`${PUBLIC_URL}/achievements/five.png`}
                alt="Confirm Join"
                className="w-64"
            ></img>
            <Typography variant="body1" align="center" mb={2}>
                You have been invited to join
            </Typography>
            <Typography variant="h1" align="center" mb={5} mx={3} maxWidth={"500px"}>
                Stuyvesant Placeholder Association
            </Typography>
            <AsyncButton>Join Now</AsyncButton>
        </div>
    );
};

export default ConfirmJoin;
