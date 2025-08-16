import React from "react";

const Archives = () => {
    return (
        <div className={"p-10 max-sm:mb-32"}>
            <div
                className={
                    "flex sm:justify-center items-center w-full h-48 sm:h-96"
                }
            >
                <h1
                    className={
                        "w-2/3 bg-blend-color-dodge text-white/75 sm:text-8xl text-4xl sm:text-center font-light"
                    }
                >
                    StuyActivities
                    <br />
                    Archives
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

export default Archives;
