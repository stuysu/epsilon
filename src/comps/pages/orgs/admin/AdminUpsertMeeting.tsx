import { useState } from "react";

const AdminUpsertMeeting = (
    {
        id,
        title,
        description,
        room_id,
        start,
        end
    } :
    {
        id: number | undefined,
        title: string | undefined,
        description: string | undefined,
        room_id: number | undefined,
        start: string | undefined,
        end: string | undefined
    }
) => {
    const [meetingTitle, setMeetingTitle] = useState(title || "")
    const [meetingDesc, setMeetingDesc] = useState(description || "")
    const [roomId, setRoomId] = useState(room_id)
    const [startTime, setStartTime] = useState(start)
    const [endTime, setEndTime] = useState(end)
}

export default AdminUpsertMeeting;