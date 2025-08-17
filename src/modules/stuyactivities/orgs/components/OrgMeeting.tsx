import { useState } from "react";
import dayjs from "dayjs";

import MeetingPreview from "../../../../components/ui/orgs/MeetingPreview";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import ToggleChip from "../../../../components/ui/ToggleChip";

type Props = {
    id?: number;
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    is_public?: boolean;
    room_name?: string;
    org_name?: string;
    org_picture?: string;
    isMobile?: boolean;
    onlyUpcoming?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
};

const OrgMeeting = ({
    id,
    title,
    description,
    start_time,
    end_time,
    is_public,
    room_name,
    org_name,
    org_picture,
    onlyUpcoming,
    onEdit,
    onDelete,
}: Props) => {
    const [open, setOpen] = useState(false);
    let startTime = dayjs(start_time).format("L LT");
    let endTime = dayjs(end_time).format("LT");
    let today = dayjs().startOf("day");

    if (onlyUpcoming && today.isAfter(dayjs(start_time))) {
        return <></>;
    }

    return (
        <div className={"w-full"}>
            <div
                className="
    flex
    justify-between
    items-center
    bg-layer-2
    transition-colors
    hover:bg-layer-3
    p-4
  "
                onClick={() => setOpen(true)}
            >
                <div className="w-full pt-1">
                    <h4>{title}</h4>
                    <p>
                        {startTime} to {endTime}
                    </p>
                </div>
                <div className="flex gap-2 w-fit justify-end">
                    <ToggleChip
                        title={"Room " + room_name || "Virtual"}
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
                <div className="flex">
                    {onEdit && (
                        <AsyncButton
                            variant="contained"
                            onClick={onEdit}
                            sx={{ marginLeft: "10px" }}
                        >
                            Edit
                        </AsyncButton>
                    )}
                    {onDelete && (
                        <AsyncButton
                            variant="contained"
                            onClick={onDelete}
                            sx={{ marginLeft: "10px" }}
                        >
                            Delete
                        </AsyncButton>
                    )}
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
                onClose={() => setOpen(false)}
            />
        </div>
    );
};

export default OrgMeeting;
