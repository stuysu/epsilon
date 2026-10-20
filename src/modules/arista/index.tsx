import { motion } from "framer-motion";
import React, { useContext } from "react";
import { PUBLIC_URL } from "../../config/constants";
import { ThemeContext } from "../../contexts/ThemeProvider";
import { Helmet } from "react-helmet";

const Arista = () => {
    const theme = useContext(ThemeContext);

    return (
        <section className={"min-h-screen p-12 mx-auto max-w-[1800px]"}>
            <Helmet>
                <title>Arista - Epsilon</title>
                <meta
                    name="description"
                    content="Join Arista, Stuyvesant High School’s premier honor society."
                />
            </Helmet>

            <div className={"flex flex-col items-start justify-start gap-10"}>
                <motion.div
                    className={"w-full"}
                    initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.98,
                        filter: "blur(10px)",
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                    }}
                    transition={{
                        duration: 1,
                        ease: [0.33, 1, 0.68, 1],
                        delay: 0.5,
                    }}
                >
                    <div className={"relative"}>
                        <img
                            className={
                                "absolute inset-0 w-full h-full aspect-[3/2] object-cover sm:aspect-[2/1] md:aspect-auto rounded-2xl opacity-30 blur-3xl scale-105 pointer-events-none"
                            }
                            src={`${PUBLIC_URL}/media/arista-open-house-fall-2026.jpg`}
                            alt=""
                            aria-hidden="true"
                        />
                        <img
                            className={
                                "relative w-full h-auto aspect-[3/2] object-cover sm:aspect-[2/1] md:aspect-auto rounded-2xl shadow-prominent"
                            }
                            src={`${PUBLIC_URL}/media/arista-open-house-fall-2026.jpg`}
                            width={2600}
                            height={763}
                            alt="Arista members at the Fall 2026 Open House"
                        ></img>
                    </div>
                    <p className={"mt-3 opacity-65"}>
                        Fall 2026 Open House · Photo by Anders Zernike
                    </p>
                </motion.div>

                <div
                    className={
                        "grid grid-cols-1 gap-5 w-full md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-12 lg:gap-16"
                    }
                >
                    <motion.div
                        className={"relative"}
                        initial={{
                            opacity: 0,
                            y: 10,
                            scale: 0.98,
                            filter: "blur(10px)",
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)",
                        }}
                        transition={{
                            duration: 1,
                            ease: [0.33, 1, 0.68, 1],
                            delay: 0.8,
                        }}
                    >
                        <img
                            src={`${PUBLIC_URL}/taglines/arista.svg`}
                            className={`w-80 md:w-56 lg:w-72 xl:w-80 2xl:w-[26rem] h-auto ${
                                theme.effectiveMode === "light" ? "invert" : ""
                            }`}
                            alt="Arista is Stuyvesant High School’s premier honor society."
                        />
                        <img
                            src={`${PUBLIC_URL}/taglines/arista.svg`}
                            className={`w-80 md:w-56 lg:w-72 xl:w-80 2xl:w-[26rem] h-auto top-0 absolute blur-2xl ${
                                theme.effectiveMode === "light" ? "invert" : ""
                            }`}
                            alt=""
                            aria-hidden="true"
                        />
                    </motion.div>
                    <motion.div
                        className={"max-w-xl xl:max-w-2xl 2xl:max-w-3xl"}
                        initial={{
                            opacity: 0,
                            y: 10,
                            scale: 0.98,
                            filter: "blur(10px)",
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)",
                        }}
                        transition={{
                            duration: 1,
                            ease: [0.33, 1, 0.68, 1],
                            delay: 1.1,
                        }}
                    >
                        <p className={"xl:text-lg 2xl:text-xl"}>
                            I’ve learned, over time, to enjoy helping others and
                            to find a sense of pride and fulfillment in doing
                            so. I hope you, too, will develop this muscle in the
                            years to come. Our responsibilities can often feel
                            onerous, burdensome, and tiresome. We may not want
                            to do them, and there are always other things we
                            could be doing with our time. But in that moment
                            when we help someone—when we know we’ve made someone
                            else’s day just a little bit easier—that’s a
                            beautiful feeling. With every act of service you
                            perform, I hope you take a moment afterward to
                            reflect, even briefly, on how good it feels to help
                            someone else.
                        </p>
                        <br />
                        <p className={"opacity-65 xl:text-lg 2xl:text-xl"}>
                            Eric Ferencz, Faculty Advisor (2023–2025)
                        </p>
                        <a
                            href={"https://stuyarista.org/"}
                            target={"_blank"}
                            rel={"noopener noreferrer"}
                            className={
                                "group mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-[13px] bg-layer-1 px-8 py-4 text-lg font-bold text-typography-1 no-underline shadow-control transition-colors sm:hover:bg-layer-2 xl:text-xl"
                            }
                        >
                            Visit Arista Now
                            <i
                                className={
                                    "bx bx-right-arrow-alt text-2xl text-beige transition-transform sm:group-hover:translate-x-1"
                                }
                            ></i>
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Arista;
