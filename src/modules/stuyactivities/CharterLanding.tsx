import React, { useState } from "react";
import { PUBLIC_URL } from "../../config/constants";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Checkbox } from "radix-ui";
import Divider from "../../components/ui/Divider";

const CharterLanding = () => {
    const navigate = useNavigate();
    const title = "Apply for a StuyActivities Charter";
    const [isImgLoaded, isIsImgLoaded] = useState(false);
    const [agreed, setAgreed] = useState(false);

    return (
        <div>
            <Helmet>
                <title>Charter an Activity - Epsilon</title>
                <meta
                    name="description"
                    content="Start your own club, pub, or team at Stuyvesant High School with our onlines application."
                />
            </Helmet>
            <div className={"relative lg:bottom-32 z-20 pointer-events-none"}>
                <img
                    alt=""
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
                            <h1 className="max-lg:mt-14 w-5/6 sm:w-2/3 relative bottom-12 text-white/75 md:text-8xl text-4xl text-center max-w-4xl max-sm:leading-9 font-light">
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
            {isImgLoaded && (
                <>
                    <div
                        className={
                            "lg:flex-row flex-col flex lg:justify-center items-start w-full h-[32rem] gap-20 xl:px-48 lg:px-16 px-4 relative lg:bottom-72 max-sm:mb-[800px]"
                        }
                    >
                        <div
                            className={
                                "relative p-10 max-lg:h-fit w-full h-full flex flex-col items-start justify-start bg-layer-1 rounded-2xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)]"
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
                                <h1
                                    className={
                                        "absolute bottom-32 font-bold text-6xl"
                                    }
                                >
                                    1
                                </h1>
                                <h1>Submit Your Application</h1>
                            </div>
                            <p>
                                Prior to initiating the chartering process, you
                                must review the Clubs & Pubs Regulations. These
                                regulations are binding upon all activities and
                                must be adhered to without exception. Once you
                                have ensured that your proposed Activity is
                                fully compliant with these regulations, you may
                                proceed below. Your charter submission will be
                                publicly accessible. It is your responsibility
                                to offer comprehensive and truthful responses.
                            </p>
                            <div className={"py-3 w-full"}>
                                <Divider />
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox.Root
                                    id="agree-regulations"
                                    checked={agreed}
                                    onCheckedChange={(checked) =>
                                        setAgreed(!!checked)
                                    }
                                    className="h-5 min-w-5 rounded border border-divider bg-transparent flex items-center justify-center"
                                    aria-label="Agree to Clubs & Pubs Regulations"
                                >
                                    <Checkbox.Indicator>
                                        <i className="bx bx-check text-typography-1 text-lg"></i>
                                    </Checkbox.Indicator>
                                </Checkbox.Root>
                                <label
                                    htmlFor="agree-regulations"
                                    className="select-none"
                                >
                                    <p>
                                        I have read and agree to the{" "}
                                        <a href={"/rules"}>
                                            Clubs & Pubs Regulations
                                        </a>
                                        .
                                    </p>
                                </label>
                            </div>
                            <p
                                onClick={() => agreed && navigate("/create")}
                                className={
                                    "text-accent " +
                                    (agreed
                                        ? "cursor-pointer"
                                        : "cursor-not-allowed opacity-50")
                                }
                            >
                                Start Application{" "}
                                <i
                                    className={
                                        "bx bx-chevron-right bx-md relative top-[10px]"
                                    }
                                ></i>
                            </p>
                        </div>
                        <div
                            className={
                                "z-10 relative p-10 max-lg:h-fit w-full h-full flex flex-col items-start justify-start bg-layer-1 rounded-2xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)]"
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
                                <h1>Get Approved & Listed on Epsilon</h1>
                                <h1
                                    className={
                                        "absolute bottom-32 font-bold text-6xl"
                                    }
                                >
                                    2
                                </h1>
                            </div>
                            <p>
                                Upon the successful submission of your charter,
                                please be advised that the SU Clubs & Pubs
                                Administration requires a review period of up to
                                two weeks to thoroughly assess your submission.
                                The review process is contingent upon the
                                regulatory compliance of the information
                                provided. Issues found during this review will
                                need to be addressed before your charter can
                                proceed. Assuming all criteria are met, the SU
                                Administration will grant approval for your
                                Activity. Once approved, your Activity will be
                                listed in the Epsilon StuyActivities Catalog, at
                                which point you may begin the process of
                                enrolling members and scheduling meetings.
                            </p>
                        </div>
                        <div className={"sm:hidden relative p-20"}></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CharterLanding;
