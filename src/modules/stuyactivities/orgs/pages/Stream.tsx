import React, { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { sortPostByDate } from "../../../../utils/DataFormatters";
import OrgStreamPost from "../components/OrgStreamPost";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import useOrgRole from "../useOrgRole";

const Stream = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const { membership, isSiteAdmin } = useOrgRole();

    // posts are only loaded for members and site admins
    if (!membership?.active && !isSiteAdmin)
        return (
            <ContentUnavailable
                icon="bx-lock-alt"
                iconColor="text-yellow"
                title="Members Only"
                description="Join this Activity to see its posts."
            />
        );

    if (!["UNLOCKED", "ADMIN"].includes(organization.state))
        return (
            <ContentUnavailable
                icon="bx-message-alt-x"
                iconColor="text-red"
                title="Stream Unavailable"
                description="This Activity does not yet meet the requirements to post updates."
            />
        );

    if (organization.posts.length === 0) {
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
            {organization.posts
                .sort(sortPostByDate)
                .reverse()
                .map((post, i) => {
                    return (
                        <OrgStreamPost
                            content={post}
                            key={i}
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
