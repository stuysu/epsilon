import { useContext, useState, useEffect } from "react";
import UserContext from "../../../comps/context/UserContext";

import Post from "../../../comps/pages/orgs/Post";
import PostEditor from "../../../comps/pages/orgs/admin/PostEditor";

import { supabase } from "../../../supabaseClient";
import OrgContext from "../../../comps/context/OrgContext";
import { useSnackbar } from "notistack";
import { Box, Typography } from "@mui/material";

/* create new posts */
/* fetch existing posts to update or delete */
const Posts = () => {
  const user = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const organization = useContext(OrgContext);
  let [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      let { data, error } = await supabase.from("posts").select();

      if (error || !data) {
        return enqueueSnackbar(
          "Error retrieving data. Please contact it@stuysu.org for support.",
          { variant: "error" }
        );
      }

      setPosts(data as Post[]);
    };

    fetchPosts();
  }, [user]);

  if (organization.state === "LOCKED" || organization.state === "PENDING") return (
    <h2>Posts are disabled for this organization.</h2>
  )

  return (
    <Box sx={{ width: '100%'}}>
      <PostEditor
        orgId={organization.id}
        onCreate={(newPost) => {
          setPosts([...posts, newPost]);
        }}
      />
      <Typography variant='h1' align='center' width='100%'>Posts</Typography>
      {posts.map((post, i) => {
        return (
          <Post
            content={post}
            editable
            onDelete={() => {
              setPosts(posts.filter((p) => p.id !== post.id));
            }}
          />
        );
      })}
    </Box>
  );
};

export default Posts;
