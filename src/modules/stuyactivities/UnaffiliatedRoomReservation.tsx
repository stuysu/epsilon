import React from "react";
import { PUBLIC_URL } from "../../config/constants";

const UnaffiliatedRoomReservation = () => {
    return (
        <div className={"p-10 max-sm:mb-32"}>
            <div
                className={
                    "flex sm:justify-center items-center w-full h-48 sm:h-96"
                }
            >
                <img
                    src={`${PUBLIC_URL}/decorations/unaffiliated.png`}
                    className="w-44 mr-3 animate-pulse"
                    alt=""
                />

                <h1
                    className={
                        "max-w-3xl mr-6 bg-blend-color-dodge text-white/75 sm:text-8xl text-4xl sm:text-left italic"
                    }
                >
                    Unaffiliated
                    <br />
                    Room Reservation
                </h1>
            </div>
            <div className={"flex flex-col sm:items-center w-full h-32 mb-96"}>
                <a
                    className={"underline mt-10"}
                    href={
                        "https://docs.google.com/spreadsheets/d/1TyFnEPhY3gM-yRJKYDJkQSfHC6OsvC5ftkkoahjVcCU/edit?gid=485693778#gid=485693778"
                    }
                >
                    <i className={"bx bx-box mr-1 relative top-0.5"}></i>SY
                    2023-2024
                </a>
            </div>
        </div>
    );
};

export default UnaffiliatedRoomReservation;
