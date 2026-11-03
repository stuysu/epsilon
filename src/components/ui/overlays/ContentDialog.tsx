import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

/* A dialog for forms that manage their own actions, unlike UserDialog which closes on confirm. */
export default function ContentDialog({
    title,
    open,
    onClose,
    actions,
    children,
}: {
    title: string;
    open: boolean;
    onClose: () => void;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <AnimatePresence mode="wait">
                {open && (
                    <Dialog.Portal forceMount>
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <Dialog.Overlay asChild>
                                <motion.div
                                    className="absolute inset-0 bg-blurDark backdrop-blur-xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                />
                            </Dialog.Overlay>

                            <Dialog.Content
                                asChild
                                aria-describedby={undefined}
                            >
                                <motion.div
                                    className="relative flex max-h-[90vh] w-[min(600px,92vw)] flex-col rounded-2xl border border-divider bg-layer-1 shadow-2xl"
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Dialog.Title asChild>
                                        <h3 className="px-6 pb-2 pt-6">
                                            {title}
                                        </h3>
                                    </Dialog.Title>
                                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
                                        {children}
                                    </div>
                                    {actions && (
                                        <div className="flex justify-end gap-3 p-6 pt-3">
                                            {actions}
                                        </div>
                                    )}
                                </motion.div>
                            </Dialog.Content>
                        </div>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
