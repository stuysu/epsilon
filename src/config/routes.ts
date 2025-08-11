export const STUY_ACTIVITIES_PATHS = [
    "/stuyactivities",
    "/charter",
    "/create",
    "/archives",
    "/rules",
    "/activities-support",
    "/admin",
    "/admin/approve-edit",
    "/admin/approve-pending",
    "/admin/strikes",
    "/admin/send-message",
    "/admin/add-user",
    "/admin/announcements",
    "/admin/rooms",
] as const;

export const isStuyActivitiesPath = (pathname: string) =>
    STUY_ACTIVITIES_PATHS.some((p) => pathname.startsWith(p));

export const topNavItems = [
    { label: "Home", path: "/", icon: "bx bx-home-alt", external: false },
    {
        label: "StuyActivities",
        path: "/stuyactivities",
        icon: "bx bx-group",
        external: false,
    },
    {
        label: "Calendar",
        path: "/meetings",
        icon: "bx bx-calendar",
        external: false,
    },
    {
        label: "Vote",
        url: "https://vote.stuysu.org",
        path: "/none",
        icon: "bx bx-note",
        external: true,
    },
    {
        label: "Arista",
        url: "https://stuyarista.org/",
        path: "/none",
        icon: "bx bxs-hot",
        external: true,
    },
    {
        label: "Opportunities",
        url: "https://opportunities.stuysu.org",
        path: "/none",
        icon: "bx bx-glasses",
        external: true,
    },
    {
        label: "Apply",
        url: "https://applications.stuysu.org/",
        path: "/none",
        icon: "bx bx-check-circle",
        external: true,
    },
    { label: "About", path: "/about", icon: "bx bx-file", external: false },
] as const;
