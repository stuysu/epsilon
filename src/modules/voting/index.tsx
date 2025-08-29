import React, { useState } from "react";
import { PUBLIC_URL } from "../../config/constants";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

const Vote = () => {
    const title = "Make Your Voice Heard!";
    const [isImgLoaded, isIsImgLoaded] = useState(false);

    return (
        <div>
            <Helmet>
                <title>Vote Now - Epsilon</title>
                <meta
                    name="description"
                    content="Vote in student government elections and other important school decisions with Epsilon."
                />
            </Helmet>
            <div className={"relative z-20 bg-bg -mb-20"}>
                <img
                    alt=""
                    src={`${PUBLIC_URL}/textures/voting.png`}
                    className="w-full drop-shadow-2xl relative z-10"
                    onLoad={() => isIsImgLoaded(true)}
                    style={{ display: isImgLoaded ? "block" : "none" }}
                />
                {isImgLoaded && (
                    <div className={"z-30 flex flex-col justify-center items-center w-full h-full absolute top-0 left-0"}>
                        <div className="relative bottom-12 w-full flex justify-center">
                            <div className="relative max-w-xl sm:w-2/3 w-full">
                                {/* glow */}
                                <h1
                                    aria-hidden="true"
                                    className="max-sm:pt-4 max-lg:mt-14 md:text-8xl text-4xl text-center max-sm:leading-9 font-light absolute top-0 left-0 w-full pointer-events-none select-none z-0"
                                >
                                    {title.split(" ").map((word, i) => (
                                        <span
                                            key={`glow-${i}`}
                                            className="inline-block lg:mx-2 mx-1 bg-gradient-to-b shadow-blue text-transparent from-purple-500 to-red bg-clip-text opacity-70 blur-lg scale-[1.04] will-change-transform"
                                        >
                                            {word}
                                        </span>
                                    ))}
                                </h1>

                                <h1 className="max-sm:pt-4 max-lg:mt-14 md:text-8xl text-4xl text-center max-sm:leading-9 font-light relative z-10">
                                    {title.split(" ").map((word, i) => (
                                        <motion.span
                                            key={i}
                                            className="inline-block lg:mx-2 mx-1 bg-gradient-to-b shadow-blue text-transparent from-purple-500 to-red bg-clip-text opacity-100"
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
                                                delay: i * 0.1 + 1,
                                                ease: [0, 0, 0, 1],
                                            }}
                                        >
                                            {word}
                                        </motion.span>
                                    ))}
                                </h1>
                            </div>
                        </div>
                        <p className={"text-white/70 mx-3 text-center"}>We're working on integrating voting services into Epsilon. For now, visit</p>
                        <a href={"https://vote.stuysu.org"} className={"important mt-3"} target={"_blank"}><i className={"bx bx-link-external relative top-0.5 mr-1"}></i>vote.stuysu.org</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vote;
