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
                Congratulations, Name!
            </Typography>
            <Typography variant="h1" align="center" mb={5} maxWidth={"500px"}>
                You have been invited to join Stuyvesant Placeholder Association
            </Typography>
            <AsyncButton>Join Now</AsyncButton>
        </div>
    );
};

export default ConfirmJoin;
