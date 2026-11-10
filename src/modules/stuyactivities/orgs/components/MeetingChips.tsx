import { toNewYork } from "../../../../utils/NewYorkTime";

export const MeetingChip = ({
    icon,
    iconClass = "",
    label,
    fullLabel,
}: {
    icon?: string;
    iconClass?: string;
    label: string;
    fullLabel?: string;
}) => (
    <span
        title={fullLabel}
        className={
            "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-layer-3 px-2.5 text-sm font-semibold text-typography-1 shadow-control"
        }
    >
        {icon && (
            <i
                aria-hidden="true"
                className={`bx ${icon} text-base leading-none ${iconClass}`}
            />
        )}
        {fullLabel ? (
            <>
                <span aria-hidden="true">{label}</span>
                <span className="sr-only">{fullLabel}</span>
            </>
        ) : (
            label
        )}
    </span>
);

export const meetingTimeLabel = (start: string, end: string) => {
    const s = toNewYork(start);
    const e = toNewYork(end);
    if (s.format("HH:mm") === "00:00" && e.diff(s, "hour") >= 23)
        return "All Day";
    return `${s.format("h:mm")} – ${e.format("h:mm A")}`;
};

export const roomLabel = (roomName?: string) =>
    roomName && !/virtual/i.test(roomName) ? roomName : "Virtual";

export const RoomChip = ({ roomName }: { roomName?: string }) => {
    const label = roomLabel(roomName);
    return (
        <MeetingChip
            icon={label === "Virtual" ? "bx-video" : "bx-door-open"}
            iconClass="text-typography-2"
            label={label}
        />
    );
};

const MeetingChips = ({
    start_time,
    end_time,
    room_name,
    align = "end",
    endFrom = "sm",
}: {
    start_time: string;
    end_time: string;
    room_name?: string;
    align?: "start" | "end";
    endFrom?: "sm" | "lg";
}) => {
    const room = <RoomChip roomName={room_name} />;
    const when = (
        <div className={"flex items-center gap-1.5"}>
            <MeetingChip
                icon="bx-calendar"
                iconClass="text-blue"
                label={toNewYork(start_time).format("M/D")}
            />
            <MeetingChip
                icon="bx-time-five"
                iconClass="text-yellow"
                label={meetingTimeLabel(start_time, end_time)}
            />
        </div>
    );

    /* under a title: date, time, then room. at the end of a row (from
       endFrom up) the room leads and wrap-reverse keeps date and time on top */
    const wide =
        align === "start"
            ? { row: "", room: "" }
            : endFrom === "lg"
              ? {
                    row: "lg:flex-wrap-reverse lg:justify-end",
                    room: "lg:order-first",
                }
              : {
                    row: "sm:flex-wrap-reverse sm:justify-end",
                    room: "sm:order-first",
                };
    return (
        <div className={`flex flex-wrap items-center gap-1.5 ${wide.row}`}>
            {when}
            <div className={`flex ${wide.room}`}>{room}</div>
        </div>
    );
};

export default MeetingChips;
