import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import AsyncButton from "../buttons/AsyncButton";
import Divider from "../Divider";
import React from "react";

export default function UserDialog({
    title,
    description,
    open,
    onClose,
    onCancel,
    onConfirm,
    children,
    confirmText = "Confirm",
    cancelText = "Cancel",
}: {
    title: string;
    description?: string;
    open: boolean;
    onClose: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
    children?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
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

                            <Dialog.Content asChild>
                                <motion.div
                                    className="relative w-[min(480px,92vw)] rounded-2xl bg-layer-1 p-6 shadow-2xl border border-divider"
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                        scale: 0.95,
                                        filter: "blur(20px)",
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        filter: "blur(0px)",
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: 20,
                                        scale: 0.5,
                                        filter: "blur(20px)",
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 160,
                                        damping: 18,
                                        mass: 0.6,
                                    }}
                                >
                                    {title && (
                                        <Dialog.Title>
                                            <h3 className={"mb-6"}>{title}</h3>
                                        </Dialog.Title>
                                    )}

                                    {description && (
                                        <Dialog.Description>
                                            <p>{description}</p>
                                        </Dialog.Description>
                                    )}

                                    {children && (
                                        <div className="mt-4">{children}</div>
                                    )}

                                    <Divider className="my-5" />

                                    <div className="flex justify-end gap-3">
                                        <AsyncButton
                                            onClick={() => {
                                                onClose();
                                                onCancel?.();
                                            }}
                                        >
                                            {cancelText}
                                        </AsyncButton>
                                        <AsyncButton
                                            onClick={() => {
                                                onClose();
                                                onConfirm?.();
                                            }}
                                            autoFocus
                                        >
                                            {confirmText}
                                        </AsyncButton>
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </div>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
