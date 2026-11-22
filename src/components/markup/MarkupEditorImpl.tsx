import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CreateLink,
    HighlightToggle,
    InsertTable,
    InsertThematicBreak,
    ListsToggle,
    MDXEditor,
    Separator,
    StrikeThroughSupSubToggles,
    UndoRedo,
    headingsPlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useContext, useMemo, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeProvider";
import type { MarkupEditorProps } from "./MarkupEditor";

// The editor's parser reads "<" as MDX, so older plain-text posts like
// "a < b", "<3" or "<https://...>" fail to load. Bare "<" is escaped and
// autolinks become regular links; escapes, code spans, <u>/<mark> and the
// <...> link targets the editor writes are left alone.
const escapeForEditor = (text: string) =>
    text.replace(
        /\\[\s\S]|(`+)[\s\S]*?\1|\]\(<[^>\n]*>|<([a-z][a-z0-9+.-]*:[^\s<>]*)>|<([^\s<>@]+@[^\s<>]+)>|<\/?(?:u|mark)>|</gi,
        (match, _ticks, url?: string, email?: string) => {
            if (url) return `[${url}](${url})`;
            if (email) return `[${email}](mailto:${email})`;
            return match === "<" ? "\\<" : match;
        },
    );

const MarkupEditorImpl = ({
    markdown = "",
    onChange,
    placeholder,
    ariaLabel,
    compact = false,
    tall = false,
}: MarkupEditorProps) => {
    const { effectiveMode } = useContext(ThemeContext);
    const name = ariaLabel ?? placeholder ?? "Text editor";
    const [initial] = useState(() => escapeForEditor(markdown));
    const [fallback, setFallback] = useState<string>();

    const plugins = useMemo(
        () => [
            headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
            listsPlugin(),
            quotePlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            tablePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            toolbarPlugin({
                toolbarContents: () =>
                    compact ? (
                        <>
                            <BoldItalicUnderlineToggles />
                            <CreateLink />
                            <ListsToggle options={["bullet", "number"]} />
                        </>
                    ) : (
                        <>
                            <UndoRedo />
                            <Separator />
                            <BlockTypeSelect />
                            <BoldItalicUnderlineToggles />
                            <StrikeThroughSupSubToggles
                                options={["Strikethrough"]}
                            />
                            <HighlightToggle />
                            <Separator />
                            <ListsToggle />
                            <CreateLink />
                            <InsertTable />
                            <InsertThematicBreak />
                        </>
                    ),
            }),
        ],
        [compact],
    );

    // If the text still can't be parsed, edit it as plain text rather than
    // showing an empty editor that would overwrite it on save.
    if (fallback !== undefined) {
        return (
            <textarea
                aria-label={name}
                placeholder={placeholder}
                value={fallback}
                rows={tall ? 8 : 3}
                onChange={(e) => {
                    setFallback(e.target.value);
                    onChange(e.target.value);
                }}
                className="w-full rounded-xl bg-layer-2 p-3 text-typography-1 shadow-inner focus:outline-1"
            />
        );
    }

    return (
        <MDXEditor
            className={effectiveMode === "dark" ? "dark-theme" : ""}
            markdown={initial}
            onChange={(value, initialNormalize) => {
                if (!initialNormalize) onChange(value);
            }}
            onError={({ error }) => {
                console.warn("Markdown editor fell back to plain text:", error);
                setFallback(markdown);
            }}
            placeholder={placeholder}
            plugins={plugins}
            translation={(key, defaultValue, interpolations = {}) =>
                key === "contentArea.editableMarkdown"
                    ? name
                    : Object.entries(interpolations).reduce(
                          (text, [k, v]) =>
                              text.replaceAll(`{{${k}}}`, String(v)),
                          defaultValue,
                      )
            }
        />
    );
};

export default MarkupEditorImpl;
