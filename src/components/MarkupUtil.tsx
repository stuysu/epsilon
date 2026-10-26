import { MDXEditor, headingsPlugin, linkPlugin, linkDialogPlugin, toolbarPlugin, tablePlugin, BlockTypeSelect, BoldItalicUnderlineToggles, CreateLink, InsertTable, } from "@mdxeditor/editor";
import Markdown from "markdown-to-jsx";
import { ReactNode, useContext, useEffect } from "react";
import '@mdxeditor/editor/style.css';

export function MarkupEditor({ callback, editableClassName = "", defaultText = "", insertText = "" }: { callback: (value: string) => void, editableClassName?: string, defaultText?: string, insertText?: string }) {
    return (
        <>
            <MDXEditor
                plugins={[
                    headingsPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    tablePlugin(),

                    toolbarPlugin(
                        {
                            toolbarContents: () => {
                                return (<>
                                    <BlockTypeSelect />
                                    <BoldItalicUnderlineToggles />
                                    <CreateLink />
                                    <InsertTable />
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