import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import useLiveRefresh from "../../../../utils/useLiveRefresh";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import UserContext from "../../../../contexts/UserContext";
import { toNewYork } from "../../../../utils/NewYorkTime";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import MarkupDisplayer from "../../../../components/markup/MarkupDisplayer";
import MarkupEditor from "../../../../components/markup/MarkupEditor";
import isBlankMarkdown from "../../../../components/markup/isBlankMarkdown";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import { Avatar } from "radix-ui";

type OrgMessage = {
    id: number;
    content: string;
    users: {
        id: number;
        first_name: string;
        last_name: string;
        picture?: string;
    };
    created_at: string;
};

const OrgChat = ({ organization_id }: { organization_id: number }) => {
    const user = useContext(UserContext);
    const [messages, setMessages] = useState<OrgMessage[]>([]);
    const [message, setMessage] = useState("");
    const [editorKey, setEditorKey] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    const chatBoxRef = useRef<HTMLDivElement>(null);

    const request = useRef(0);
    const failing = useRef(false);

    const fetchMessages = useCallback(async () => {
        const id = ++request.current;
        const { data: messageData, error: messageError } = await supabase
            .from("orgmessages")
            .select(
                `
                id,
                content,
                users!inner (
                    id,
                    first_name,
                    last_name,
                    picture
                ),
                created_at
            `,
            )
            .eq("organization_id", organization_id)
            .returns<OrgMessage[]>();

        if (id !== request.current) return;

        // polling keeps failing while offline; say so once
        if (messageError) {
            if (!failing.current) {
                failing.current = true;
                enqueueSnackbar("Failed to fetch messages", {
                    variant: "error",
                });
            }
            return;
        }
        failing.current = false;

        const sorted = messageData.sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
        );
        setMessages((prev) =>
            prev.length === sorted.length &&
            prev.every((m, i) => m.id === sorted[i].id)
                ? prev
                : sorted,
        );
    }, [organization_id, enqueueSnackbar]);

    // pauses while the tab is hidden
    useLiveRefresh(fetchMessages, 10000);

    const lastCount = useRef(0);
    useEffect(() => {
        if (chatBoxRef.current && messages.length > lastCount.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
        lastCount.current = messages.length;
    }, [messages]);

    const sendMessage = async () => {
        const content = message.trim();
        if (isBlankMarkdown(content)) {
            enqueueSnackbar("Message cannot be empty", { variant: "error" });
            return;
        }

        const { data, error } = await supabase.functions.invoke(
            "create-organization-message",
            {
                body: {
                    organization_id,
                    content,
                },
            },
        );

        if (error || !data) {
            enqueueSnackbar("Failed to send message", { variant: "error" });
            return;
        }

        setMessage("");
        setEditorKey((k) => k + 1);
        const newMessages = [
            ...messages,
            {
                id: data.id,
                content,
                users: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    picture: user.picture,
                },
                created_at: new Date().toISOString(),
            },
        ];
        setMessages(
            newMessages.sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
            ),
        );
    };

    const [pendingDelete, setPendingDelete] = useState<number>();

    const deleteMessage = async (messageId: number) => {
        const { error } = await supabase
            .from("orgmessages")
            .delete()
            .eq("id", messageId);

        if (error) {
            enqueueSnackbar("Failed to delete message", { variant: "error" });
            return;
        }

        setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    return (
        <section className="p-6 relative rounded-3xl shadow-prominent">
            <h4>Messaging</h4>
            <p>
                Only visible to Activity admins and the Clubs & Pubs Department.
            </p>
            <div className={"h-96 overflow-auto relative"} ref={chatBoxRef}>
                {messages.map((message) => {
                    const messageTime = toNewYork(message.created_at);
                    const timeStr = messageTime.format("M/D/YYYY h:mm A");
                    return (
                        <article
                            key={message.id}
                            className={
                                "my-6 bg-layer-1 p-3 rounded-xl shadow-control"
                            }
                        >
                            <div className={"mb-3 flex items-center gap-3"}>
                                <Avatar.Root className="w-10 h-10 rounded-md overflow-hidden block">
                                    <Avatar.Image
                                        className="size-full object-cover"
                                        src={message.users.picture || ""}
                                        alt={message.users.first_name}
                                    />
                                    <Avatar.Fallback
                                        className="text-center size-full flex items-center justify-center bg-layer-3 text-xl relative pt-1 text-typography-1"
                                        delayMs={600}
                                    >
                                        {message.users.first_name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </Avatar.Fallback>
                                </Avatar.Root>
                                <div className={"min-w-0 flex-1"}>
                                    <h4 className={"wrap-break-word"}>
                                        {message.users.first_name +
                                            " " +
                                            message.users.last_name}
                                    </h4>
                                    <p>{timeStr}</p>
                                </div>
                                {message.users.id === user.id && (
                                    <button
                                        type="button"
                                        aria-label="Delete message"
                                        className={
                                            "flex size-11 shrink-0 items-center justify-center rounded-lg text-red transition-colors sm:hover:bg-layer-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-typography-1"
                                        }
                                        onClick={() =>
                                            setPendingDelete(message.id)
                                        }
                                    >
                                        <i
                                            aria-hidden="true"
                                            className={"bx bx-trash text-xl"}
                                        />
                                    </button>
                                )}
                            </div>

                            <div className={"rounded-lg bg-layer-2 p-4"}>
                                <MarkupDisplayer
                                    className="wrap-break-word"
                                    text={message.content}
                                />
                            </div>
                        </article>
                    );
                })}
            </div>
            {/* Send sits beside the box only when the chat itself is wide;
                it's shown in narrow side panels too */}
            <div className="@container mt-2 w-full">
                <div className="flex flex-col gap-2 @lg:flex-row @lg:items-end @lg:gap-4">
                    <MarkupEditor
                        key={editorKey}
                        onChange={setMessage}
                        onSubmit={sendMessage}
                        placeholder="Send a message"
                        submitVerb="send"
                        ariaLabel="Message"
                        compact
                    />
                    <AsyncButton className="shrink-0" onClick={sendMessage}>
                        Send
                    </AsyncButton>
                </div>
            </div>
            <UserDialog
                title="Delete this message?"
                description="It will be removed for everyone in this chat. This can't be undone."
                open={pendingDelete !== undefined}
                onClose={() => setPendingDelete(undefined)}
                onConfirm={() =>
                    pendingDelete !== undefined && deleteMessage(pendingDelete)
                }
                confirmText="Delete"
            />
        </section>
    );
};

export default OrgChat;
