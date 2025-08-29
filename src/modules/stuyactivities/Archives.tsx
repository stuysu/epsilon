import React from "react";
import { Helmet } from "react-helmet";

const Archives = () => {
    return (
        <div className={"p-10 max-sm:mb-32"}>
            <Helmet>
                <title>StuyActivities Archives - Epsilon</title>
                <meta
                    name="description"
                    content="Browse past years' StuyActivities data and records."
                />
            </Helmet>
            <div
                className={
                    "flex sm:justify-center items-center w-full h-48 sm:h-96"
                }
            >
                <h1
                    className={
                        "max-w-3xl bg-blend-color-dodge text-typography-1 sm:text-8xl text-4xl sm:text-center font-light"
                    }
                >
                    StuyActivities
                    <br />
                    Archives
                </h1>
            </div>
            <div className={"flex w-full justify-center"}>
                <div className={"flex flex-col gap-5 w-full h-32 mb-64 max-w-3xl"}>
                    <a
                        href={
                            "https://docs.google.com/spreadsheets/d/1URqnVM9avoD5_oRvBzQXI1ghq4oWRLWMps58cvNCLc0/edit?usp=sharing"
                        }
                        target="_blank"
                        className="transition-colors p-6 from-layer-2 to-layer-1 bg-gradient-to-b rounded-xl flex items-center no-underline gap-4 hover:bg-layer-3 shadow-control"
                    >
                        <i className={"bx bx-box bx-md pt-1"}></i>
                        <div>
                            <h3>2024-2025</h3>
                            <p>Most Recent (421 Activities)</p>
                        </div>
                    </a>
                    <a
                        href={
                            "https://docs.google.com/spreadsheets/d/1TyFnEPhY3gM-yRJKYDJkQSfHC6OsvC5ftkkoahjVcCU/edit?gid=485693778#gid=485693778"
                        }
                        target="_blank"
                        className="transition-colors p-6 from-layer-2 to-layer-1 bg-gradient-to-b rounded-xl flex items-center no-underline gap-4 hover:bg-layer-3 shadow-control"
                    >
                        <i className={"bx bx-box bx-md pt-1 text-typography-2"}></i>
                        <div>
                            <h3>2023-2024</h3>
                            <p>Historical (351 Activities)</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Archives;
