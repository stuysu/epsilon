import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import React from "react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const entryVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
        scale: 0.98,
        filter: "blur(10px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.6,
            ease: [0.33, 1, 0.68, 1],
        },
    },
};

const UnauthorizedAccount = () => {
    const navigate = useNavigate();

    const tryAgain = async () => {
        await supabase.auth.signOut();
        navigate("/", { replace: true });
    };

    return (
        <main className="flex min-h-dvh items-center justify-center">
            <motion.section
                className="flex flex-col items-center text-center max-w-xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h1>
                    <motion.i
                        className="bx bx-lg bx-lock text-yellow"
                        variants={entryVariants}
                    />
                </h1>
                <motion.h3 className={"m-6"} variants={entryVariants}>
                    We couldn’t authorize your account.
                </motion.h3>
                <div>
                    <motion.p variants={entryVariants}>
                        Epsilon is only available to currently enrolled
                        Stuyvesant students and active staff. Incoming freshmen
                        cannot access Epsilon at this time.
                        <br />
                        <br />
                        Current students should sign in with their @stuy.edu
                        account. If you’re a student or staff member and believe
                        this is an error, please{" "}
                        <Link to="/activities-support">visit support</Link>.
                    </motion.p>
                </div>
                <motion.button variants={entryVariants}>
                    <p
                        onClick={tryAgain}
                        className="m-8 text-typography-2 underline"
                    >
                        Try Again
                    </p>
                </motion.button>
            </motion.section>
        </main>
    );
};

export default UnauthorizedAccount;
