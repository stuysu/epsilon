import React, { useContext } from "react";

import OrgStreamPost from "../../components/OrgStreamPost";
import PostEditor from "../components/PostEditor";

import OrgContext from "../../../../../contexts/OrgContext";
import { Box } from "@mui/material";

import { sortPostByDate } from "../../../../../utils/DataFormatters";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";

/* create new posts */
/* fetch existing posts to update or delete */
const Posts = () => {
    const organization = useContext(OrgContext);

    if (
        organization.state === "LOCKED" ||
        organization.state === "PENDING" ||
        organization.state === "PUNISHED"
    )
        return (
            <ContentUnavailable
                icon="bx-message-alt-x"
                iconColor="text-red"
                title="Cannot Create Posts"
                description="This Activity does not yet meet the requirements to post updates."
            />
        );

    return (
        <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            <PostEditor
                orgId={organization.id}
                orgName={organization.name}
                orgPicture={organization.picture as string}
                onCreate={(newPost) => {
                    if (organization.setOrg) {
                        organization.setOrg({
                            ...organization,
                            posts: [...organization.posts, newPost],
                        });
                    }
                }}
            />
            {organization.posts
                .sort(sortPostByDate)
                .reverse()
                .map((post, i) => {
                    return (
                        <OrgStreamPost
                            content={post}
                            editable
                            onDelete={() => {
                                if (organization.setOrg) {
                                    organization.setOrg({
                                        ...organization,
                                        posts: organization.posts.filter(
                                            (p) => p.id !== post.id,
                                        ),
                                    });
                                }
                            }}
                        />
                    );
                })}
        </Box>
    );
};

export default Posts;
