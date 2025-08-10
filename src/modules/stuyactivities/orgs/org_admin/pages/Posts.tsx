import React, { useContext } from "react";

import OrgStreamPost from "../../components/OrgStreamPost";
import PostEditor from "../components/PostEditor";

import OrgContext from "../../../../../contexts/OrgContext";
import { Box, Typography } from "@mui/material";

import { sortPostByDate } from "../../../../../utils/DataFormatters";

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
            <Box
                sx={{
                    minHeight: "55vh",
                    marginBottom: "5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <i className="bx bx-no-entry bx-lg text-red-500 mb-5"></i>
                <Typography variant="h1" marginBottom={3}>
                    Cannot Create Posts
                </Typography>
                <Typography variant="body1">
                    {`This Activity does not meet the requirements to share posts.`}
                </Typography>
            </Box>
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
