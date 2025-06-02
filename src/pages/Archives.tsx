import React from "react";

const Archives = () => {
    return (
        <div>
            <div
                className={
                    "flex justify-center flex-col items-center w-full pt-32"
                }
            >
                <h1
                    className={
                        "w-2/3 bg-blend-color-dodge text-white/75 sm:text-8xl text-4xl text-center"
                    }
                >
                    StuyActivities
                    <br />
                    Archives
                </h1>
            </div>
            <div
                className={
                    "flex justify-center flex-col items-center w-full h-32 mb-96"
                }
            >
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
