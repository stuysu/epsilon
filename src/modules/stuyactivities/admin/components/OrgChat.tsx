import {
    Avatar,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import UserContext from "../../../../contexts/UserContext";
import dayjs from "dayjs";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";

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
    const { enqueueSnackbar } = useSnackbar();

    const chatBoxRef = useRef<HTMLDivElement>(null);

    // fetch messages from the database
    useEffect(() => {
        let isMounted = true;
        const fetchMessages = async () => {
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

            if (!isMounted) return;

            if (messageError) {
                enqueueSnackbar("Failed to fetch messages", {
                    variant: "error",
                });
                return;
            }

            setMessages(
                messageData.sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime(),
                ),
            );
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 1000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [organization_id, enqueueSnackbar]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]); // Assuming `messages` is your state variable that holds the chat messages

    const sendMessage = async () => {
        if (!message) {
            enqueueSnackbar("Message cannot be empty", { variant: "error" });
            return;
        }

        const { data, error } = await supabase.functions.invoke(
            "create-organization-message",
            {
                body: {
                    organization_id,
                    content: message,
                },
            },
        );

        if (error || !data) {
            enqueueSnackbar("Failed to send message", { variant: "error" });
            return;
        }

        setMessage("");
        let newMessages = [
            ...messages,
            {
                id: data.id,
                content: message,
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

    const deleteMessage = async (messageId: number) => {
        const { error } = await supabase
            .from("orgmessages")
            .delete()
            .eq("id", messageId);

        if (error) {
            enqueueSnackbar("Failed to delete message", { variant: "error" });
            return;
        }

        setMessages(messages.filter((message) => message.id !== messageId));
    };

    return (
        <section className="p-4 relative rounded-xl border border-divider">
            <h2>Messaging</h2>
            <p>
                Only visible to admins, faculty, and the Clubs & Pubs
                Department.
            </p>
            <div className={"h-96 overflow-auto relative"} ref={chatBoxRef}>
                {messages.map((message) => {
                    let messageTime = dayjs(message.created_at);
                    let timeStr = `${messageTime.month() + 1}/${messageTime.date()}/${messageTime.year()}`;
                    return (
                        <ListItem key={message.id}>
                            <ListItemAvatar>
                                <Avatar
                                    alt={message.users.first_name}
                                    src={message.users.picture || ""}
                                >
                                    {message.users.first_name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    message.users.first_name +
                                    " " +
                                    message.users.last_name
                                }
                                secondary={
                                    <>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="textPrimary"
                                        >
                                            {timeStr}
                                        </Typography>
                                        <br />
                                        {message.content}
                                    </>
                                }
                            />
                            {message.users.id === user.id && (
                                <div
                                    className={
                                        "bx bx-trash bx-sm text-red cursor-pointer hover:opacity-75 transition-opacity"
                                    }
                                    onClick={() => deleteMessage(message.id)}
                                ></div>
                            )}
                        </ListItem>
                    );
                })}
            </div>
            <div className={"w-full flex items-center mt-2"}>
                <TextField
                    variant="filled"
                    label="Type message here."
                    sx={{ width: "90%", marginRight: "15px" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();

                            if (message) {
                                sendMessage();
                            }
                        }
                    }}
                />
                <AsyncButton
                    variant="contained"
                    sx={{ width: "10%" }}
                    onClick={sendMessage}
                >
                    Send
                </AsyncButton>
            </div>
        </section>
    );
};

export default OrgChat;
