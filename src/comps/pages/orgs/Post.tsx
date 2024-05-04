import { Box, Button, Paper, Typography } from "@mui/material";
import { supabase } from "../../../supabaseClient";

import { useEffect, useState } from "react";

import PostEditor from "./admin/PostEditor";
import { useSnackbar } from "notistack";

import dayjs from "dayjs";

/* This post component will serve as both the admin and member post. depending on role, differeing functionality */
const Post = ({
    content,
    editable,
    onDelete,
}: {
    content: Post;
    editable?: boolean;
    onDelete?: () => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [editing, setEditing] = useState(false);
    const [postData, setPostData] = useState(content);

    useEffect(() => setPostData(content), [content]);

    const deletePost = async () => {
        let { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", content.id);

        if (error) {
            return enqueueSnackbar(
                "Could not delete post. Contact it@stuysu.org for support",
                { variant: "error" },
            );
        }

        if (onDelete) onDelete();
        enqueueSnackbar("Post deleted!", { variant: "success" });
    };

    if (editing) {
        return (
            <PostEditor
                content={postData}
                orgId={content.organization_id}
                onCancel={() => setEditing(false)}
                onSave={(newData) => {
                    setPostData(newData);
                    setEditing(false);
                }}
            />
        );
    }

    let isEdited = postData.created_at !== postData.updated_at;

    return (
        <Paper elevation={1} sx={{ width: '500px', margin: '10px', padding: '15px', height: '350px'}}>
            <Box sx={{ width: '100%', display: 'flex', flexWrap: 'nowrap'}}>
                <Box sx={{ width: '80%'}}>
                    <Typography variant='h3' width='100%'>{postData.title}</Typography>
                </Box>
                <Box sx={{ width: '20%', display: 'flex', justfiyContent: 'center', alignItems: 'center'}}>
                    <Typography>{isEdited ? "[Edited]" : ""}</Typography>
                </Box>
            </Box>
            <Box sx={{ width: '100%', height: '200px', overflowY: 'auto'}}>
                <Typography variant='body1' width='100%'>{postData.description}</Typography>
            </Box>
            <Box sx={{ marginTop: '20px'}}>
                {editable && (
                    <>
                        <Button onClick={deletePost} variant='contained'>Delete</Button>
                        <Button onClick={() => setEditing(true)} variant='contained' sx={{ marginLeft: '10px'}}>Edit</Button>
                    </>
                )}
            </Box>
        </Paper>
    );
};

export default Post;
