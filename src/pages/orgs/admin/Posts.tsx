import { useContext } from "react";

import Post from "../../../comps/pages/orgs/Post";
import PostEditor from "../../../comps/pages/orgs/admin/PostEditor";

import OrgContext from "../../../comps/context/OrgContext";
import { Box, Typography } from "@mui/material";

import { sortPostByDate } from "../../../utils/DataFormatters";

/* create new posts */
/* fetch existing posts to update or delete */
const Posts = () => {
    const organization = useContext(OrgContext);

    if (organization.state === "LOCKED" || organization.state === "PENDING")
        return (
            <Box>
                <Typography variant="h2">
                    Posts are disabled for this organization.
                </Typography>
            </Box>
        );

    return (
        <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            <Typography variant="h1" width="100%">
                Manage Posts
            </Typography>
            <PostEditor
                orgId={organization.id}
                onCreate={(newPost) => {
                    if (organization.setOrg) {
                        organization.setOrg({
                            ...organization,
                            posts: [...organization.posts, newPost],
                        });
                    }
                }}
            />
            <Typography variant="h1" align="center" width="100%">
                Manage Posts
            </Typography>
            {organization.posts.sort(sortPostByDate).map((post, i) => {
                return (
                    <Post
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
