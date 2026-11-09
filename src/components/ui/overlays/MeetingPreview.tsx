import * as Dialog from "@radix-ui/react-dialog";
import { toNewYork } from "../../../utils/NewYorkTime";
import { daysOfWeek, monthNames } from "../../../utils/TimeStrings";
import Divider from "../Divider";
import {
    MeetingChip,
    RoomChip,
} from "../../../modules/stuyactivities/orgs/components/MeetingChips";
import { Avatar } from "radix-ui";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DisplayLinks from "../../DisplayLinks";
import keepOpenOnToast from "./keepOpenOnToast";
import { sizedPicture } from "../../../utils/sizedPicture";

type Props = {
    id?: number;
    url?: string;
    title?: string;
    open: boolean;
    isPublic?: boolean;
    description?: string;
    startTime?: string;
    endTime?: string;
    organizationPicture?: string;
    organizationName?: string;
    roomName?: string;
    advisor?: string;
    onClose: () => void;
};

const MeetingPreview = ({
    url,
    title,
    open,
    isPublic,
    description,
    startTime,
    endTime,
    organizationPicture,
    organizationName,
    roomName,
    advisor,
    onClose,
}: Props) => {
    const start = toNewYork(startTime);
    const end = toNewYork(endTime);
    const openerRef = React.useRef<HTMLElement | null>(null);

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
                                onInteractOutside={keepOpenOnToast}
                                onOpenAutoFocus={() => {
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
                                    className="relative w-[min(720px,92vw)] rounded-2xl bg-layer-1 p-0 shadow-2xl border border-divider"
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
                                    <div className="relative pt-3 px-6 flex items-center justify-between">
                                        <Dialog.Title className="flex gap-3">
                                            <Avatar.Root className="size-8 shrink-0 block rounded-md overflow-hidden">
                                                <Avatar.Image
                                                    className="size-full object-cover"
                                                    src={sizedPicture(
                                                        organizationPicture,
                                                        32,
                                                    )}
                                                    alt={organizationName}
                                                />
                                                <Avatar.Fallback
                                                    className="text-center size-full flex items-center justify-center bg-layer-3 text-xl relative pt-1 text-typography-2"
                                                    delayMs={600}
                                                >
                                                    {(organizationName || "O")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </Avatar.Fallback>
                                            </Avatar.Root>
                                            {url ? (
                                                <a
                                                    href={`/${url}`}
                                                    className="no-underline cursor-alias transition-opacity sm:hover:opacity-75"
                                                >
                                                    <h3 className="text-typography-1">
                                                        {organizationName ||
                                                            "Untitled Organization"}
                                                    </h3>
                                                </a>
                                            ) : (
                                                <span className="no-underline">
                                                    <h3 className="text-typography-1">
                                                        {organizationName ||
                                                            "Untitled Organization"}
                                                    </h3>
                                                </span>
                                            )}
                                        </Dialog.Title>

                                        <Dialog.Close
                                            aria-label="Close"
                                            onClick={onClose}
                                            className="touch-target rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                                        >
                                            <i className="bx bx-x bx-md text-typography-2 mt-1 sm:hover:opacity-75" />
                                        </Dialog.Close>
                                    </div>

                                    <Divider />

                                    <div className="px-6 py-2">
                                        <h1>{title || "Untitled Meeting"}</h1>

                                        <div className="flex flex-wrap gap-1.5">
                                            <MeetingChip
                                                icon="bx-calendar"
                                                iconClass="text-blue"
                                                label={`${daysOfWeek[start.day()]}, ${monthNames[start.month()]} ${start.date()}, ${start.year()}`}
                                            />
                                            <MeetingChip
                                                icon="bx-time-five"
                                                iconClass="text-yellow"
                                                label={`${start.format("h:mm")} – ${end.format("h:mm A")}`}
                                            />
                                            <RoomChip roomName={roomName} />
                                            <MeetingChip
                                                icon={
                                                    isPublic
                                                        ? "bx-globe"
                                                        : "bx-lock"
                                                }
                                                iconClass="text-typography-2"
                                                label={
                                                    isPublic
                                                        ? "Public Meeting"
                                                        : "Private Meeting"
                                                }
                                            />
                                            {advisor?.trim() ? (
                                                <MeetingChip
                                                    icon="bx-user"
                                                    iconClass="text-typography-2"
                                                    label={`Advisor: ${advisor}`}
                                                />
                                            ) : null}
                                        </div>

                                        <div className="mt-7 pb-10 max-h-[15lh] overflow-y-scroll">
                                            <div className="rounded-2xl right-0 bg-gradient-to-t from-bg to-transparent w-full h-12 bottom-0 absolute" />
                                            <DisplayLinks
                                                text={
                                                    description ||
                                                    "No Description"
                                                }
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </div>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
};

export default MeetingPreview;
