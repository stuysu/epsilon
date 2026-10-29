import { MDXEditor, headingsPlugin, linkPlugin, linkDialogPlugin, toolbarPlugin, tablePlugin, listsPlugin, BlockTypeSelect, BoldItalicUnderlineToggles, CreateLink, InsertTable, HighlightToggle, ListsToggle, StrikeThroughSupSubToggles, UndoRedo, MDXEditorMethods } from "@mdxeditor/editor";
import Markdown from "markdown-to-jsx";
import { ReactNode, Ref, useContext, useEffect } from "react";
import '@mdxeditor/editor/style.css';

export function MarkupEditor({ callback, editableClassName = "", defaultText = "", insertText = "", passedRef }: { callback: (value: string) => void, editableClassName?: string, defaultText?: string, insertText?: string, passedRef?: Ref<MDXEditorMethods> }) {
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

export function MarkupDisplayer({ text }: { text: string }) {
    return (
        <>
            <Markdown>
                {text}
            </Markdown >
        </>
    )
}