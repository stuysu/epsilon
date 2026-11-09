import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef } from "react";
import keepOpenOnToast from "./keepOpenOnToast";

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
    const openerRef = useRef<HTMLElement | null>(null);

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
                                onInteractOutside={keepOpenOnToast}
                                onOpenAutoFocus={() => {
                                    // there is no Dialog.Trigger, so remember what opened the dialog
                                    openerRef.current =
                                        document.activeElement as HTMLElement | null;
                                }}
                                onCloseAutoFocus={(event) => {
                                    event.preventDefault();
                                    if (openerRef.current?.isConnected)
                                        openerRef.current.focus();
                                }}
                            >
                                <motion.div
                                    className="relative flex max-h-[calc(100dvh-1.5rem)] w-[min(600px,calc(100vw-1.5rem))] sm:max-h-[90vh] sm:w-[min(600px,92vw)] flex-col rounded-2xl border border-divider bg-layer-1 shadow-2xl"
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Dialog.Title asChild>
                                        <h3 className="px-4 pb-2 pt-5 sm:px-6 sm:pt-6">
                                            {title}
                                        </h3>
                                    </Dialog.Title>
                                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
                                        {children}
                                    </div>
                                    {actions && (
                                        <div className="flex justify-end gap-3 px-4 pb-4 pt-3 sm:p-6 sm:pt-3">
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
