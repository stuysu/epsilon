import React from "react";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import { PUBLIC_URL } from "../../config/constants";

const ConfirmJoin = () => {
    return (
        <div
            className={
                "w-full flex-col flex justify-center items-center h-[70vh] p-3"
            }
        >
            <img
                src={`${PUBLIC_URL}/achievements/placeholder.png`}
                alt="Confirm Join"
                className="w-64"
            ></img>
            <p>You have been invited to join</p>
            <h1 className="mb-10 text-center">
                Stuyvesant Placeholder Association
            </h1>
            <AsyncButton>Join Now</AsyncButton>
        </div>
    );
};

export default ConfirmJoin;
