import { Box, TextField, Button } from "@mui/material";
import { useEffect, useState, ChangeEvent } from "react";

import { supabase } from "../../../../supabaseClient";
import { useSnackbar } from "notistack";

let editableFieilds = ["title", "description"];

/* if content is null, then it is creating post */
const PostEditor = ({
    content,
    orgId,
    onSave,
    onCancel,
    onCreate,
}: {
    content?: Post;
    orgId: number;
    onSave?: (newData: Post) => void;
    onCancel?: () => void;
    onCreate?: (newData: Post) => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();

    let [postData, setPostData] = useState<Partial<Post>>({
        id: undefined,
        organization_id: orgId,
        title: undefined,
        description: undefined,
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
        let { data, error } = await supabase
            .from("posts")
            .insert(postData)
            .select();

        if (error || !data) {
            return enqueueSnackbar(
                "Could not create post. Please contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        // reset values
        setPostData({
            id: undefined,
            organization_id: orgId,
            title: undefined,
            description: undefined,
            created_at: undefined,
            updated_at: undefined,
        });

        if (onCreate) onCreate(data[0] as Post);
        enqueueSnackbar("Post created!", { variant: "success" });
    };

    const savePost = async () => {
        let { data, error } = await supabase
            .from("posts")
            .update(postData)
            .eq("id", postData.id)
            .select();

        if (error || !data) {
            return enqueueSnackbar(
                "Could not update post. Please contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        if (onSave) onSave(data[0] as Post);
        enqueueSnackbar("Post updated!", { variant: "success" });
    };

    return (
        <Box>
            <h1>{content ? "Update Post" : "Create Post"}</h1>
            <Box bgcolor="background.default" color="primary.contrastText">
                {editableFieilds.map((field, i) => {
                    let key: keyof Post = field as keyof Post;

                    return (
                        <Box key={i}>
                            {field}
                            <TextField
                                value={postData[key] || ""}
                                name={field}
                                onChange={onChange}
                            />
                        </Box>
                    );
                })}
            </Box>

            {content ? (
                <>
                    <Button onClick={savePost}>Save</Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </>
            ) : (
                <Button onClick={createPost}>Create</Button>
            )}
        </Box>
    );
};

export default PostEditor;
