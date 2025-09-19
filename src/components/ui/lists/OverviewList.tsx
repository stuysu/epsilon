import { motion } from "framer-motion";
import React, { ReactNode } from "react";

type OverviewListProps = {
    height: number | "auto";
    title: ReactNode;
    glow: string;
    children: ReactNode;
};

export default function OverviewList({
    height,
    title,
    glow,
    children,
}: OverviewListProps) {
    return (
        <motion.div
            animate={{ height }}
            initial={false}
            transition={{ duration: 0.3 }}
            className={"w-full"}
        >
            <div className="bg-layer-1 p-1 rounded-xl relative shadow-prominent">
                <div
                    aria-hidden
                    className={`absolute inset-0 rounded-xl pointer-events-none opacity-10 ${glow} blur-2xl`}
                />
                <div
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                        width: "25vw",
                        height: "1px",
                        position: "absolute",
                        top: "0px",
                        opacity: 0.3,
                        zIndex: 40,
                    }}
                ></div>
                <div
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
                        width: "20vw",
                        height: "1px",
                        position: "absolute",
                        bottom: "0px",
                        right: "105px",
                        opacity: 0.5,
                        zIndex: 35,
                    }}
                ></div>
                <h3 className="m-4 mb-5">{title}</h3>
                <div className="flex flex-col overflow-hidden gap-0.5 rounded-lg">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
