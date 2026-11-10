import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

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

const UnauthorizedAccount = ({ email }: { email?: string }) => {
    const tryAgain = async () => {
        await supabase.auth.signOut();
        window.location.replace("/");
    };

    return (
        <main className="flex min-h-dvh items-center justify-center px-6">
            <motion.section
                className="flex max-w-xl flex-col items-center text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.i
                    aria-hidden="true"
                    className="bx bx-lg bx-lock text-yellow"
                    variants={entryVariants}
                />
                <motion.h1 className="as-h3 m-6" variants={entryVariants}>
                    We couldn’t authorize your account.
                </motion.h1>
                <motion.p variants={entryVariants}>
                    Epsilon is only available to currently enrolled Stuyvesant
                    students and active staff. Incoming freshmen cannot access
                    Epsilon at this time.
                </motion.p>
                <motion.p className="mt-4" variants={entryVariants}>
                    Current students should sign in with their @stuy.edu
                    account. If you’re a student or staff member and believe
                    this is an error, please{" "}
                    <Link to="/activities-support">visit support</Link>.
                </motion.p>
                {email && (
                    <motion.p
                        className="mt-4 text-typography-3"
                        variants={entryVariants}
                    >
                        Signed in as {email}
                    </motion.p>
                )}
                <motion.button
                    type="button"
                    onClick={tryAgain}
                    className="m-8 min-h-11 px-2 py-2 text-[0.9rem] text-typography-2 underline"
                    variants={entryVariants}
                >
                    Use a Different Account
                </motion.button>
            </motion.section>
        </main>
    );
};

export default UnauthorizedAccount;
