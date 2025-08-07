import { Typography } from "@mui/material";
import React, { useState } from "react";
import { PUBLIC_URL } from "../constants";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Charter = () => {
    const navigate = useNavigate();
    const title = "Apply for a StuyActivities Charter";
    const [isImgLoaded, isIsImgLoaded] = useState(false);

    return (
        <div>
            <div className={"relative lg:bottom-32"}>
                <img
                    src={`${PUBLIC_URL}/textures/charter.png`}
                    className="w-full"
                    onLoad={() => isIsImgLoaded(true)}
                    style={{ display: isImgLoaded ? "block" : "none" }}
                />
                {isImgLoaded && (
                    <>
                <div
                    className={
                        "flex justify-center items-center w-full h-full absolute top-0 left-0"
                    }
                >
                    <h1 className="max-lg:mt-14 w-5/6 sm:w-2/3 relative bottom-12 text-white/75 md:text-8xl text-4xl text-center max-w-4xl max-sm:leading-9">
                        {title.split(" ").map((word, i) => (
                            <motion.span
                                key={i}
                                className="inline-block lg:mx-2 mx-1"
                                initial={{
                                    opacity: 0,
                                    filter: "blur(20px)",
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    filter: "blur(0px)",
                                    y: 0,
                                }}
                                transition={{
                                    duration: 1,
                                    delay: i * 0.1,
                                    ease: [0, 0, 0, 1],
                                }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>
                </div>
                    </>
                )}
            </div>
            <div
                className={
                    "lg:flex-row flex-col flex lg:justify-center items-start w-full h-[32rem] gap-20 xl:px-64 lg:px-16 px-4 relative lg:bottom-72 max-sm:mb-[800px]"
                }
            >
                <div
                    className={
                        "relative p-10 max-lg:h-fit w-full h-full flex flex-col items-start justify-start bg-neutral-900 rounded-2xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)]"
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
                            zIndex: 35,
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
                            zIndex: 35,
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
                            "z-40 relative top-3 sm:top-6 bg-blue-700 p-4 rounded-xl text-white w-full shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)] flex cursor-pointer justify-between items-center"
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
                        "relative p-10 max-lg:h-fit w-full h-full flex flex-col items-start justify-start bg-neutral-900 rounded-2xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)]"
                    }
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "8vw",
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
                            width: "10vw",
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
                <div className={"sm:hidden relative p-20"}></div>
            </div>
        </div>
    );
};

export default Charter;
