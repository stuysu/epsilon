import { useNavigate } from "react-router-dom";

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
                "transition-colors bg-layer-1 w-full mb-6 p-6 rounded-xl shadow-control cursor-pointer sm:hover:bg-layer-2"
            }
            onClick={() => handleClick()}
        >
            <h3>{title}</h3>
            <p>{new Date(startTime).toLocaleString()}</p>
            <p>Room: {room || "Virtual"}</p>
        </div>
    );
};

export default MeetingAttendanceCard;
