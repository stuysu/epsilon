import { useNavigate } from "react-router-dom";
import pressable from "../../../../../utils/pressable";
import { MeetingChip, RoomChip } from "../../components/MeetingChips";
import { toNewYork } from "../../../../../utils/NewYorkTime";

const MeetingAttendanceCard = ({
    title,
    id,
    room,
    startTime,
    clickable,
}: {
    title: string;
    id: number;
    room?: string;
    startTime: string;
    clickable: boolean;
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (clickable) {
            navigate(`${id}`);
        }
    };

    return (
        <div
            className={
                "transition-colors bg-layer-1 w-full mb-6 p-6 rounded-xl shadow-control cursor-pointer sm:hover:bg-layer-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
            }
            {...(clickable ? pressable(handleClick, { role: "link" }) : {})}
        >
            <h3 className={"mb-3"}>{title}</h3>
            <div className={"flex flex-wrap gap-1.5"}>
                <MeetingChip
                    icon="bx-calendar"
                    iconClass="text-blue"
                    label={toNewYork(startTime).format("M/D")}
                />
                <MeetingChip
                    icon="bx-time-five"
                    iconClass="text-yellow"
                    label={toNewYork(startTime).format("h:mm A")}
                />
                <RoomChip roomName={room} />
            </div>
        </div>
    );
};

export default MeetingAttendanceCard;
