import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Stack } from "@mui/material";
import { sortPostByDate } from "../../utils/DataFormatters";
import Post from "../../comps/pages/orgs/Post";

const Stream = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <Stack spacing={3} marginTop={1} marginBottom={10}>
            {organization.posts
                .sort(sortPostByDate)
                .reverse()
                .map((post, i) => {
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
        </Stack>
    );
};

export default Stream;
