import React, { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { sortPostByDate } from "../../../../utils/DataFormatters";
import OrgStreamPost from "../components/OrgStreamPost";
import ContentUnavailable from "../../../../components/ui/ContentUnavailable";

const Stream = () => {
    const organization: OrgContextType = useContext(OrgContext);

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
                description="This Activity does not yet meet the requirements to post updates. Please check back later."
            />
        );

    return (
        <section className="flex flex-col mt-2 gap-2">
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
        </section>
    );
};

export default Stream;
