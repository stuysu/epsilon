import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import AsyncButton from "../buttons/AsyncButton";
import React, { useRef } from "react";

export default function UserDialog({
    title,
    description,
    open,
    onClose,
    onCancel,
    onConfirm,
    extraText,
    onExtra,
    children,
    confirmText = "Confirm",
    cancelText = "Cancel",
    imageSrc,
}: {
    title: string;
    description?: string;
    open: boolean;
    onClose: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
    extraText?: string;
    onExtra?: () => void;
    children?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    imageSrc?: string;
}) {
    const hasImage = Boolean(imageSrc);
    const openerRef = useRef<HTMLElement | null>(null);
    const wasOpen = useRef(false);
    // there is no Dialog.Trigger, so remember what opened the dialog. This runs
    // while rendering because the Confirm button's autoFocus moves focus before
    // any effect or Radix callback would see the opener.
    if (open && !wasOpen.current) {
        openerRef.current = document.activeElement as HTMLElement | null;
    }
    wasOpen.current = open;

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <AnimatePresence
                mode="wait"
                // the dialog stays mounted while it animates out, so focus goes
                // back to its opener once that finishes
                onExitComplete={() => {
                    if (openerRef.current?.isConnected)
                        openerRef.current.focus();
                    openerRef.current = null;
                }}
            >
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
                                // focus is handed back in onExitComplete instead
                                onCloseAutoFocus={(event) =>
                                    event.preventDefault()
                                }
                            >
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
                                    {hasImage && (
                                        <>
                                            <img
                                                alt=""
                                                src={imageSrc}
                                                className={
                                                    "absolute w-32 -left-2 -top-14"
                                                }
                                            />
                                            <div className={"h-10"}></div>
                                        </>
                                    )}

                                    {title && (
                                        <Dialog.Title>
                                            <h3 className={"mb-6"}>{title}</h3>
                                        </Dialog.Title>
                                    )}

                                    {description && (
                                        <Dialog.Description>
                                            <p className="whitespace-pre-line">
                                                {description}
                                            </p>
                                        </Dialog.Description>
                                    )}

                                    {children && (
                                        <div className="mt-4">{children}</div>
                                    )}

                                    <div className="h-12" />

                                    <div className="flex justify-end gap-3">
                                        <AsyncButton
                                            onClick={() => {
                                                onClose();
                                                onCancel?.();
                                            }}
                                        >
                                            {cancelText}
                                        </AsyncButton>
                                        {extraText && (
                                            <AsyncButton
                                                onClick={() => {
                                                    onClose();
                                                    onExtra?.();
                                                }}
                                            >
                                                {extraText}
                                            </AsyncButton>
                                        )}
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
