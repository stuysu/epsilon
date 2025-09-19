import { motion } from "framer-motion";
import React, { ReactNode, RefObject } from "react";

type ItemListProps = {
    height: number | "auto";
    contentRef?: RefObject<HTMLDivElement>;
    title?: ReactNode;
    subtitle?: ReactNode;
    icon?: string;
    children: ReactNode;
};

export default function ItemList({
    height,
    contentRef,
    title,
    subtitle,
    icon = "bx-link",
    children,
}: ItemListProps) {
    return (
        <motion.div
            animate={{ height }}
            initial={false}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-layer-1 p-1 rounded-xl mb-2.5 relative shadow-prominent backdrop-blur-xl">
                <div ref={contentRef}>
                    {(title || subtitle) && (
                        <div className="m-4">
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

                            {title && (
                                <h4 className="flex items-center">
                                    {icon && (
                                        <i className={`${icon} bx mr-2`} />
                                    )}
                                    {title}
                                </h4>
                            )}
                            {subtitle && (
                                <p className="text-sm text-text-secondary mt-4">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex flex-col overflow-hidden gap-0.5 rounded-lg">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
