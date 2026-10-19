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

/* sort by role, then by the order set by the org's admins (unordered members go last, in join order) */
export const sortMembers = (
    member1: Partial<Membership>,
    member2: Partial<Membership>,
) => {
    const roleOrder = sortByRole(member1, member2);
    if (roleOrder !== 0) return roleOrder;

    const order1 = member1.ordering_id ?? Number.MAX_SAFE_INTEGER;
    const order2 = member2.ordering_id ?? Number.MAX_SAFE_INTEGER;
    if (order1 !== order2) return order1 - order2;

    return (member1.id ?? 0) - (member2.id ?? 0);
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

export type MemberSort =
    | "default"
    | "joined-newest"
    | "joined-oldest"
    | "first-name"
    | "last-name";

export const memberSortOptions: { value: MemberSort; label: string }[] = [
    { value: "default", label: "Default order" },
    { value: "joined-newest", label: "Join date (newest first)" },
    { value: "joined-oldest", label: "Join date (oldest first)" },
    { value: "first-name", label: "First name (A-Z)" },
    { value: "last-name", label: "Last name (A-Z)" },
];

type SortableMember = {
    first_name?: string;
    last_name?: string;
    joined_at?: string;
};

const compareText = (text1 = "", text2 = "") =>
    text1.localeCompare(text2, undefined, { sensitivity: "base" });

const compareNames = (member1: SortableMember, member2: SortableMember) =>
    compareText(member1.first_name, member2.first_name) ||
    compareText(member1.last_name, member2.last_name);

const compareJoinDates = (
    member1: SortableMember,
    member2: SortableMember,
    newestFirst = false,
) => {
    const time1 = member1.joined_at ? Date.parse(member1.joined_at) : NaN;
    const time2 = member2.joined_at ? Date.parse(member2.joined_at) : NaN;
    if (isNaN(time1) !== isNaN(time2)) return isNaN(time1) ? 1 : -1;
    const difference = time1 - time2 || 0;
    return newestFirst ? -difference : difference;
};

export const sortMembersBy = <T>(
    items: T[],
    sort: MemberSort,
    pick: (item: T) => SortableMember,
) => {
    if (sort === "default") return items;

    return [...items].sort((item1, item2) => {
        const member1 = pick(item1);
        const member2 = pick(item2);

        switch (sort) {
            case "joined-newest":
                return (
                    compareJoinDates(member1, member2, true) ||
                    compareNames(member1, member2)
                );
            case "joined-oldest":
                return (
                    compareJoinDates(member1, member2) ||
                    compareNames(member1, member2)
                );
            case "first-name":
                return compareNames(member1, member2);
            case "last-name":
                return (
                    compareText(member1.last_name, member2.last_name) ||
                    compareText(member1.first_name, member2.first_name)
                );
            default:
                return 0;
        }
    });
};
