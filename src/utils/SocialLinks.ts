/* people usually leave off the https://, and without it the link would open as a page on our site */
export const withScheme = (value: string): string =>
    /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;

/* only allow links the browser can actually open (ex. https://example.com:abc can't), same rule as _shared/charter.ts in epsilon-functions */
export const isWebLink = (value: string): boolean => {
    try {
        const { protocol, hostname, username, password } = new URL(
            withScheme(value),
        );
        return (
            (protocol === "http:" || protocol === "https:") &&
            !username &&
            !password &&
            !value.endsWith(",") &&
            /\.[a-z][a-z0-9-]+$/.test(hostname)
        );
    } catch {
        return false;
    }
};

export type LinkType =
    | "website"
    | "instagram"
    | "tiktok"
    | "linktree"
    | "discord"
    | "youtube"
    | "x"
    | "facebook"
    | "linkedin"
    | "github"
    | "form"
    | "other";

export type ClubLink = { type: LinkType; url: string; name?: string };

type LinkTypeInfo = {
    label: string;
    icon: string;
    hosts?: string[];
    /* a bare @handle becomes this profile link */
    profile?: (handle: string) => string;
    placeholder: string;
};

/* kept in sync with LINK_TYPES in epsilon-functions/_shared/charter.ts */
export const LINK_TYPES: Record<LinkType, LinkTypeInfo> = {
    website: {
        label: "Website",
        icon: "bx-globe",
        placeholder: "yourclub.com",
    },
    instagram: {
        label: "Instagram",
        icon: "bxl-instagram",
        hosts: ["instagram.com"],
        profile: (h) => `https://www.instagram.com/${h}`,
        placeholder: "@yourclub or instagram.com/yourclub",
    },
    tiktok: {
        label: "TikTok",
        icon: "bxl-tiktok",
        hosts: ["tiktok.com"],
        profile: (h) => `https://www.tiktok.com/@${h}`,
        placeholder: "@yourclub or tiktok.com/@yourclub",
    },
    linktree: {
        label: "Linktree",
        icon: "bx-link-alt",
        hosts: ["linktr.ee"],
        profile: (h) => `https://linktr.ee/${h}`,
        placeholder: "linktr.ee/yourclub",
    },
    discord: {
        label: "Discord",
        icon: "bxl-discord-alt",
        hosts: ["discord.gg", "discord.com"],
        placeholder: "discord.gg/invite-code",
    },
    youtube: {
        label: "YouTube",
        icon: "bxl-youtube",
        hosts: ["youtube.com", "youtu.be"],
        profile: (h) => `https://www.youtube.com/@${h}`,
        placeholder: "@yourclub or youtube.com/@yourclub",
    },
    x: {
        label: "X (Twitter)",
        icon: "bxl-twitter",
        hosts: ["x.com", "twitter.com"],
        profile: (h) => `https://x.com/${h}`,
        placeholder: "@yourclub or x.com/yourclub",
    },
    facebook: {
        label: "Facebook",
        icon: "bxl-facebook-circle",
        hosts: ["facebook.com", "fb.com"],
        placeholder: "facebook.com/yourclub",
    },
    linkedin: {
        label: "LinkedIn",
        icon: "bxl-linkedin-square",
        hosts: ["linkedin.com"],
        placeholder: "linkedin.com/company/yourclub",
    },
    github: {
        label: "GitHub",
        icon: "bxl-github",
        hosts: ["github.com"],
        profile: (h) => `https://github.com/${h}`,
        placeholder: "github.com/yourclub",
    },
    form: {
        label: "Sign-up Form",
        icon: "bx-spreadsheet",
        hosts: ["forms.gle", "docs.google.com", "forms.office.com"],
        placeholder: "forms.gle/…",
    },
    other: {
        label: "Other",
        icon: "bx-link",
        placeholder: "example.com/page",
    },
};

export const LINK_TYPE_ORDER = Object.keys(LINK_TYPES) as LinkType[];
export const MAX_LINKS = 8;
export const MAX_LINK_NAME = 30;
export const MAX_LINK_URL = 200;

const hostOf = (url: string) => {
    try {
        return new URL(withScheme(url)).hostname
            .toLowerCase()
            .replace(/^www\./, "");
    } catch {
        return "";
    }
};

const matchesHost = (host: string, hosts: string[]) =>
    hosts.some((h) => host === h || host.endsWith(`.${h}`));

export const detectLinkType = (url: string): LinkType => {
    const host = hostOf(url);
    const found = LINK_TYPE_ORDER.find((type) => {
        const hosts = LINK_TYPES[type].hosts;
        return hosts && matchesHost(host, hosts);
    });
    return found ?? "website";
};

/* turns what someone typed into a full link, ex. "@club" on Instagram */
export const normalizeLinkUrl = (type: LinkType, input: string): string => {
    const value = input.trim();
    const handle = value.match(/^@([\w.-]+)$/)?.[1];
    const profile = LINK_TYPES[type].profile;
    if (handle && profile) return profile(handle);
    return value ? withScheme(value) : "";
};

export const linkProblem = (link: ClubLink): string | undefined => {
    const info = LINK_TYPES[link.type];
    if (!info) return "Choose a link type.";
    if (!link.url.trim()) return "Add a link.";
    if (link.url.length > MAX_LINK_URL)
        return `Links must be at most ${MAX_LINK_URL} characters.`;
    if (!isWebLink(link.url)) return "This isn't a valid link.";
    if (info.hosts && !matchesHost(hostOf(link.url), info.hosts))
        return `This isn't ${/^[aeiou]/i.test(info.label) ? "an" : "a"} ${info.label} link.`;
    if (link.type === "other" && !link.name?.trim())
        return "Give this link a name.";
    if ((link.name ?? "").length > MAX_LINK_NAME)
        return `Names must be at most ${MAX_LINK_NAME} characters.`;
    return undefined;
};

/* socials used to be links separated by spaces, now it's a JSON list */
export const parseLinks = (socials?: string | null): ClubLink[] => {
    const text = (socials ?? "").trim();
    if (!text) return [];
    if (text.startsWith("[")) {
        try {
            const list = JSON.parse(text);
            if (Array.isArray(list)) {
                return list
                    .filter(
                        (l) =>
                            l &&
                            typeof l.url === "string" &&
                            l.type in LINK_TYPES,
                    )
                    .map((l) => ({
                        type: l.type,
                        url: l.url,
                        name: typeof l.name === "string" ? l.name : "",
                    }));
            }
        } catch {
            return [];
        }
    }
    return text
        .split(/\s+/)
        .filter(Boolean)
        .map((url) => ({ type: detectLinkType(url), url, name: "" }));
};

export const serializeLinks = (links: ClubLink[]): string =>
    links.length
        ? JSON.stringify(
              links.map(({ type, url, name }) => ({
                  type,
                  url: normalizeLinkUrl(type, url),
                  ...(name?.trim() ? { name: name.trim() } : {}),
              })),
          )
        : "";

export const linkProblems = (socials?: string | null): string[] => {
    const links = parseLinks(socials);
    const problems = links.map(linkProblem).filter((p): p is string => !!p);
    if (links.length > MAX_LINKS)
        problems.push(`Add at most ${MAX_LINKS} links.`);
    return problems;
};

export const linkTitle = (link: ClubLink) =>
    link.name?.trim() || LINK_TYPES[link.type].label;

/* "@club" for profiles, otherwise the address without https:// */
export const linkDetail = (link: ClubLink) => {
    const url = withScheme(link.url);
    const info = LINK_TYPES[link.type];
    try {
        const { pathname } = new URL(url);
        const first = pathname.split("/").filter(Boolean)[0] ?? "";
        if (
            info.profile &&
            first &&
            pathname.split("/").filter(Boolean).length === 1
        )
            return `@${first.replace(/^@/, "")}`;
    } catch {
        /* fall through to the plain address */
    }
    return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
};

export const getSocialLinks = (socials?: string | null): ClubLink[] =>
    parseLinks(socials)
        .filter((l) => isWebLink(l.url))
        .map((l) => ({ ...l, url: withScheme(l.url) }));

export const getInvalidSocials = linkProblems;

/* positions (1-based) of the approved links in their new order, or null if anything besides the order changed */
export const linkOrder = (
    approved?: string | null,
    edited?: string | null,
): number[] | null => {
    const key = (l: ClubLink) =>
        JSON.stringify([
            l.type,
            normalizeLinkUrl(l.type, l.url),
            l.name?.trim() ?? "",
        ]);
    const before = parseLinks(approved).map(key);
    const after = parseLinks(edited).map(key);
    if (!before.length || before.length !== after.length) return null;
    const used = new Set<number>();
    const order: number[] = [];
    for (const k of after) {
        const i = before.findIndex((b, j) => b === k && !used.has(j));
        if (i < 0) return null;
        used.add(i);
        order.push(i + 1);
    }
    return order;
};
