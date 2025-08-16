import { useNavigate } from "react-router-dom";

const MeetingAttendanceCard = ({
    title,
    id,
    room,
    startTime,
}: {
    title: string;
    id: number;
    room?: string;
    startTime: string;
}) => {
    const navigate = useNavigate();

    return (
        <div
            className={
                "bg-layer-1 w-full mb-6 p-6 rounded-lg shadow-control cursor-pointer hover:bg-layer-2"
            }
            onClick={() => navigate(`${id}`)}
        >
            <h3>{title}</h3>
            <p>{new Date(startTime).toLocaleString()}</p>
            <p>Room: {room || "virtual"}</p>
        </div>
    );
};

export default MeetingAttendanceCard;
