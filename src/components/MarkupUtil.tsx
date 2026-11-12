import { MDXEditor, headingsPlugin, linkPlugin, linkDialogPlugin, toolbarPlugin, tablePlugin, listsPlugin, BlockTypeSelect, BoldItalicUnderlineToggles, CreateLink, InsertTable, HighlightToggle, ListsToggle, StrikeThroughSupSubToggles, UndoRedo, MDXEditorMethods, quotePlugin, thematicBreakPlugin, insertThematicBreak$, InsertThematicBreak } from "@mdxeditor/editor";
import Markdown from "markdown-to-jsx";
import { ReactNode, Ref, useContext, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeProvider";
import '@mdxeditor/editor/style.css';

export function MarkupEditor({ callback, editableClassName = "", defaultText = "", insertText = "", passedRef }: { callback: (value: string) => void, editableClassName?: string, defaultText?: string, insertText?: string, passedRef?: Ref<MDXEditorMethods> }) {
    const theme = useContext(ThemeContext);

    return (
        passedRef !== undefined ?
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
            :
            <>
                <MDXEditor
                    plugins={[
                        headingsPlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        tablePlugin(),
                        listsPlugin(),

                        toolbarPlugin(
                            {
                                toolbarContents: () => {
                                    return (<>
                                        <BlockTypeSelect />
                                        <BoldItalicUnderlineToggles />
                                        <CreateLink />
                                        <InsertTable />
                                        <HighlightToggle />
                                        <ListsToggle options={["check"]} />
                                        <StrikeThroughSupSubToggles />
                                        <UndoRedo />
                                    </>)
                                }
                            }
                        )]}
                    markdown={insertText}
                    onChange={(current) => callback(current)}



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

const options = {
    overrides: {
        table: Table,
        th: Th,
        td: Td,
        ul: { props: { className: 'md-ul' } },
        ol: { props: { className: 'md-ol' } },
        li: { props: { className: 'md-li' } },
    },
};

export function MarkupDisplayer({ text }: { text: string }) {
    return (
        <>
            <Markdown options={{
                disableParsingRawHTML: true,
                ...options
            }}>
                {text}
            </Markdown >
        </>
    )
}
