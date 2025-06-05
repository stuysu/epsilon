import { useState } from "react";
import { Chip, Typography } from "@mui/material";
import dayjs from "dayjs";
import MeetingPreview from "../../ui/meetings/MeetingPreview";

type Props = {
    meeting: CalendarMeeting;
};

const ScheduleMeeting = ({ meeting }: Props) => {
    const [open, setOpen] = useState(false);
    let startTime = dayjs(meeting.start_time).format("LT");
    let endTime = dayjs(meeting.end_time).format("LT");

    return (
        <>
            <div
                className={
                    "flex-wrap w-full h-fit bg-neutral-700 py-3 px-5 flex flex-row justify-between items-center mb-1 bg-opacity-30 hover:bg-opacity-60 transition-colors cursor-pointer"
                }
                onClick={() => setOpen(true)}
            >
                <div>
                    <Typography variant={"h4"}>
                        {meeting.organizations.name}
                    </Typography>
                    <Typography variant={"body1"}>{meeting.title}</Typography>
                </div>

                <div className={"flex flex-row flex-wrap gap-2"}>
                    <Chip label={`${startTime} to ${endTime}`} />
                    <Chip label={`${meeting.rooms?.name || "Virtual"}`} />
                </div>
            </div>
            <MeetingPreview
                id={meeting.id}
                url={meeting.organizations?.url}
                title={meeting.title}
                open={open}
                isPublic={meeting.is_public}
                description={meeting.description}
                startTime={meeting.start_time}
                endTime={meeting.end_time}
                organizationPicture={meeting.organizations?.picture}
                organizationName={meeting.organizations?.name}
                roomName={meeting.rooms?.name}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export default ScheduleMeeting;
