import { Box, FormControlLabel, Switch, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";

import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import { MarkupEditor } from "../../../../../components/MarkupUtil";

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
    const [silent, setSilent] = useState(false);

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
            silent,
        };

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
        setSilent(false);
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
            picture: orgPicture,
        };

        if (onCreate) onCreate(data as Post);
        enqueueSnackbar("Post created!", { variant: "success" });
    };

    const savePost = async () => {
        let payload = {
            title: postData.title,
            description: postData.description,
        };

        // There is no need for .limits(1) since id is primary_key/unique
        let { data, error } = await supabase
            .from("posts")
            .update(payload)
            .eq("id", postData.id)
            .select()
            .single();

        if (error) {
            return enqueueSnackbar(
                "Could not update post. Please contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        data.organizations = {
            id: orgId,
            name: orgName,
            picture: orgPicture,
        };

        if (onSave) onSave(data as Post);
        enqueueSnackbar("Post updated!", { variant: "success" });
    };

    return (
        <div className={"bg-layer-1 p-5 pl-7 pb-8 rounded-xl shadow-prominent"}>
            <h1>{content ? "Update Post" : "Create Post"}</h1>
            <Box sx={{ marginY: "10px" }}>
                <div style={{
                    marginBottom: "1rem"
                }}>
                <MarkupEditor
                    callback={(value) => {
                        setPostData({
                            ...postData,
                            title: value,
                        });
                        
                    }}
                    defaultText="Title"
                    insertText={content?.title}
                />
                </div>
                
                <MarkupEditor
                    callback={(value) => {
                        setPostData({
                            ...postData,
                            description: value,
                        });
                    }}
                    editableClassName="description"
                    defaultText="Description"
                    insertText={content?.description}
                />
                
            </Box>
            {content ? (
                <>
                    <AsyncButton onClick={savePost} variant="contained">
                        Save
                    </AsyncButton>
                    <AsyncButton
                        onClick={onCancel}
                        variant="contained"
                        sx={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </AsyncButton>
                </>
            ) : (
                <AsyncButton onClick={createPost} variant="contained">
                    Create
                </AsyncButton>
            )}{" "}
            {!content && (
                <FormControlLabel
                    control={
                        <Switch
                            checked={silent}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setSilent(event.target.checked)
                            }
                        />
                    }
                    label="silent?"
                    sx={{ marginLeft: "10px", marginBottom: 0 }}
                />
            )}
        </div>
    );
};

export default PostEditor;
