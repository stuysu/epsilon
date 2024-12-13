import { useContext, useState, useEffect } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Box, Grid, Typography } from "@mui/material";
import Post from "../../comps/pages/orgs/Post";

const Posts = () => {
    const [posts, setPosts] = useState<Post[]>([]);

    const organization: OrgContextType = useContext(OrgContext);

    useEffect(() => {
        setPosts(organization.posts.reverse());
    }, []);

    return(
        <Box sx={{ width: "100%" }}>
            <Typography variant="h1" align="center" width="100%">
                Posts
            </Typography>
            <Grid container>

            {posts.map(
                (post) => (
                    <Grid item xs={12} sm={12} md={6} lg={4} key={post.id}>
                        <Box
                            width="100%"
                            display="flex"
                            justifyContent="center"
                            padding="10px"
                        >
                            <Post content={post} />
                        </Box>
                    </Grid>
                )
            )}
            </Grid>
        </Box>
    );
};

export default Posts;