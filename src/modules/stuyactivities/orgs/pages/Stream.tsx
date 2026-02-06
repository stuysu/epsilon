import React, { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import UserContext from "../../../../contexts/UserContext";
import { sortPostByDate } from "../../../../utils/DataFormatters";
import OrgStreamPost from "../components/OrgStreamPost";
import PostEditor from "../org_admin/components/PostEditor";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";

const Stream = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const user = useContext<UserContextType>(UserContext);

    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );

    const isAdmin =
        !!membership &&
        (membership.role === "ADMIN" || membership.role === "CREATOR");

    if (
        organization.state === "LOCKED" ||
        organization.state === "PENDING" ||
        organization.state === "PUNISHED"
    )
        return (
            <ContentUnavailable
                icon="bx-message-alt-x"
                iconColor="text-red"
                title="Stream Unavailable"
                description="This Activity does not yet meet the requirements to post updates."
            />
        );

    if (organization.posts.length === 0 && !isAdmin) {
        return (
            <ContentUnavailable
                icon="bx-message-alt-dots"
                iconColor="text-yellow"
                title="No Posts Yet"
                description="This Activity has not posted any updates yet."
            />
        );
    }

    return (
        <section className="flex flex-col mt-2 gap-8">
            {isAdmin && (
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
            )}
            {organization.posts
                .sort(sortPostByDate)
                .reverse()
                .map((post, i) => {
                    return (
                        <OrgStreamPost
                            content={post}
                            key={i}
                            editable={isAdmin}
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
        </section>
    );
};

export default Stream;
