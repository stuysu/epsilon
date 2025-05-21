import { Typography } from "@mui/material";
import React from "react";

const Archives = () => {
    return (
        <div
            className={
                "w-full h-full flex justify-center items-center flex-col"
            }
        >
            <Typography
                variant="h1"
                color="textSecondary"
                marginTop={"40px"}
                marginBottom={3}
            >
                Archives
            </Typography>
            <a
                className={"underline"}
                href={
                    "https://docs.google.com/spreadsheets/d/1TyFnEPhY3gM-yRJKYDJkQSfHC6OsvC5ftkkoahjVcCU/edit?gid=485693778#gid=485693778"
                }
            >
                StuyActivities Archive [2023-2024]
            </a>
        </div>
    );
};

export default Archives;
