import {
    LINK_TYPES,
    linkDetail,
    linkTitle,
    parseLinks,
} from "../../../../utils/SocialLinks";

/* spans only, since it sits inside paragraphs */
const LinkSummary = ({ socials }: { socials?: string | null }) => {
    const links = parseLinks(socials);
    if (!links.length)
        return <em className="text-typography-3">&lt;empty&gt;</em>;
    return (
        <span className={"flex flex-col gap-1"}>
            {links.map((link, i) => (
                <span key={i} className={"flex min-w-0 items-center gap-2"}>
                    <i
                        aria-hidden="true"
                        className={`bx ${LINK_TYPES[link.type].icon}`}
                    />
                    <span className={"important shrink-0"}>
                        {linkTitle(link)}:
                    </span>
                    <span className={"truncate"}>{linkDetail(link)}</span>
                </span>
            ))}
        </span>
    );
};

export default LinkSummary;
