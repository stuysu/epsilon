import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import { toNewYork } from "../../../../utils/NewYorkTime";

import MeetingPreview from "../../../../components/ui/overlays/MeetingPreview";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import SwitchField from "../../../../components/ui/input/SwitchField";
import pressable from "../../../../utils/pressable";
import MeetingChips from "./MeetingChips";

const menuItem =
    "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-typography-1 outline-0 data-[disabled]:opacity-50 data-[highlighted]:bg-layer-3";

type Props = {
    id?: number;
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    is_public?: boolean;
    room_name?: string;
    advisor?: string;
    org_name?: string;
    org_picture?: string;
    onlyUpcoming?: boolean;
    onEdit?: () => void;
    onDelete?: (silentDelete: boolean) => void | Promise<unknown>;
};

const OrgMeeting = ({
    id,
    title,
    description,
    start_time = "",
    end_time = "",
    is_public,
    room_name,
    advisor,
    org_name,
    org_picture,
    onlyUpcoming,
    onEdit,
    onDelete,
}: Props) => {
    const [open, setOpen] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [notifyOnDelete, setNotifyOnDelete] = useState(true);
    const startTime = toNewYork(start_time).format("L LT");
    const today = toNewYork().startOf("day");
    const hasActions = !!(onEdit || onDelete);

    if (onlyUpcoming && today.isAfter(toNewYork(start_time))) {
        return <></>;
    }

    const deleteMeeting = async (silentDelete: boolean) => {
        setDeleting(true);
        try {
            await onDelete?.(silentDelete);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={"group relative w-full"}>
            <div
                className={`flex cursor-pointer flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-layer-2 py-3 pl-4 ${hasActions ? "pr-14 [@media(hover:hover)]:pr-4" : "pr-4"} transition-colors sm:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1`}
                aria-haspopup="dialog"
                {...pressable(() => setOpen(true))}
            >
                <div className={"min-w-0 flex-1 basis-56"}>
                    <h4 className={"break-words"}>
                        {title}
                        {!is_public && (
                            <i
                                aria-label="Private"
                                className={
                                    "bx bx-lock ml-1.5 align-[-1px] text-sm text-typography-2"
                                }
                            />
                        )}
                    </h4>
                </div>
                <div
                    className={`pointer-events-none transition-opacity sm:ml-auto ${
                        hasActions
                            ? "[@media(hover:hover)]:group-hover:opacity-0 [@media(hover:hover)]:group-has-[[data-actions]:focus-within]:opacity-0"
                            : ""
                    }`}
                >
                    <MeetingChips
                        start_time={start_time}
                        end_time={end_time}
                        room_name={room_name}
                    />
                </div>
            </div>
            {hasActions && (
                <>
                    {/* the card keeps focus after its preview closes, so the
                        chips only hide for focus on these buttons */}
                    <div
                        data-actions
                        className={
                            "absolute inset-y-0 right-0 hidden items-center gap-2 pr-4 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:hover)]:flex"
                        }
                    >
                        {onEdit && (
                            <AsyncButton
                                onClick={onEdit}
                                aria-label={`Edit ${title}`}
                                className={"!px-4 !pb-[8px] !pt-[7px]"}
                            >
                                Edit
                            </AsyncButton>
                        )}
                        {onDelete && (
                            <AsyncButton
                                disabled={deleting}
                                onClick={() => setConfirmingDelete(true)}
                                aria-label={`Delete ${title}`}
                                color="error"
                                className={"!px-4 !pb-[8px] !pt-[7px]"}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </AsyncButton>
                        )}
                    </div>
                    <DropdownMenu.Root modal={false}>
                        <DropdownMenu.Trigger
                            aria-label={`Actions for ${title}`}
                            className={
                                "absolute right-1.5 top-1.5 flex size-11 items-center justify-center rounded-lg text-typography-2 outline-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1 data-[state=open]:bg-layer-3 [@media(hover:hover)]:hidden"
                            }
                        >
                            <i
                                aria-hidden="true"
                                className={
                                    "bx bx-dots-horizontal-rounded text-2xl"
                                }
                            />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={4}
                                className={
                                    "z-50 min-w-40 overflow-hidden rounded-xl border border-divider bg-bg p-1 shadow-2xl"
                                }
                            >
                                {onEdit && (
                                    <DropdownMenu.Item
                                        onSelect={onEdit}
                                        className={menuItem}
                                    >
                                        <i
                                            aria-hidden="true"
                                            className={"bx bx-edit"}
                                        />
                                        Edit
                                    </DropdownMenu.Item>
                                )}
                                {onDelete && (
                                    <DropdownMenu.Item
                                        disabled={deleting}
                                        onSelect={() =>
                                            setConfirmingDelete(true)
                                        }
                                        className={`${menuItem} !text-red`}
                                    >
                                        <i
                                            aria-hidden="true"
                                            className={"bx bx-trash"}
                                        />
                                        {deleting ? "Deleting..." : "Delete"}
                                    </DropdownMenu.Item>
                                )}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </>
            )}
            <UserDialog
                title="Delete meeting?"
                description={`"${title}" at ${startTime} will be deleted. Deleting is irreversible and attendance will be removed.`}
                open={confirmingDelete}
                onClose={() => {
                    setConfirmingDelete(false);
                    setNotifyOnDelete(true);
                }}
                onConfirm={() => deleteMeeting(!notifyOnDelete)}
                confirmText="Delete"
                footerStart={
                    <SwitchField
                        checked={notifyOnDelete}
                        onChange={setNotifyOnDelete}
                        label="Notify members"
                        className="!mr-0"
                    />
                }
            />
            <MeetingPreview
                id={id}
                title={title}
                open={open}
                isPublic={is_public}
                description={description}
                startTime={start_time}
                endTime={end_time}
                organizationPicture={org_picture}
                organizationName={org_name}
                roomName={room_name}
                advisor={advisor}
                onClose={() => setOpen(false)}
            />
        </div>
    );
};

export default OrgMeeting;
