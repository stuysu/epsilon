import {
    Box,
    TextField,
    Card,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    IconButton,
} from "@mui/material";
import { useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { useSnackbar } from "notistack";
import UserContext from "../context/UserContext";
import dayjs from "dayjs";
import { Delete } from "@mui/icons-material";
import AsyncButton from "../ui/AsyncButton";

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
        <Card
            variant="outlined"
            sx={{
                width: "100%",
                padding: "15px",
            }}
        >
            <Typography variant="h2">Messages</Typography>
            <Box sx={{ height: "400px", overflow: "auto" }} ref={chatBoxRef}>
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
                                        {/* Add a break or any other separator as needed */}
                                        <br />
                                        {message.content}
                                    </>
                                }
                            />
                            {message.users.id === user.id && (
                                <IconButton
                                    onClick={() => deleteMessage(message.id)}
                                >
                                    <Delete />
                                </IconButton>
                            )}
                        </ListItem>
                    );
                })}
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                }}
            >
                <TextField
                    label="Type message here."
                    sx={{ width: "80%", marginRight: "15px" }}
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
                    sx={{ width: "20%" }}
                    onClick={sendMessage}
                >
                    Send
                </AsyncButton>
            </Box>
        </Card>
    );
};

export default OrgChat;
