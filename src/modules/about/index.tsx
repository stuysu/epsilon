import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { PUBLIC_URL } from "../../config/constants";
import { Helmet } from "react-helmet";
import { AnimatePresence, motion } from "framer-motion";

const DISPLAY = 13000;
const FADE = 3000;

const fadeVariants = {
    initial: { opacity: 0, filter: "blur(20px)" },
    animate: {
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: FADE / 1000, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        filter: "blur(20px)",
        transition: { duration: FADE / 1000, ease: [0.22, 1, 0.36, 1] },
    },
};

const Credit = ({
    title,
    children,
}: {
    title: string;
    children?: ReactNode;
}) => {
    return (
        <div className={"max-w-3xl w-full mt-16"}>
            <div className={"relative flex flex-col items-center pb-12"}>
                <div
                    className={"bg-[#000000] relative z-10 w-fit p-3 uppercase"}
                >
                    <p
                        style={{
                            fontFamily: `'neue-haas-grotesk-display', sans-serif`,
                        }}
                    >
                        {title}
                    </p>
                </div>

                <motion.div
                    className="z-0 relative bottom-6 w-full h-px bg-neutral-800"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "center" }}
                />
            </div>
            <div className={"mt-3 flex flex-col items-center gap-5"}>
                {children}
            </div>
        </div>
    );
};

const MemberGroup = ({ role, names }: { role: string; names: string[] }) => {
    return (
        <div className={"flex sm:flex-row gap-5 items-start mb-3 flex-col"}>
            <p
                style={{
                    fontFamily: `'neue-haas-grotesk-display', sans-serif`,
                }}
                className={
                    "text-white/50 w-80 sm:text-right text-center uppercase relative top-2 mb-3"
                }
            >
                {role}
            </p>
            <div
                className={"flex flex-col w-80 text-center sm:text-left mt-1.5"}
            >
                {names.map((name, index) => (
                    <h2 className={"-mt-3 text-white/75 relative top-0.5"}>
                        {name}
                    </h2>
                ))}
            </div>
        </div>
    );
};

type CreditData = {
    title: string;
    groups: { role: string; names: string[] }[];
};

function renderCredit(data: CreditData) {
    return (
        <Credit title={data.title}>
            {data.groups.map((g, i) => (
                <MemberGroup key={i} role={g.role} names={g.names} />
            ))}
        </Credit>
    );
}

const Index = () => {
    const [stage, setStage] = useState<
        "idle" | "video" | "tagline" | "credit" | "idle"
    >("idle");
    const [creditIdx, setCreditIdx] = useState(0);
    const [hasVideoEnded, setHasVideoEnded] = useState(false);
    const [runId, setRunId] = useState(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(`${PUBLIC_URL}/media/about_music.wav`);
        audioRef.current.preload = "auto";
        audioRef.current.volume = 1;
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const credits: CreditData[] = useMemo(
        () => [
            {
                title: "the original epsilon team, 2024-2025",
                groups: [
                    {
                        role: "design engineer",
                        names: ["Will Zhang"],
                    },
                    {
                        role: "programming",
                        names: ["David Chen", "Rahul Deb", "Randy Sim"],
                    },
                    { role: "management", names: ["Nathaniel Moy"] },
                ],
            },
            {
                title: "SU I.T. department, 2023-2024",
                groups: [
                    { role: "directors", names: ["Randy Sim", "David Chen"] },
                    {
                        role: "programming",
                        names: [
                            "Tony Chen",
                            "Rahul Deb",
                            "Richard Wan",
                            "Adam Choi",
                        ],
                    },
                ],
            },
            {
                title: "SU I.T. department, 2022-2023",
                groups: [
                    { role: "directors", names: ["Ben Pan", "Frank Wong"] },
                    {
                        role: "assistant director",
                        names: ["William Vongphanith"],
                    },
                    { role: "Programming", names: ["David Chen", "Randy Sim"] },
                ],
            },
            {
                title: "THE STUYACTIVITIES 2.0 TEAM, 2020-2021",
                groups: [
                    {
                        role: "STUDENT UNION PRESIDENT",
                        names: ["Julian Giordano"],
                    },
                    {
                        role: "STUDENT UNION VICE PRESIDENT",
                        names: ["Shivali Korgaonkar"],
                    },
                    {
                        role: "STUDENT UNION executives",
                        names: [
                            "Aaron Wang",
                            "Theo Kubovy-Weiss",
                            "Neve Diaz-Carr",
                        ],
                    },
                    {
                        role: "Programming",
                        names: ["Abir Taheer", "Victor Veytsman", "Ethan Shan"],
                    },
                ],
            },
            {
                title: "THE ORIGINAL STUYACTIVITIES TEAM, 2018-2019",
                groups: [
                    {
                        role: "STUDENT UNION PRESIDENT",
                        names: ["William Wang"],
                    },
                    {
                        role: "STUDENT UNION VICE PRESIDENT",
                        names: ["Vishwaa Sofat"],
                    },
                    {
                        role: "STUDENT UNION executives",
                        names: [
                            "Elizabeth Avakov",
                            "Gordon Ebanks",
                            "Joshua Weiner, SLT",
                        ],
                    },
                    {
                        role: "Programming",
                        names: [
                            "Gilvir Gill",
                            "Ivan Galakhov",
                            "Alwin Peng",
                            "Jesse Hall",
                            "Abir Taheer",
                        ],
                    },
                ],
            },
        ],
        [],
    );

    useEffect(() => {
        if (stage !== "tagline") return;
        const t = setTimeout(() => {
            setStage("credit");
            setCreditIdx(0);
        }, DISPLAY);
        return () => clearTimeout(t);
    }, [stage]);

    useEffect(() => {
        if (stage !== "credit") return;
        const t = setTimeout(() => {
            if (creditIdx < credits.length - 1) setCreditIdx((i) => i + 1);
            else finishRun();
        }, DISPLAY);
        return () => clearTimeout(t);
    }, [stage, creditIdx, credits.length]);

    useEffect(() => {
        if (!hasVideoEnded) return;
        const t = setTimeout(() => setStage("tagline"), 500);
        return () => clearTimeout(t);
    }, [hasVideoEnded]);

    function finishRun() {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setStage("idle");
    }

    async function handleStart() {
        setCreditIdx(0);
        setHasVideoEnded(false);
        setRunId((n) => n + 1); // force fresh mount so it starts from 0
        setStage("video");

        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
            }
        } catch {}

        try {
            if (videoRef.current) await videoRef.current.play();
        } catch {}
    }

    return (
        <div className="pb-0">
            <Helmet>
                <title>About - Epsilon</title>
                <meta
                    name="description"
                    content="One Site, One School, For Everyone."
                />
            </Helmet>

            <section className="z-30 top-0 fixed h-screen w-screen bg-[#000000] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {stage === "idle" && (
                        <motion.button
                            key={`idle-${runId}`}
                            className="flex flex-col items-center justify-center h-24 w-64 gap-6 focus:outline-none"
                            onClick={handleStart}
                            variants={fadeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            aria-label="Play"
                        >
                            <i className="text-white/50 bx bx-play text-5xl relative left-0.5 transition hover:opacity-50 " />
                            <p>Learn about the makers of Epsilon.</p>
                        </motion.button>
                    )}

                    {stage === "video" && (
                        <motion.div
                            key={`video-${runId}`}
                            className="w-full h-full"
                            variants={fadeVariants}
                            initial={{ opacity: 1, filter: "blur(0px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit="exit"
                        >
                            <video
                                ref={videoRef}
                                className="object-cover w-full h-full"
                                src={`${PUBLIC_URL}/media/about_intro.mp4`}
                                autoPlay
                                muted
                                playsInline
                                controls={false}
                                onEnded={() => setHasVideoEnded(true)}
                                poster="data:image/gif;base64,R0lGODlhAQABAAAAACw="
                            />
                        </motion.div>
                    )}

                    {stage === "tagline" && (
                        <motion.div
                            key={`tagline-${runId}`}
                            className="max-w-2xl w-full"
                            variants={fadeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <img
                                alt="One Site, One School, For Everyone."
                                src={`${PUBLIC_URL}/taglines/about.png`}
                                className="w-full object-contain mx-auto mb-6"
                            />
                            <p className={"text-center"}>
                                Epsilon is a project carried through each
                                generation of Stuyvesant students. It's based on
                                the philosophy that "we honor those who walked
                                so we could run, and we run so our children
                                soar."
                            </p>
                        </motion.div>
                    )}

                    {stage === "credit" && (
                        <motion.div
                            key={`credit-${runId}-${creditIdx}`}
                            className="w-full max-w-4xl"
                            variants={fadeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <div className="flex items-center justify-center">
                                <div className="max-w-2xl">
                                    {renderCredit(credits[creditIdx])}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

export default Index;
