import { motion } from "framer-motion";
import { ReactNode, RefObject } from "react";

type ItemListProps = {
    height: number | "auto";
    contentRef?: RefObject<HTMLDivElement>;
    title?: ReactNode;
    icon?: string;
    children: ReactNode;
};

export default function ItemList({
    height,
    contentRef,
    title,
    icon = "bx-link",
    children,
}: ItemListProps) {
    return (
        <motion.div
            animate={{ height }}
            initial={false}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-layer-1 p-1 rounded-xl mb-2.5 relative shadow-module backdrop-blur-xl">
                <div ref={contentRef}>
                    {title && (
                        <h4 className="m-4">
                            {icon && (
                                <i
                                    className={`${icon} bx relative top-px mr-1`}
                                />
                            )}
                            {title}
                        </h4>
                    )}
                    <div className="flex flex-col overflow-hidden gap-0.5 rounded-lg">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
