type Props = {
    id: number,
    title: string,
    description?: string,
    startTime: string,
    endTime: string,
    organizationPicture: string,
    organizationName: string,
    roomName?: string
}

const MeetingPreview = (
    {
        id,
        title,
        description,
        startTime,
        endTime,
        organizationPicture,
        organizationName,
        roomName
    } : Props
) => {
    return (
        <div></div>
    )
}

export default MeetingPreview;