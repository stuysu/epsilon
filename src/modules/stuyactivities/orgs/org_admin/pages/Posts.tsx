import React, { useContext } from "react";

import OrgStreamPost from "../../components/OrgStreamPost";
import PostEditor from "../components/PostEditor";

import OrgContext from "../../../../../contexts/OrgContext";

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
        <div className="flex flex-col mt-2 gap-8">
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
                            key={i}
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
        </div>
    );
};

export default Posts;
