import { MDXEditor, headingsPlugin, linkPlugin, linkDialogPlugin, toolbarPlugin, tablePlugin, listsPlugin, BlockTypeSelect, BoldItalicUnderlineToggles, CreateLink, InsertTable, HighlightToggle, ListsToggle, StrikeThroughSupSubToggles, UndoRedo, MDXEditorMethods, quotePlugin, thematicBreakPlugin, insertThematicBreak$, InsertThematicBreak } from "@mdxeditor/editor";
import Markdown, { MarkdownToJSX, RuleType } from "markdown-to-jsx";
import { createElement, ReactNode, Ref, useContext, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeProvider";
import '@mdxeditor/editor/style.css';

export function MarkupEditor({ callback, editableClassName = "", defaultText = "", insertText = "", passedRef }: { callback: (value: string) => void, editableClassName?: string, defaultText?: string, insertText?: string, passedRef?: Ref<MDXEditorMethods> }) {
    const theme = useContext(ThemeContext);

    return (
            <>
                <MDXEditor
                    plugins={[
                        headingsPlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        tablePlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        thematicBreakPlugin(),

                        toolbarPlugin(
                            {
                                toolbarContents: () => {
                                    return (<>
                                        <BlockTypeSelect />
                                        <BoldItalicUnderlineToggles />
                                        <CreateLink />
                                        <InsertTable />
                                        <HighlightToggle />
                                        <InsertThematicBreak />
                                        <ListsToggle options={["bullet", "number", "check"]} />
                                        <StrikeThroughSupSubToggles options={["Strikethrough"]} />
                                        <UndoRedo />
                                    </>)
                                }
                            }
                        )]}
                    markdown={insertText}
                    onChange={(current) => callback(current)}
                    ref={passedRef}


                    /* need to store in optional parameters and apply here */
                    placeholder={defaultText}
                    contentEditableClassName={editableClassName}
                //for special cases such as bigger boxes ^
                />
            </>
    );
}

const BORDER = '1px solid #d0d7de';

type TableProps = React.ComponentPropsWithoutRef<'table'>;
type CellProps<T extends 'th' | 'td'> = React.ComponentPropsWithoutRef<T>;

const Table = ({ children, style, ...props }: TableProps): React.JSX.Element => {
    const theme = useContext(ThemeContext);
    return (
        <div style={{ overflowX: 'auto', margin: '1em 0' }}>
            <table
                {...props}
                style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    border: `1px solid ${theme.effectiveMode === 'light' ? '#d0d7de' : '#3d444d'}`,
                    ...style,
                }}
            >
                {children}
            </table>
        </div>
    );
};

const Th = ({ children, style, ...props }: CellProps<'th'>): React.JSX.Element => {
    const theme = useContext(ThemeContext);
    return (
        <th
            {...props}
            style={{
                border: `1px solid ${theme.effectiveMode === 'light' ? '#d0d7de' : '#3d444d'}`,
                padding: '8px 12px',
                textAlign: 'center',
                verticalAlign: 'middle',
                background: `${theme.effectiveMode === 'light' ? '#f6f8fa' : '#222830'}`,
                color: `${theme.effectiveMode === 'light' ? '#1f2328' : '#f0f6fc'}`,
                fontWeight: 600,
                ...style,
            }}
        >
            {children}
        </th>
    );
};

const Td = ({ children, style, ...props }: CellProps<'th'>): React.JSX.Element => {
    const theme = useContext(ThemeContext);
    return (
        <td
            {...props}
            style={{
                border: `1px solid ${theme.effectiveMode === 'light' ? '#d0d7de' : '#3d444d'}`,
                padding: '8px 12px',
                textAlign: 'center',
                verticalAlign: 'middle',
                background: `${theme.effectiveMode === 'light' ? '#ffffff' : '#151b23'}`,
                color: `${theme.effectiveMode === 'light' ? '#1f2328' : '#d1d7e0'}`,
                ...style,
            }}
        >
            {children}
        </td>
    );
};

/* added link override. applied respective generated regex */
const A = ({ href = "", ...props }: React.ComponentPropsWithoutRef<'a'>): React.JSX.Element => (
    <a {...props} href={/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href) ? href : `https://${href}`} />
);

const options = {
    overrides: {
        a: A,
        table: Table,
        th: Th,
        td: Td,
        ul: { props: { className: 'md-ul' } },
        ol: { props: { className: 'md-ol' } },
        li: { props: { className: 'md-li' } },
    },
};

/* only these html tags are rendered. */
const ALLOWED_TAGS = ["u"];
const sanitizeHtml: MarkdownToJSX.Options["renderRule"] = (next, node, renderChildren, state) => {
    if (node.type === RuleType.htmlBlock) {
        const children = renderChildren(node.children || [], state);
        return ALLOWED_TAGS.includes(node.tag)
            ? createElement(node.tag, { key: state.key }, children)
            : createElement("span", { key: state.key }, children);
    }
    if (node.type === RuleType.htmlSelfClosing || node.type === RuleType.htmlComment) {
        return null;
    }
    return next();
};

export function MarkupDisplayer({ text, inline = false }: { text: string, inline?: boolean }) {
    return (
        <>
            <Markdown options={{
                renderRule: sanitizeHtml,
                forceInline: inline,
                ...options
            }}>
                {text}
            </Markdown >
        </>
    )
}
