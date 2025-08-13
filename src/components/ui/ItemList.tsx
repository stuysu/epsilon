import { motion } from "framer-motion";
import { ReactNode, RefObject } from "react";

type ItemListProps = {
    height: number | "auto";
    contentRef?: RefObject<HTMLDivElement>;
    children: ReactNode;
};

export default function ItemList({
    height,
    contentRef,
    children,
}: ItemListProps) {
    return (
        <motion.div
            animate={{ height }}
            initial={false}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-layer-1 p-1 rounded-xl mb-2.5 relative shadow-module">
                <div ref={contentRef}>
                    <div className="flex flex-col overflow-hidden gap-0.5 rounded-lg">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
