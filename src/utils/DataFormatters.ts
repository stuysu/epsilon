export const sortByRole = (member1 : Partial<Membership>, member2 : Partial<Membership>) => {
    if (member1.role === member2.role) return 0;
    // member 1 greater
    if (member1.role === 'CREATOR') return -1;
    if (member1.role === 'ADMIN' && (member2.role === 'ADVISOR' || member2.role === 'MEMBER')) return -1;
    if (member1.role === 'ADVISOR' && member2.role === 'MEMBER') return -1;

    return 1; // if member 1 is not greater and they are not the same, member2 is simply greater
}

export const capitalizeWords = (s : string) => s.split(" ").map(substr => substr.slice(0, 1).toUpperCase() + substr.slice(1).toLowerCase()).join(" ")