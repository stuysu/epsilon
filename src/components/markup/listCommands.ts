import { createRootEditorSubscription$, realmPlugin } from "@mdxeditor/editor";
import {
    $createListItemNode,
    $createListNode,
    $handleListInsertParagraph,
    $insertList,
    $isListItemNode,
    $isListNode,
    $removeList,
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListNode,
    ListType,
    REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
    $addUpdateTag,
    $createLineBreakNode,
    $createParagraphNode,
    $createTextNode,
    $getSelection,
    $insertNodes,
    $isLineBreakNode,
    $isParagraphNode,
    $isRangeSelection,
    $isRootOrShadowRoot,
    $isTextNode,
    COMMAND_PRIORITY_HIGH,
    COMPOSITION_END_TAG,
    HISTORIC_TAG,
    HISTORY_PUSH_TAG,
    INDENT_CONTENT_COMMAND,
    INSERT_PARAGRAPH_COMMAND,
    KEY_TAB_COMMAND,
    LexicalEditor,
    LexicalNode,
    OUTDENT_CONTENT_COMMAND,
    ParagraphNode,
    PASTE_COMMAND,
    PointType,
    mergeRegister,
} from "lexical";

// Lexical's list commands act on whole blocks: a paragraph with line breaks
// (older posts, Shift+Enter) becomes one bullet, and removing or switching a
// list changes every item in it. These handlers first split off only the
// selected lines and items, then run the usual list functions.

// Index of the child of `parent` holding the point (the offset if the point
// is on `parent` itself).
const $childIndex = (parent: LexicalNode, point: PointType) => {
    const node = point.getNode();
    if (node.is(parent)) return point.offset;
    const child = [node, ...node.getParents()].find((n) =>
        n.getParent()?.is(parent),
    );
    return child ? child.getIndexWithinParent() : -1;
};

const $lineAt = (paragraph: ParagraphNode, index: number) =>
    paragraph.getChildren().slice(0, index).filter($isLineBreakNode).length;

// Gives lines `from`..`to` a paragraph each; the lines before and after stay
// together. Returns the paragraphs of the split lines.
const $splitLines = (paragraph: ParagraphNode, from: number, to: number) => {
    const lines: LexicalNode[][] = [[]];
    for (const child of paragraph.getChildren()) {
        if ($isLineBreakNode(child)) {
            lines.push([]);
            child.remove();
        } else {
            lines[lines.length - 1].push(child);
        }
    }
    const make = (group: LexicalNode[][]) => {
        const p = $createParagraphNode()
            .setFormat(paragraph.getFormatType())
            .setIndent(paragraph.getIndent());
        group.forEach((line, i) => {
            if (i > 0) p.append($createLineBreakNode());
            p.append(...line);
        });
        return p;
    };
    const selected = lines.slice(from, to + 1).map((line) => make([line]));
    const blocks = [
        ...(from > 0 ? [make(lines.slice(0, from))] : []),
        ...selected,
        ...(to < lines.length - 1 ? [make(lines.slice(to + 1))] : []),
    ];
    let previous: LexicalNode = paragraph;
    for (const block of blocks) {
        previous.insertAfter(block);
        previous = block;
    }
    paragraph.remove();
    return selected;
};

// Older posts load their line breaks as "\n" inside the text; turn them into
// line break nodes so lines can be split. Saved markdown is unchanged.
const $splitNewlines = (paragraph: ParagraphNode) => {
    const selection = $getSelection();
    const points = $isRangeSelection(selection)
        ? [selection.anchor, selection.focus]
        : [];
    for (const child of paragraph.getChildren()) {
        if (!$isTextNode(child)) continue;
        const text = child.getTextContent();
        const offsets: number[] = [];
        for (let i = 0; i < text.length; i++)
            if (text[i] === "\n") offsets.push(i, i + 1);
        if (offsets.length === 0) continue;
        for (const part of child.splitText(...offsets)) {
            if (part.getTextContent() !== "\n") continue;
            const index = part.getIndexWithinParent();
            for (const point of points) {
                if (point.key !== part.getKey()) continue;
                const after = point.offset > 0;
                const sibling = after
                    ? part.getNextSibling()
                    : part.getPreviousSibling();
                if ($isTextNode(sibling) && sibling.getTextContent() !== "\n")
                    point.set(
                        sibling.getKey(),
                        after ? 0 : sibling.getTextContentSize(),
                        "text",
                    );
                else
                    point.set(
                        paragraph.getKey(),
                        index + (after ? 1 : 0),
                        "element",
                    );
            }
            part.replace($createLineBreakNode());
        }
    }
};

const $isMultiline = (paragraph: ParagraphNode) =>
    paragraph
        .getChildren()
        .some(
            (child) =>
                $isLineBreakNode(child) ||
                ($isTextNode(child) && child.getTextContent().includes("\n")),
        );

const $isNestedWrapper = (item: LexicalNode | null) =>
    $isListItemNode(item) &&
    item.getChildrenSize() === 1 &&
    $isListNode(item.getFirstChild());

// Moves items `first`..`last`, with their sub-lists, into a list of their own.
const $isolateItems = (list: ListNode, first: number, last: number) => {
    const items = list.getChildren();
    while (last + 1 < items.length && $isNestedWrapper(items[last + 1])) last++;
    if (first === 0 && last === items.length - 1) return;
    const type = list.getListType();
    const numberAt = (i: number) =>
        list.getStart() +
        items.slice(0, i).filter((item) => !$isNestedWrapper(item)).length;
    const middle = $createListNode(type, numberAt(first));
    middle.append(...items.slice(first, last + 1));
    list.insertAfter(middle);
    if (last < items.length - 1) {
        const after = $createListNode(type, numberAt(last + 1));
        after.append(...items.slice(last + 1));
        middle.insertAfter(after);
    }
    if (first === 0) list.remove();
};

const $isolateSelection = () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const [start, end] = selection.isBackward()
        ? [selection.focus, selection.anchor]
        : [selection.anchor, selection.focus];
    const startBlock = start.getNode().getTopLevelElement();
    const endBlock = end.getNode().getTopLevelElement();
    if (!startBlock || !endBlock) return;

    const blocks: LexicalNode[] = [];
    for (
        let block: LexicalNode | null = startBlock;
        block;
        block = block.getNextSibling()
    ) {
        blocks.push(block);
        if (block.is(endBlock)) break;
    }
    if (!blocks[blocks.length - 1].is(endBlock)) return;

    for (const block of blocks) {
        const isStart = block.is(startBlock);
        const isEnd = block.is(endBlock);
        if ($isParagraphNode(block)) {
            $splitNewlines(block);
            const breaks = $lineAt(block, block.getChildrenSize());
            if (breaks === 0) continue;
            const from = isStart
                ? $lineAt(block, $childIndex(block, start))
                : 0;
            const to = isEnd ? $lineAt(block, $childIndex(block, end)) : breaks;
            const startOnBlock = start.getNode().is(block);
            const endOnBlock = end.getNode().is(block);
            const split = $splitLines(block, from, to);
            // points on the removed paragraph itself need a new home
            if (isStart && startOnBlock)
                start.set(split[0].getKey(), 0, "element");
            if (isEnd && endOnBlock) {
                const last = split[split.length - 1];
                end.set(last.getKey(), last.getChildrenSize(), "element");
            }
        } else if ($isListNode(block)) {
            if (start.getNode().is(block) || end.getNode().is(block)) continue;
            let first = isStart ? $childIndex(block, start) : 0;
            // a selection starting in a sub-list belongs to the item above it
            while (first > 0 && $isNestedWrapper(block.getChildAtIndex(first)))
                first--;
            const last = isEnd
                ? $childIndex(block, end)
                : block.getChildrenSize() - 1;
            if (first >= 0 && last >= first) $isolateItems(block, first, last);
        }
    }
};

// "- ", "* ", "+ ", "1. " or "1) " typed at the start of a line. Lexical's
// own shortcut handles single-line paragraphs (except "1)"), but on a line
// with line breaks around it, it would pull every line into the item.
const MARKER = /^(?:([-*+])|(\d{1,9})([.)])) $/;

const $markerBeforeCaret = () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
    const node = selection.anchor.getNode();
    const paragraph = node.getParent();
    if (
        !$isTextNode(node) ||
        node.hasFormat("code") ||
        !$isParagraphNode(paragraph) ||
        !$isRootOrShadowRoot(paragraph.getParent())
    )
        return null;
    const offset = selection.anchor.offset;
    const before = node.getTextContent().slice(0, offset);
    const lineStart = before.lastIndexOf("\n");
    const match = MARKER.exec(before.slice(lineStart + 1));
    if (!match) return null;
    const previous = node.getPreviousSibling();
    const lineBegins =
        lineStart >= 0 || previous === null || $isLineBreakNode(previous);
    if (!lineBegins) return null;
    const blockStart = lineStart < 0 && previous === null;
    if (blockStart && !$isMultiline(paragraph) && match[3] !== ")") return null;
    return { node, paragraph, offset, number: match[2] };
};

const convertTypedMarkers = (editor: LexicalEditor) =>
    editor.registerUpdateListener(
        ({ tags, dirtyLeaves, editorState, prevEditorState }) => {
            if (
                dirtyLeaves.size === 0 ||
                tags.has(HISTORIC_TAG) ||
                editor.isComposing()
            )
                return;
            // a finished composition can add several characters at once
            const compositionEnd = tags.has(COMPOSITION_END_TAG);
            const previousOffset = prevEditorState.read(() => {
                const selection = $getSelection();
                return $isRangeSelection(selection) && selection.isCollapsed()
                    ? selection.anchor.offset
                    : null;
            });
            const typed = editorState.read(() => {
                const found = $markerBeforeCaret();
                return (
                    !!found &&
                    dirtyLeaves.has(found.node.getKey()) &&
                    (compositionEnd || previousOffset === found.offset - 1)
                );
            });
            if (!typed) return;
            editor.update(() => {
                const first = $markerBeforeCaret();
                if (!first) return;
                $splitNewlines(first.paragraph);
                const found = $markerBeforeCaret();
                if (!found) return;
                const { node, paragraph, offset, number } = found;
                const line = $lineAt(paragraph, node.getIndexWithinParent());
                const [own] = paragraph.getChildren().some($isLineBreakNode)
                    ? $splitLines(paragraph, line, line)
                    : [paragraph];
                node.spliceText(0, offset, "", false);
                const list = number
                    ? $createListNode("number", Number(number))
                    : $createListNode("bullet");
                const item = $createListItemNode();
                item.append(...own.getChildren());
                list.append(item);
                own.replace(list);
                item.selectStart();
                // undo brings back the typed marker, like Lexical's shortcuts
                $addUpdateTag(HISTORY_PUSH_TAG);
            });
        },
    );

const insertList = (type: ListType) => () => {
    $isolateSelection();
    $insertList(type);
};

const listActions = [
    [INSERT_UNORDERED_LIST_COMMAND, insertList("bullet")],
    [INSERT_ORDERED_LIST_COMMAND, insertList("number")],
    [INSERT_CHECK_LIST_COMMAND, insertList("check")],
    [
        REMOVE_LIST_COMMAND,
        () => {
            $isolateSelection();
            $removeList();
        },
    ],
] as const;

// Lines of pasted plain text that start with a bullet or number.
const LIST_LINE = /^[ \t]*(?:([-*+•◦▪‣])|(\d{1,9})[.)])[ \t]+(.*)$/;

const pasteListLines = (event: ClipboardEvent | KeyboardEvent | InputEvent) => {
    const data = "clipboardData" in event ? event.clipboardData : null;
    if (!data || data.types.includes("text/html")) return false;
    const lines = data.getData("text/plain").split(/\r\n?|\n/);
    if (!lines.some((line) => LIST_LINE.test(line))) return false;
    const selection = $getSelection();
    if (
        !$isRangeSelection(selection) ||
        selection.anchor.getNode().getParents().some($isListItemNode) ||
        $isListItemNode(selection.anchor.getNode())
    )
        return false;

    const blocks: LexicalNode[] = [];
    let list: ListNode | null = null;
    for (const line of lines) {
        const match = LIST_LINE.exec(line);
        if (match) {
            const type = match[2] ? "number" : "bullet";
            if (list?.getListType() !== type) {
                list = $createListNode(type, Number(match[2] ?? 1));
                blocks.push(list);
            }
            list.append(
                $createListItemNode().append($createTextNode(match[3])),
            );
        } else {
            list = null;
            if (line.trim())
                blocks.push(
                    $createParagraphNode().append($createTextNode(line)),
                );
        }
    }
    event.preventDefault();
    $insertNodes(blocks);
    return true;
};

// Runs in one update, so Lexical's merge of neighbouring same-type lists
// happens only after the change.
const register = (editor: LexicalEditor) =>
    mergeRegister(
        ...listActions.map(([command, action]) =>
            editor.registerCommand(
                command,
                () => {
                    action();
                    return true;
                },
                COMMAND_PRIORITY_HIGH,
            ),
        ),
        // Enter on an empty item in the middle of a numbered list keeps the
        // numbering going in the items after it.
        editor.registerCommand(
            INSERT_PARAGRAPH_COMMAND,
            () => $handleListInsertParagraph(true),
            COMMAND_PRIORITY_HIGH,
        ),
        // Tab anywhere in an item nests it, not just at the start. The editor
        // wrapper lets Tab through only when there's somewhere to move it.
        editor.registerCommand(
            KEY_TAB_COMMAND,
            (event) => {
                const selection = $getSelection();
                const node = $isRangeSelection(selection)
                    ? selection.anchor.getNode()
                    : null;
                if (
                    !node ||
                    ![node, ...node.getParents()].some($isListItemNode)
                )
                    return false;
                event.preventDefault();
                return editor.dispatchCommand(
                    event.shiftKey
                        ? OUTDENT_CONTENT_COMMAND
                        : INDENT_CONTENT_COMMAND,
                    undefined,
                );
            },
            COMMAND_PRIORITY_HIGH,
        ),
        editor.registerCommand(
            PASTE_COMMAND,
            pasteListLines,
            COMMAND_PRIORITY_HIGH,
        ),
        convertTypedMarkers(editor),
    );

export const listCommandsPlugin = realmPlugin({
    init(realm) {
        realm.pub(createRootEditorSubscription$, register);
    },
});
