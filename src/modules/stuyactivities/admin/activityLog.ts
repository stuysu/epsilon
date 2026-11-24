export type AdminActionRow = {
    id: number;
    action: string;
    target_type: string | null;
    target_id: number | null;
    details: Record<string, unknown> | null;
    created_at: string;
    users: { first_name: string | null; last_name: string | null } | null;
};

export type Category = {
    key: string;
    label: string;
    icon: string;
    color: string;
    actions: string[];
};

export const CATEGORIES: Category[] = [
    {
        key: "charters",
        label: "Charters",
        icon: "bx-file",
        color: "text-blue",
        actions: [
            "approve_charter",
            "reject_charter",
            "approve_charter_edit",
            "reject_charter_edit",
            "delete_charter",
        ],
    },
    {
        key: "strikes",
        label: "Strikes",
        icon: "bx-error",
        color: "text-red",
        actions: ["issue_strike", "delete_strike"],
    },
    {
        key: "rooms",
        label: "Modified Rooms",
        icon: "bx-door-open",
        color: "text-yellow",
        actions: [
            "create_room",
            "update_room",
            "delete_room",
            "grant_room",
            "remove_room_grant",
        ],
    },
    {
        key: "bookings",
        label: "Bookings & Blocks",
        icon: "bx-calendar-x",
        color: "text-orange-400",
        actions: ["force_reserve", "block_rooms", "unblock_room"],
    },
    {
        key: "users",
        label: "Users",
        icon: "bx-user-plus",
        color: "text-green",
        actions: ["add_user", "add_users"],
    },
    {
        key: "announcements",
        label: "Announcements",
        icon: "bx-broadcast",
        color: "text-purple-500",
        actions: [
            "post_announcement",
            "edit_announcement",
            "delete_announcement",
        ],
    },
    {
        key: "valentines",
        label: "Valentines",
        icon: "bx-heart",
        color: "text-pink-500",
        actions: ["approve_valentine", "reject_valentine"],
    },
];

const OTHER: Category = {
    key: "other",
    label: "Other",
    icon: "bx-history",
    color: "text-typography-2",
    actions: [],
};

export const categoryOf = (action: string) =>
    CATEGORIES.find((c) => c.actions.includes(action)) ?? OTHER;

export const actorName = (row: Pick<AdminActionRow, "users">) => {
    const name = [row.users?.first_name, row.users?.last_name]
        .filter(Boolean)
        .join(" ");
    return name || "A former admin";
};

/* pieces of one sentence; `strong` marks what was acted on */
export type Piece = { text: string; strong?: boolean };

export type Summary = {
    pieces: Piece[];
    /* a reason or title, shown quoted under the sentence */
    quote?: string;
    tags: string[];
};

const text = (value: unknown) =>
    typeof value === "string" || typeof value === "number" ? String(value) : "";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* "2026-12-09" -> "Dec 9" */
export const shortDate = (value: unknown) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text(value));
    if (!m) return text(value);
    return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

const list = (items: string[]) =>
    items.length <= 2
        ? items.join(" and ")
        : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const ANNOUNCEMENT_VERBS: Record<string, string> = {
    post_announcement: "posted",
    edit_announcement: "edited",
    delete_announcement: "deleted",
};

export const summarize = ({ action, details }: AdminActionRow): Summary => {
    const d = details ?? {};
    const org = text(d.organization) || "a club";
    const room = text(d.room) || "a room";
    const rooms = Array.isArray(d.rooms) ? d.rooms.map(text) : [];
    const reason = text(d.reason) || undefined;
    const tags: string[] = [];
    if (typeof d.cancelled === "number" && d.cancelled > 0) {
        tags.push(`${plural(d.cancelled, "meeting")} cancelled`);
    }
    const s = (...pieces: (string | Piece)[]): Piece[] =>
        pieces.map((p) => (typeof p === "string" ? { text: p } : p));
    const b = (value: string): Piece => ({ text: value, strong: true });

    switch (action) {
        case "approve_charter":
            return { pieces: s("approved ", b(org)), tags };
        case "reject_charter":
            return { pieces: s("rejected ", b(org)), quote: reason, tags };
        case "approve_charter_edit":
        case "reject_charter_edit": {
            const fields = Array.isArray(d.fields)
                ? d.fields.map((f) => text(f).replace(/_/g, " "))
                : [];
            if (fields.length) tags.push(list(fields));
            const verb =
                action === "approve_charter_edit" ? "approved" : "rejected";
            return { pieces: s(`${verb} changes to `, b(org)), tags };
        }
        case "delete_charter": {
            const state = text(d.state);
            if (state) tags.push(state.toLowerCase());
            return {
                pieces: s("deleted the charter of ", b(text(d.name) || org)),
                tags,
            };
        }
        case "issue_strike":
            return {
                pieces: s("gave ", b(org), " a strike"),
                quote: reason,
                tags,
            };
        case "delete_strike":
            return {
                pieces: s("removed a strike from ", b(org)),
                quote: reason,
                tags,
            };
        case "force_reserve":
            return {
                pieces: s("force reserved ", b(room), " for ", b(org)),
                quote: text(d.title) || undefined,
                tags,
            };
        case "block_rooms":
            return {
                pieces: s(
                    "blocked ",
                    b(rooms.length ? list(rooms) : room),
                    ` on ${shortDate(d.date)}`,
                ),
                quote: reason,
                tags,
            };
        case "unblock_room":
            return {
                pieces: s("unblocked ", b(room), ` on ${shortDate(d.date)}`),
                tags,
            };
        case "create_room":
            return { pieces: s("added room ", b(room)), tags };
        case "update_room":
            return { pieces: s("edited room ", b(room)), tags };
        case "delete_room":
            return { pieces: s("deleted room ", b(room)), tags };
        case "grant_room":
            return { pieces: s("gave ", b(org), " access to ", b(room)), tags };
        case "remove_room_grant":
            return {
                pieces: s("took back ", b(room), " from ", b(org)),
                tags,
            };
        case "add_user":
            if (d.is_faculty === true) tags.push("faculty");
            return { pieces: s("added ", b(text(d.name) || "a user")), tags };
        case "add_users":
            return {
                pieces: s("added ", b(plural(Number(d.count) || 0, "user"))),
                tags,
            };
        case "post_announcement":
        case "edit_announcement":
        case "delete_announcement":
            return {
                pieces: s(`${ANNOUNCEMENT_VERBS[action]} an announcement`),
                quote: text(d.title) || undefined,
                tags,
            };
        case "approve_valentine":
            return { pieces: s("approved a valentine"), tags };
        case "reject_valentine":
            return { pieces: s("removed a valentine"), tags };
        default:
            return { pieces: s(action.replace(/_/g, " ")), tags };
    }
};
