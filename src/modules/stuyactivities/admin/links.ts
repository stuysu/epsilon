// kept apart from the admin pages so the nav bar can check access without loading them

export type SitePermission =
    "ADMIN" | "VALENTINES" | "APPLICATIONS" | "ELECTIONS";

export type Link = {
    to: string;
    label: string;
    icon: string;
    permission: SitePermission;
};

export const VALENTINES = false;

export const ALL_LINKS: Link[] = [
    {
        to: "/admin/approve-pending",
        label: "Pending Orgs",
        icon: "bx-carousel",
        permission: "ADMIN",
    },
    {
        to: "/admin/approve-edit",
        label: "Approve Edits",
        icon: "bx-edit",
        permission: "ADMIN",
    },
    {
        to: "/admin/strikes",
        label: "Strikes",
        icon: "bx-error",
        permission: "ADMIN",
    },
    {
        to: "/admin/send-message",
        label: "Send Message",
        icon: "bx-message-dots",
        permission: "ADMIN",
    },
    {
        to: "/admin/announcements",
        label: "Announcements",
        icon: "bxs-megaphone",
        permission: "ADMIN",
    },
    {
        to: "/admin/rooms",
        label: "Rooms",
        icon: "bx-door-open",
        permission: "ADMIN",
    },
    {
        to: "/admin/reserve",
        label: "Reserve",
        icon: "bx-calendar-check",
        permission: "ADMIN",
    },
    {
        to: "/admin/block-rooms",
        label: "Block Rooms",
        icon: "bx-calendar-x",
        permission: "ADMIN",
    },
    {
        to: "/admin/add-user",
        label: "Add User",
        icon: "bx-user-plus",
        permission: "ADMIN",
    },
    {
        to: "/admin/analytics",
        label: "Analytics",
        icon: "bx-bar-chart-alt-2",
        permission: "ADMIN",
    },
    {
        to: "/admin/activity-log",
        label: "Activity Log",
        icon: "bx-history",
        permission: "ADMIN",
    },
    ...(VALENTINES
        ? ([
              {
                  to: "/admin/valentines",
                  label: "Valentines",
                  icon: "bx-heart",
                  permission: "VALENTINES",
              },
              {
                  to: "/admin/approved-valentines",
                  label: "Approved Valentines",
                  icon: "bx-book-heart",
                  permission: "VALENTINES",
              },
          ] satisfies Link[])
        : []),
];

// ADMIN opens every page; other permissions open only their own
export const canOpen = (
    user: Pick<UserContextType, "permissions">,
    permission: SitePermission,
) =>
    user.permissions.includes("ADMIN") || user.permissions.includes(permission);

export const getLinks = (user: Pick<UserContextType, "permissions">) =>
    ALL_LINKS.filter((link) => canOpen(user, link.permission));
