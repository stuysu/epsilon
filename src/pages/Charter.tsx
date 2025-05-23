import { Typography } from "@mui/material";
import React from "react";
import { PUBLIC_URL } from "../constants";
import { useNavigate } from "react-router-dom";

const Charter = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div className={"relative bottom-32"}>
                <img src={`${PUBLIC_URL}/textures/charter.png`}></img>
                <div
                    className={
                        "flex justify-center items-center w-full h-full absolute top-0 left-0 mix-blend-color-dodge"
                    }
                >
                    <h1
                        className={
                            "w-2/3 relative bottom-12 text-white/75 text-8xl text-center"
                        }
                    >
                        Apply for a<br />
                        StuyActivities Charter
                    </h1>
                </div>
            </div>
            <div
                className={
                    "flex justify-center items-start w-full h-[32rem] gap-20 px-64 relative bottom-72"
                }
            >
                <div
                    className={
                        "relative p-10 w-full h-full flex flex-col items-start justify-start bg-neutral-900 rounded-2xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)]"
                    }
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "10vw",
                            height: "1px",
                            position: "absolute",
                            bottom: "0px",
                            right: "65px",
                            opacity: 0.5,
                            zIndex: 40,
                        }}
                    ></div>
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "20vw",
                            height: "1px",
                            position: "absolute",
                            top: "0px",
                            opacity: 0.75,
                            zIndex: 40,
                        }}
                    ></div>

                    <div className={"relative min-h-28 max-w-72"}>
                        <h1 className={"absolute bottom-32 font-bold text-6xl"}>
                            1
                        </h1>
                        <Typography variant="h1" color="textSecondary">
                            Submit Your Application
                        </Typography>
                    </div>
                    <p>
                        Prior to initiating the chartering process, it is
                        imperative that you thoroughly review the Clubs & Pubs
                        Regulations. These regulations are binding upon all
                        activities and must be adhered to without exception.
                        Once you have ensured that your proposed Activity is
                        fully compliant with these regulations, you may proceed
                        below. It is crucial to note that your charter
                        submission will be publicly accessible; therefore, it is
                        your responsibility to offer comprehensive,
                        well-considered responses. Submissions should be clear,
                        precise, and devoid of any misleading, inappropriate, or
                        erroneous information.
                    </p>

                    <div
                        className={
                            "z-50 relative top-10 bg-blue-700 p-4 rounded-xl text-white w-full shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)] flex cursor-pointer justify-between items-center"
                        }
                        onClick={() => navigate("/create")}
                    >
                        <Typography variant="h2" color="textSecondary">
                            Start Now
                        </Typography>
                        <i className="bx bx-chevron-right bx-md"></i>
                    </div>
                </div>
                <div
                    className={
                        "relative p-10 w-full h-full flex flex-col items-start justify-start bg-neutral-900 rounded-2xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)]"
                    }
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "300px",
                            height: "1px",
                            position: "absolute",
                            bottom: "0px",
                            right: "65px",
                            opacity: 0.5,
                            zIndex: 100,
                        }}
                    ></div>
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "400px",
                            height: "1px",
                            position: "absolute",
                            top: "0px",
                            opacity: 0.75,
                        }}
                    ></div>
                    <div className={"relative min-h-28 max-w-72"}>
                        <Typography variant="h1" color="textSecondary">
                            Get Approved & Listed on Epsilon
                        </Typography>
                        <h1 className={"absolute bottom-32 font-bold text-6xl"}>
                            2
                        </h1>
                    </div>
                    <p>
                        Upon the successful submission of your charter, please
                        be advised that the SU Clubs & Pubs Administration
                        requires a review period of up to two weeks to
                        thoroughly assess your submission. The review process is
                        contingent upon the regulatory compliance of the
                        information provided. Issues found during this review
                        will need to be addressed before your charter can
                        proceed. Assuming all criteria are met, the SU
                        Administration will grant approval for your activity.
                        Once approved, your activity will be listed in the
                        Epsilon StuyActivities Catalog, at which point you may
                        begin the process of enrolling members and scheduling
                        meetings.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Charter;
