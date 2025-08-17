import { motion } from "framer-motion";
import React from "react";
import { PUBLIC_URL } from "../../config/constants";

const Arista = () => {
    return (
        <section className={"min-h-screen m-12"}>
            <div
                className={
                    "flex sm:flex-row flex-col items-start justify-start gap-10"
                }
            >
                <motion.div
                    className={"w-3/4"}
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
                        duration: 0.4,
                        ease: [0.33, 1, 0.68, 1],
                        delay: 1,
                    }}
                >
                    <img
                        className={"object-fill w-full"}
                        src={`${PUBLIC_URL}/media/arista.png`}
                        alt="Arista"
                    ></img>
                </motion.div>

                <div className={"flex flex-col gap-5 items-start w-full"}>
                    <motion.div
                        className={"max-w-xl"}
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
                            duration: 0.4,
                            ease: [0.33, 1, 0.68, 1],
                            delay: 1.5,
                        }}
                    >
                        <img
                            src={`${PUBLIC_URL}/taglines/arista.svg`}
                            className={"w-80 h-auto"}
                            alt="Arista is Stuyvesant High School’s premier honor society."
                        ></img>
                    </motion.div>
                    <motion.div
                        className={"max-w-xl"}
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
                            duration: 0.4,
                            ease: [0.33, 1, 0.68, 1],
                            delay: 2,
                        }}
                    >
                        <p>
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
                        <p className={"opacity-65"}>
                            Eric Ferencz, Faculty Advisor
                        </p>
                    </motion.div>
                </div>
            </div>
            <a href={"https://stuyarista.org/"} className={"no-underline"}>
                <div
                    className={
                        "flex mt-20 w-full py-3 px-6 border-divider border justify-between hover:bg-typography-1 transition-colors"
                    }
                >
                    <h1
                        className={
                            "mix-blend-difference font-light text-xl sm:text-8xl text-typography-1"
                        }
                    >
                        Visit Arista Now
                    </h1>
                    <i
                        className={
                            "mix-blend-difference relative top-2 bx bx-chevron-right text-xl sm:text-8xl text-typography-1"
                        }
                    ></i>
                </div>
            </a>
        </section>
    );
};

export default Arista;
