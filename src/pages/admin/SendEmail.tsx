import { Button, Box, Typography, TextField } from "@mui/material";

import { supabase } from "../../supabaseClient";

import { useSnackbar } from "notistack";

import { useState } from "react";

type BodyType = {
    recipient: {
        recipient_type: "INDIVIDUAL" | "ORGANIZATION",
        recipient_address: string | number
    },
    content: {
        content_type: 'TEMPLATE' | 'CUSTOM',
        content_title: string,
        content_body: string,
        content_parameters?: string[]
    }
}

const SendEmail = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [text, setText] = useState("");

    const sendEmail = async () => {
        let body : BodyType = {
            recipient: {
                recipient_type: 'ORGANIZATION',
                recipient_address: 2
            },
            content: {
                content_type: 'TEMPLATE',
                content_title: "should not work, randy is not in org",
                content_body: 'MEETING_CREATE',
                content_parameters: ['SUIT', 'Title: New meeting', 'Desc: Temp Desc', 'Time: some time in the future']
            }
        }

        const { data, error } = await supabase.functions.invoke('send-email', 
            { 
                body
            }
        );

        if (error || !data) {
            return enqueueSnackbar(error.message, { variant: 'error' })
        }

        // data.identifier is my breakpoint function's unique string for debugging. please keep this here, debugging edge functions is such a pain
        enqueueSnackbar(`Sent email!${data.identifier ? ` ${data.identifier}` : ""}`, { variant: 'success' })
    }

    return (
        <Box>
            <Typography variant='h1'>Send Email</Typography>
            <Button variant='contained' onClick={sendEmail}>Send Email unrelated</Button>
            <TextField value={email} onChange={(e) => setEmail(e.target.value)} label='recipient email' />
            <TextField value={subject} onChange={(e) => setSubject(e.target.value)} label='subject' />
            <TextField value={text} onChange={(e) => setText(e.target.value)} label='body' />
        </Box>
    )
}

export default SendEmail;