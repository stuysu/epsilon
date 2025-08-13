import {
    Avatar,
    Box,
    Card,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import { supabase } from "../../../../lib/supabaseClient";

import React, { useContext, useState } from "react";

import PostEditor from "../org_admin/components/PostEditor";
import { useSnackbar } from "notistack";

import dayjs from "dayjs";
import OrgContext from "../../../../contexts/OrgContext";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";

/* This post component will serve as both the org_admin and member post. depending on role, differeing functionality */
const OrgStreamPost = ({
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
        enqueueSnackbar("OrgStreamPost deleted!", { variant: "success" });
    };

    if (editing) {
        return (
            <PostEditor
                content={content}
                orgId={content.organizations?.id as number}
                orgName={content.organizations?.name as string}
                orgPicture={content.organizations?.picture as string}
                onCancel={() => setEditing(false)}
                onSave={(newData) => {
                    let postIndex = organization.posts.findIndex(
                        (p) => p.id === newData.id,
                    );

                    if (!~postIndex)
                        return enqueueSnackbar(
                            "Could not update frontend. Refresh to see changes.",
                            { variant: "warning" },
                        );

                    if (organization.setOrg) {
                        organization.setOrg({
                            ...organization,
                            posts: [
                                ...organization.posts.slice(0, postIndex),
                                newData,
                                ...organization.posts.slice(postIndex + 1),
                            ],
                        });
                    }

                    setEditing(false);
                }}
            />
        );
    }

    let isEdited = content.created_at !== content.updated_at;
    let postTime = isEdited
        ? dayjs(content.updated_at)
        : dayjs(content.created_at);
    let timeStr = `${postTime.month() + 1}/${postTime.date()}/${postTime.year()}`;

    return (
        <article>
            <Card
                variant="outlined"
                sx={{
                    borderRadius: "12px",
                    position: "relative",
                    marginBottom: "10px",
                    padding: "15px",
                    border: "none",
                    height: "400px",
                    boxShadow: "inset rgba(255, 255, 255, 0.5) 0px 0px 1px",
                }}
            >
                <div
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                        width: "25vw",
                        height: "1px",
                        position: "absolute",
                        top: "0px",
                        opacity: 0.3,
                        zIndex: 40,
                    }}
                ></div>

                <ListItem>
                    <ListItemAvatar>
                        <Avatar
                            alt={content.organizations?.name}
                            src={content.organizations?.picture || ""}
                            sx={{ objectFit: "cover" }}
                        >
                            {content.organizations?.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                        primary={content.organizations?.name}
                        secondary={timeStr + (isEdited ? " [Edited]" : "")}
                    />
                </ListItem>

                <Typography
                    variant="h3"
                    width="100%"
                    sx={{
                        overflow: "hidden",
                        paddingLeft: "15px",
                        paddingRight: "15px",
                        paddingBottom: "10px",
                        textOverflow: "ellipsis",
                    }}
                >
                    {content.title}
                </Typography>

                <div className={"relative"}>
                    <div
                        className={
                            "absolute bg-gradient-to-b from-[#111111] to-transparent z-20 h-5 w-full -top-1"
                        }
                    ></div>
                    <Box
                        sx={{
                            width: "100%",
                            maxHeight: "260px",
                            overflowY: "auto",
                        }}
                    >
                        <br />
                        <Typography
                            variant="body1"
                            width="100%"
                            sx={{
                                whiteSpace: "pre-line",
                                paddingLeft: "15px",
                                paddingRight: "15px",
                            }}
                        >
                            {content.description}
                            <br />
                            <br />
                            <br />
                        </Typography>
                    </Box>
                </div>

                <Box sx={{ marginTop: "20px" }}>
                    {editable && (
                        <>
                            <AsyncButton
                                onClick={deletePost}
                                variant="contained"
                            >
                                Delete
                            </AsyncButton>
                            <AsyncButton
                                onClick={() => setEditing(true)}
                                variant="contained"
                                sx={{ marginLeft: "10px" }}
                            >
                                Edit
                            </AsyncButton>
                        </>
                    )}
                </Box>
            </Card>
        </article>
    );
};

export default OrgStreamPost;
