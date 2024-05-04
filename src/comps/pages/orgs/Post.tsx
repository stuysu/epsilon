import { Box, Button, Paper, Typography } from "@mui/material";
import { supabase } from "../../../supabaseClient";

import { useState, useContext } from "react";

import PostEditor from "./admin/PostEditor";
import { useSnackbar } from "notistack";

import dayjs from "dayjs";
import OrgContext from "../../context/OrgContext";

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
    const organization = useContext(OrgContext);

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
                content={content}
                orgId={content.organization_id}
                onCancel={() => setEditing(false)}
                onSave={(newData) => {
                    let postIndex = organization.posts.findIndex(p => p.id === newData.id);

                    if (!~postIndex) return enqueueSnackbar("Could not update frontend. Refresh to see changes.", { variant: 'warning' });

                    if (organization.setOrg) {
                        organization.setOrg(
                            {
                                ...organization,
                                posts: [
                                    ...organization.posts.slice(0, postIndex),
                                    newData,
                                    ...organization.posts.slice(postIndex + 1)
                                ]
                            }
                        )
                    }

                    setEditing(false);
                }}
            />
        );
    }

    let isEdited = content.created_at !== content.updated_at;
    let postTime = isEdited ? dayjs(content.updated_at) : dayjs(content.created_at);
    let timeStr = `${postTime.month()+1}/${postTime.date()}/${postTime.year()}`

    return (
        <Paper elevation={1} sx={{ width: '500px', margin: '10px', padding: '15px', height: '350px'}}>
            <Box sx={{ width: '100%', display: 'flex', flexWrap: 'nowrap'}}>
                <Box sx={{ width: '70%'}}>
                    <Typography variant='h3' width='100%'>{content.title}</Typography>
                </Box>
                <Box sx={{ width: '30%', display: 'flex', justfiyContent: 'center', alignItems: 'center'}}>
                    <Typography>{timeStr}{isEdited ? " [Edited]" : ""}</Typography>
                </Box>
            </Box>
            <Box sx={{ width: '100%', height: '200px', overflowY: 'auto'}}>
                <Typography variant='body1' width='100%'>{content.description}</Typography>
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
