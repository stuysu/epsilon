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

const splitSocials = (socials?: string | null): string[] =>
    (socials ?? "").split(/\s+/).filter(Boolean);

export const getSocialLinks = (socials?: string | null): string[] =>
    splitSocials(socials).filter(isWebLink).map(withScheme);

export const getInvalidSocials = (socials?: string | null): string[] =>
    splitSocials(socials).filter((social) => !isWebLink(social));
