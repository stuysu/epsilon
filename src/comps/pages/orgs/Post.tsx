import { Box, Button } from "@mui/material";
import { supabase } from "../../../supabaseClient";

import { useEffect, useState } from "react";

import PostEditor from "./admin/PostEditor";
import { useSnackbar } from "notistack";

/* This post component will serve as both the admin and member post. depending on role, differeing functionality */
const Post = ({
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
  const [postData, setPostData] = useState(content);

  useEffect(() => setPostData(content), [content]);

  const deletePost = async () => {
    let { error } = await supabase.from("posts").delete().eq("id", content.id);

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
        orgId={content.organization_id}
        onCancel={() => setEditing(false)}
        onSave={(newData) => {
          setPostData(newData);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <Box>
      <Box>
        {postData.title} -{" "}
        {postData.created_at !== postData.updated_at
          ? `${postData.updated_at} [Edited]`
          : postData.created_at}
      </Box>
      <Box>{postData.description}</Box>
      <Box>
        {editable && (
          <>
            <Button onClick={deletePost}>Delete</Button>
            <Button onClick={() => setEditing(true)}>Edit</Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Post;
