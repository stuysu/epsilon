export const sortByRole = (
    member1: Partial<Membership>,
    member2: Partial<Membership>,
) => {
    if (member1.role === member2.role) return 0;
    // member 1 greater
    if (member1.role === "CREATOR") return -1;
    if (
        member1.role === "ADMIN" &&
        (member2.role === "ADVISOR" || member2.role === "MEMBER")
    )
        return -1;
    if (member1.role === "ADVISOR" && member2.role === "MEMBER") return -1;

    return 1; // if member 1 is not greater and they are not the same, member2 is simply greater
};

export const capitalizeWords = (s: string) =>
    s
        .split(" ")
        .map(
            (substr) =>
                substr.slice(0, 1).toUpperCase() +
                substr.slice(1).toLowerCase(),
        )
        .join(" ");

export const sortByDate = (
    meeting1: Partial<Meeting>,
    meeting2: Partial<Meeting>,
) => {
    if (!meeting1.start_time || !meeting2.start_time) return 0;
    if (meeting1.start_time > meeting2.start_time) return 1;
    if (meeting1.start_time < meeting2.start_time) return -1;
    return 0;
};

export const sortPostByDate = (post1: Partial<Post>, post2: Partial<Post>) => {
    if (!post1.created_at || !post2.created_at) return 0;
    if (post1.created_at > post2.created_at) return 1;
    if (post1.created_at < post2.created_at) return -1;
    return 0;
};

/* sort by floor, then by room number (the first word of the room name) */
export const sortRooms = (room1: Partial<Room>, room2: Partial<Room>) => {
    const floor1 = room1.floor ?? Number.MAX_SAFE_INTEGER;
    const floor2 = room2.floor ?? Number.MAX_SAFE_INTEGER;
    if (floor1 !== floor2) return floor1 - floor2;

    const number1 = parseInt(room1.name || "", 10);
    const number2 = parseInt(room2.name || "", 10);
    // rooms with no number (ex. "Library") go after the numbered ones
    if (isNaN(number1) !== isNaN(number2)) return isNaN(number1) ? 1 : -1;
    if (number1 !== number2 && !isNaN(number1)) return number1 - number2;

    return (room1.name || "").localeCompare(room2.name || "", undefined, {
        numeric: true,
    });
};
