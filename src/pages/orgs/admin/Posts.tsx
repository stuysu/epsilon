import { useContext, useState, useEffect } from "react";
import UserContext from "../../../comps/context/UserContext";

import Post from "../../../comps/pages/orgs/Post";
import PostEditor from "../../../comps/pages/orgs/admin/PostEditor";

import { supabase } from "../../../supabaseClient";
import OrgContext from "../../../comps/context/OrgContext";

/* create new posts */
/* fetch existing posts to update or delete */
const Posts = () => {
  const user = useContext(UserContext);
  const organization = useContext(OrgContext);
  let [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      let { data, error } = await supabase.from("posts").select();

      if (error || !data) {
        return user.setMessage(
          "Error retrieving data. Please contact it@stuysu.org for support.",
        );
      }

      setPosts(data as Post[]);
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <PostEditor
        orgId={organization.id}
        onCreate={(newPost) => {
          setPosts([...posts, newPost]);
        }}
      />
      <h1>POSTS</h1>
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
    </div>
  );
};

export default Posts;
