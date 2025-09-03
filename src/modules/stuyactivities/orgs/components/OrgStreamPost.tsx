import { supabase } from "../../../../lib/supabaseClient";

import React, { useContext, useState } from "react";

import PostEditor from "../org_admin/components/PostEditor";
import { useSnackbar } from "notistack";

import dayjs from "dayjs";
import OrgContext from "../../../../contexts/OrgContext";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import { Avatar } from "radix-ui";

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
        enqueueSnackbar("Post deleted!", { variant: "success" });
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
        <article className="w-full relative p-1 rounded-xl h-fit max-h-96 border-none shadow-module bg-layer-1">
            <div className={"flex items-center gap-2 m-4"}>
                <Avatar.Root className="w-10 h-10 rounded-md overflow-hidden block">
                    <Avatar.Image
                        className="size-full object-cover"
                        src={content.organizations?.picture || ""}
                        alt={content.organizations?.name}
                    />
                    <Avatar.Fallback
                        className="text-center size-full flex items-center justify-center bg-layer-3 text-xl relative pt-1 text-typography-2"
                        delayMs={600}
                    >
                        {content.organizations?.name?.charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                </Avatar.Root>

                <div className={"mt-1.5"}>
                    <h4>{content.organizations?.name}</h4>
                    <p>{timeStr + (isEdited ? " · Edited" : "")}</p>
                </div>
            </div>

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

            <div className={"bg-layer-2 p-4 rounded-lg h-fit"}><h3
                className={
                    "mb-4 max-h-[2lh] overflow-ellipsis overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                }
            >
                {content.title}
            </h3>

                <div className={"w-full overflow-y-scroll relative min-h-full max-h-[8lh]"}>
                    <p>{content.description}</p>
                </div>

                <div className="absolute top-5 right-5">
                    {editable && (
                        <>
                            <AsyncButton onClick={deletePost} variant="contained">
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
                </div>
            </div>
        </article>
    );
};

export default OrgStreamPost;
