import React, { useState } from "react";
import dayjs from "dayjs";

import MeetingPreview from "../../../../components/ui/overlays/MeetingPreview";
import InteractiveChip from "../../../../components/ui/input/InteractiveChip";
import { Avatar } from "radix-ui";

type Props = {
    id?: number;
    title?: string;
    description?: string;
    url?: string;
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
    onDelete?: () => void;
    activityInformationOverDetails?: boolean;
};

const OrgMeeting = ({
    id,
    title,
    description,
    start_time,
    end_time,
    url,
    is_public,
    room_name,
    advisor,
    org_name,
    org_picture,
    onlyUpcoming,
    onEdit,
    onDelete,
    activityInformationOverDetails = false,
}: Props) => {
    const [open, setOpen] = useState(false);

    const startDate = dayjs(start_time).format("MM/DD");
    const startTime = dayjs(start_time).format("H:mm");
    const endTime = dayjs(end_time).format("H:mm");
    const today = dayjs().startOf("day");

    if (onlyUpcoming && today.isAfter(dayjs(start_time))) {
        return <></>;
    }

    return (
        <div className="w-full cursor-pointer">
            <div
                className="group flex justify-between items-center bg-layer-2 transition-colors sm:hover:bg-layer-3 p-4"
                onClick={() => setOpen(true)}
            >
                <div className="w-full flex justify-between items-center relative max-sm:flex-col">
                    <div className="w-full pt-1">
                        <div className="flex gap-2 items-center">
                            {activityInformationOverDetails && (
                                <Avatar.Root>
                                    <Avatar.Image
                                        className="min-w-10 h-10 rounded-md object-cover"
                                        src={org_picture}
                                        alt={org_name}
                                    />
                                    <Avatar.Fallback
                                        className="w-10 h-10 rounded-md important text-center size-full flex items-center justify-center bg-layer-3 text-xl relative text-typography-2"
                                        delayMs={600}
                                    >
                                        {(org_name || "O")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Avatar.Fallback>
                                </Avatar.Root>
                            )}

                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <h4>
                                        {title}
                                        {advisor?.trim() && (
                                            <i className="bx bx-user-check text-yellow top-px relative left-1" />
                                        )}
                                    </h4>

                                    {!is_public && (
                                        <p className="important text-white/80 bg-blue rounded-sm px-1 ml-2 bottom-px relative">
                                            Private
                                        </p>
                                    )}
                                </div>

                                <p className={"line-clamp-1 max-w-[30ch]"}>
                                    {activityInformationOverDetails
                                        ? org_name || "Unknown Club"
                                        : description?.trim()
                                          ? description
                                          : "No Description"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`pointer-events-none flex gap-2 w-fit justify-end opacity-100 ${onEdit || onDelete ? "group-hover:opacity-0" : ""} max-sm:mt-3 max-sm:flex-col max-sm:w-full`}
                    >
                        {" "}
                        <InteractiveChip
                            title={
                                room_name && !room_name.includes("Virtual")
                                    ? `Room ${room_name}`
                                    : "Virtual"
                            }
                            selectable={false}
                            flat
                        />
                        <InteractiveChip
                            title={startDate}
                            selectable={false}
                            flat
                            icon="calendar-week"
                        />
                        <InteractiveChip
                            title={`${startTime} to ${endTime}`}
                            selectable={false}
                            flat
                            icon="time"
                        />
                    </div>

                    {(onEdit || onDelete) && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 absolute right-0">
                            {onEdit && (
                                <InteractiveChip
                                    title="Edit"
                                    selectable={false}
                                    flat
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                />
                            )}
                            {onDelete && (
                                <InteractiveChip
                                    title="Delete"
                                    selectable={false}
                                    flat
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <MeetingPreview
                id={id}
                url={url}
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
