import { useState } from "react";
import { toNewYork } from "../../../../utils/NewYorkTime";

import MeetingPreview from "../../../../components/ui/overlays/MeetingPreview";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import ToggleChip from "../../../../components/ui/input/ToggleChip";

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
    isMobile?: boolean;
    onlyUpcoming?: boolean;
    onEdit?: () => void;
    onDelete?: (silentDelete: boolean) => void;
};

const OrgMeeting = ({
    id,
    title,
    description,
    start_time,
    end_time,
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
    let startTime = toNewYork(start_time).format("L LT");
    let endTime = toNewYork(end_time).format("LT");
    let today = toNewYork().startOf("day");

    if (onlyUpcoming && today.isAfter(toNewYork(start_time))) {
        return <></>;
    }

    return (
        <div className={"w-full"}>
            <div className="flex items-center bg-layer-2 transition-colors sm:hover:bg-layer-3">
                <div
                    className="flex-1 min-w-0 flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <div className={"w-full flex justify-between items-center"}>
                        <div className="w-full pt-1">
                            <h4>{title}</h4>
                            <p>
                                {startTime} to {endTime}
                            </p>
                            <p>{advisor?.trim() ? `Advisor: ${advisor}` : ""}</p>
                        </div>
                        <div className=" pointer-events-none flex gap-2 w-fit justify-end">
                            <ToggleChip
                                title={
                                    room_name && !room_name.includes("Virtual")
                                        ? `Room ${room_name}`
                                        : "Virtual"
                                }
                                selectable={false}
                            ></ToggleChip>
                            {is_public ? (
                                <ToggleChip
                                    title={"Public"}
                                    selectable={false}
                                ></ToggleChip>
                            ) : (
                                <ToggleChip
                                    title={"Private"}
                                    selectable={false}
                                ></ToggleChip>
                            )}
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 shrink-0 pr-4">
                    {onEdit && (
                        <AsyncButton
                            variant="contained"
                            onClick={onEdit}
                        >
                            Edit
                        </AsyncButton>
                    )}
                    {onDelete &&
                        (confirmingDelete ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-1">
                                    silent? (deletes either way)
                                </span>
                                <AsyncButton
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                        setConfirmingDelete(false);
                                        onDelete(true);
                                    }}
                                    sx={{ minWidth: 0, px: 1.5 }}
                                >
                                    yes
                                </AsyncButton>
                                <AsyncButton
                                    variant="contained"
                                    color="error"
                                    onClick={() => {
                                        setConfirmingDelete(false);
                                        onDelete(false);
                                    }}
                                    sx={{ minWidth: 0, px: 1.5 }}
                                >
                                    no
                                </AsyncButton>
                            </div>
                        ) : (
                            <AsyncButton
                                variant="contained"
                                onClick={() => setConfirmingDelete(true)}
                            >
                                Delete
                            </AsyncButton>
                        ))}
                </div>
            </div>
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
