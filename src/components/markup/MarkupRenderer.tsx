import Markdown, { MarkdownToJSX, RuleType } from "markdown-to-jsx";
import {
    ComponentPropsWithoutRef,
    Fragment,
    ReactNode,
    createElement,
} from "react";

// The editor writes underline as raw HTML; every other tag is unwrapped to its
// text. (Highlight is written as ==text==, which renders as <mark>.)
const ALLOWED_TAGS = new Set(["u", "mark"]);

const normalizeHref = (href: string) => {
    if (href.startsWith("//")) return `https:${href}`;
    return /^([a-z][a-z0-9+.-]*:|[/#?.])/i.test(href)
        ? href
        : `https://${href}`;
};

const hostOf = (value: string) => {
    try {
        return new URL(normalizeHref(value.trim())).hostname.replace(
            /^www\./,
            "",
        );
    } catch {
        return null;
    }
};

const textOf = (children: ReactNode) => {
    if (typeof children === "string") return children;
    if (
        Array.isArray(children) &&
        children.every((child) => typeof child === "string")
    ) {
        return children.join("");
    }
    return null;
};

const looksLikeUrl = (text: string) =>
    /^(https?:\/\/|www\.)\S+$|^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(text.trim());

const Link = ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => {
    if (!href) return <span>{children}</span>;
    const url = normalizeHref(href);
    const external = /^https?:/i.test(url);
    // Link text that reads as an address must match where the link goes.
    const text = textOf(children);
    const spoofed =
        text !== null && looksLikeUrl(text) && hostOf(text) !== hostOf(url);
    return (
        <a
            {...props}
            href={url}
            {...(external && {
                target: "_blank",
                rel: "noopener noreferrer",
            })}
        >
            {spoofed ? url : children}
        </a>
    );
};

// Remote images would let an author log every viewer's IP, so show a link.
const Image = ({ src, alt }: ComponentPropsWithoutRef<"img">) =>
    src ? <Link href={src}>{alt || "Image"}</Link> : null;

const Table = (props: ComponentPropsWithoutRef<"table">) => (
    <div className="markup-table" tabIndex={0}>
        <table {...props} />
    </div>
);

const Checkbox = (props: ComponentPropsWithoutRef<"input">) => (
    <input {...props} disabled tabIndex={-1} />
);

// Posts sit under their own title, so markdown headings start at h4. The
// generated ids are dropped; they would repeat across posts on one page.
const heading =
    (tag: "h4" | "h5" | "h6", level: number) =>
    ({ id: _id, ...props }: ComponentPropsWithoutRef<"h4">) =>
        createElement(tag, { ...props, className: `markup-h${level}` });

const renderRule: MarkdownToJSX.Options["renderRule"] = (
    next,
    node,
    renderChildren,
    state,
) => {
    if (node.type === RuleType.htmlBlock) {
        const children = renderChildren(node.children || [], state);
        return ALLOWED_TAGS.has(node.tag)
            ? createElement(node.tag, { key: state.key }, children)
            : createElement("span", { key: state.key }, children);
    }
    if (
        node.type === RuleType.htmlSelfClosing ||
        node.type === RuleType.htmlComment
    ) {
        return null;
    }
    return next();
};

const options: MarkdownToJSX.Options = {
    renderRule,
    forceBlock: true,
    wrapper: Fragment,
    enforceAtxHeadings: true,
    overrides: {
        a: Link,
        img: Image,
        table: Table,
        input: Checkbox,
        h1: heading("h4", 1),
        h2: heading("h5", 2),
        h3: heading("h6", 3),
        h4: heading("h6", 3),
        h5: heading("h6", 3),
        h6: heading("h6", 3),
    },
};

const MarkupRenderer = ({ text }: { text: string }) => (
    <Markdown options={options}>{text}</Markdown>
);

export default MarkupRenderer;
