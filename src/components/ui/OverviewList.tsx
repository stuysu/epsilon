import { motion } from "framer-motion";
import { ReactNode } from "react";

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
            <div className="bg-layer-1 p-1 rounded-xl relative shadow-module">
                <div
                    aria-hidden
                    className={`absolute inset-0 rounded-xl pointer-events-none opacity-5 ${glow} blur-2xl`}
                />
                <h3 className="m-4">{title}</h3>
                <div className="flex flex-col overflow-hidden gap-0.5 rounded-lg">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
