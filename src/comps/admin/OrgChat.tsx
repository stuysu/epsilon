import { Box, TextField, Button } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { supabase } from "../../supabaseClient"
import { useSnackbar } from "notistack"
import UserContext from "../context/UserContext"

type OrgMessage = {
    id: number,
    content: string,
    users: {
        id: number,
        first_name: string,
        last_name: string,
        picture?: string
    }
}

const OrgChat = (
    {
        organization_id
    } :
    {
        organization_id: number
    }
) => {
    const user = useContext(UserContext);
    const [messages, setMessages] = useState<OrgMessage[]>([]);
    const [message, setMessage] = useState("");
    const { enqueueSnackbar } = useSnackbar();

    // fetch messages from the database
    useEffect(() => {
        const fetchMessages = async () => {
            const { data: messageData, error: messageError } = await supabase.from("orgmessages")
                .select(`
                    id,
                    content,
                    users!inner (
                        id,
                        first_name,
                        last_name,
                        picture
                    ) 
                `)
                .eq('organization_id', organization_id)
                .returns<OrgMessage[]>();
            
            if (messageError) {
                enqueueSnackbar("Failed to fetch messages", { variant: "error" });
                return;
            }

            setMessages(messageData);
        }

        fetchMessages();
    }, []);

    const sendMessage = async () => {
        const { data, error } = await supabase.functions.invoke(
            "create-organization-message",
            {
                body: {
                    organization_id,
                    content: message
                }
            }
        )

        if (error || !data) {
            enqueueSnackbar("Failed to send message", { variant: "error" });
            return;
        }

        setMessage("");
        setMessages([
            ...messages, 
            { 
                id: data.id, 
                content: message, 
                users: {
                    id: user.id, 
                    first_name: user.first_name, 
                    last_name: user.last_name, 
                    picture: user.picture
                } 
            } 
        ]);
    }

    return (
        <Box>
            <Box>
                {
                    messages.map(message => (
                        <Box key={message.id}>
                            <img src={message.users.picture} alt="User's profile" />
                            <p>{message.users.first_name} {message.users.last_name}</p>
                            <p>{message.content}</p>
                        </Box>
                    ))
                }
                <Box>
                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} />
                    <Button onClick={sendMessage}>Submit</Button>
                </Box>
            </Box>
        </Box>
    )
}

export default OrgChat;