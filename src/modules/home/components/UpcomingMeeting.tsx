import React, { useState } from "react";
import MeetingPreview from "../../../components/ui/overlays/MeetingPreview";
import dayjs from "dayjs";
import ToggleChip from "../../../components/ui/input/ToggleChip";
import { monthNames } from "../../../utils/TimeStrings";
import { Avatar } from "radix-ui";

const UpcomingMeeting = ({
    id,
    title,
    url,
    description,
    start_time,
    end_time,
    org_name,
    org_picture,
    room_name,
    is_public,
    advisor,
}: {
    id: number;
    url: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    org_name: string;
    org_picture: string;
    room_name?: string;
    is_public: boolean;
    advisor: string;
    sx?: object;
}) => {
    const [open, setOpen] = useState(false);

    let start = dayjs(start_time);

    return (
        <div className={"w-full cursor-pointer"}>
            <div
                className="overflow-scroll scrollbar-none flex max-lg:flex-col max-lg:items-start gap-2 justify-between items-center bg-layer-2 transition-colors sm:hover:bg-layer-3 p-4"
                onClick={() => setOpen(true)}
            >
                <div className="relative flex gap-3">
                    <div
                        className={[
                            "min-w-10 w-10 h-10 rounded-md overflow-hidden relative",
                            !is_public
                                ? "[mask:radial-gradient(circle_0.8rem_at_2.4rem_2.3rem,transparent_98%,#000_100%)] [-webkit-mask:radial-gradient(circle_0.8rem_at_2.4rem_2.3rem,transparent_98%,#000_100%)]"
                                : "",
                        ].join(" ")}
                    >
                        <Avatar.Root className="size-full">
                            <Avatar.Image
                                className="size-full object-cover"
                                src={org_picture}
                                alt={org_name}
                            />
                            <Avatar.Fallback
                                className="text-center size-full flex items-center justify-center bg-layer-3 text-xl relative pt-1 text-typography-2"
                                delayMs={600}
                            >
                                {(org_name || "O").charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar.Root>
                    </div>

                    {!is_public && (
                        <i className="bx bx-lock absolute z-10 -bottom-0.5 left-7 text-base leading-none text-typography-1" />
                    )}

                    <div className="w-full pt-1">
                        <h4>{title}</h4>
                        <p>{org_name}</p>
                    </div>
                </div>

                <div className="flex gap-2 w-fit justify-end pointer-events-none">
                    <ToggleChip
                        title={room_name || "Virtual"}
                        selectable={false}
                    ></ToggleChip>
                    <ToggleChip
                        title={start.format("LT")}
                        selectable={false}
                    ></ToggleChip>
                    <ToggleChip
                        title={`${monthNames[start.month()].slice(0, 3)} ${start.date()}`}
                        selectable={false}
                    ></ToggleChip>
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
                advisor={advisor}
                roomName={room_name}
                onClose={() => setOpen(false)}
            />
        </div>
    );
};

export default UpcomingMeeting;
