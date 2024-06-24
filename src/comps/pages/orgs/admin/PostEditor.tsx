import { Paper, Box, TextField, Button, Typography } from "@mui/material";
import { useEffect, useState, ChangeEvent } from "react";

import { supabase } from "../../../../supabaseClient";
import { useSnackbar } from "notistack";

/* if content is null, then it is creating post */
const PostEditor = ({
    content,
    orgId,
    orgName,
    orgPicture,
    onSave,
    onCancel,
    onCreate,
}: {
    content?: Post;
    orgId?: number;
    orgName?: string;
    orgPicture?: string;
    onSave?: (newData: Post) => void;
    onCancel?: () => void;
    onCreate?: (newData: Post) => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();

    let [postData, setPostData] = useState<Partial<Post>>({
        id: undefined,
        organizations: {
            id: orgId,
            name: orgName,
            picture: orgPicture,
        },
        title: "",
        description: "",
        created_at: undefined,
        updated_at: undefined,
    });

    useEffect(() => {
        if (content) {
            setPostData(content);
        }
    }, [content]);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setPostData({
            ...postData,
            [name]: value,
        });
    };

    const createPost = async () => {
        if (!postData.title) {
            return enqueueSnackbar("Missing post title.", { variant: "error" });
        }
        if (!postData.description) {
            return enqueueSnackbar("Missing post description.", {
                variant: "error",
            });
        }

        let payload = {
            title: postData.title,
            description: postData.description,
            organization_id: orgId,
        }

        let { data, error } = await supabase.functions.invoke("create-post", {
            body: payload,
        });

        if (error || !data) {
            return enqueueSnackbar(
                "Could not create post. Please contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        // reset values
        setPostData({
            id: undefined,
            organizations: {
                id: orgId,
                name: orgName,
                picture: orgPicture,
            },
            title: "",
            description: "",
            created_at: undefined,
            updated_at: undefined,
        });

        data.organizations = {
            id: orgId,
            name: orgName,
            picture: orgPicture
        }

        if (onCreate) onCreate(data as Post);
        enqueueSnackbar("Post created!", { variant: "success" });
    };

    const savePost = async () => {
        let payload = {
            title: postData.title,
            description: postData.description
        }

        let { data, error } = await supabase
            .from("posts")
            .update(payload)
            .eq("id", postData.id)
            .select();

        if (error || !data) {
            return enqueueSnackbar(
                "Could not update post. Please contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        data[0].organizations = {
            id: orgId,
            name: orgName,
            picture: orgPicture
        }

        if (onSave) onSave(data[0] as Post);
        enqueueSnackbar("Post updated!", { variant: "success" });
    };

    return (
        <Paper
            elevation={1}
            sx={{
                width: "550px",
                padding: "15px",
                height: "400px",
                margin: "10px",
            }}
        >
            <Typography variant="h3" width="100%">
                {content ? "Update Post" : "Create Post"}
            </Typography>
            <Box sx={{ marginBottom: "10px" }}>
                <TextField
                    value={postData["title"]}
                    name={"title"}
                    label="Title"
                    onChange={onChange}
                    fullWidth
                />

                <TextField
                    value={postData["description"]}
                    name={"description"}
                    label="Description"
                    onChange={onChange}
                    fullWidth
                    multiline
                    rows={7}
                    sx={{ marginTop: "10px" }}
                />
            </Box>

            {content ? (
                <>
                    <Button onClick={savePost} variant="contained">
                        Save
                    </Button>
                    <Button
                        onClick={onCancel}
                        variant="contained"
                        sx={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </Button>
                </>
            ) : (
                <Button onClick={createPost} variant="contained">
                    Create
                </Button>
            )}
        </Paper>
    );
};

export default PostEditor;
