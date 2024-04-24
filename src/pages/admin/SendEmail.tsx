import { Button, Box, Typography, TextField } from "@mui/material";

import { supabase } from "../../supabaseClient";

import { useSnackbar } from "notistack";

import { useState } from "react";

const SendEmail = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [text, setText] = useState("");

    const sendEmail = async () => {
        const { data, error } = await supabase.functions.invoke('send-email', 
            { 
                body: {
                    recipient_email: email, subject: subject, text: text
                }
            }
        );

        if (error || !data) {
            return enqueueSnackbar(error.message, { variant: 'error' })
        }

        enqueueSnackbar("Sent email!", { variant: 'success' })
    }

    return (
        <Box>
            <Typography variant='h1'>Send Email</Typography>
            <Button variant='contained' onClick={sendEmail}>Send Email</Button>
            <TextField value={email} onChange={(e) => setEmail(e.target.value)} label='recipient email' />
            <TextField value={subject} onChange={(e) => setSubject(e.target.value)} label='subject' />
            <TextField value={text} onChange={(e) => setText(e.target.value)} label='body' />
        </Box>
    )
}

export default SendEmail;