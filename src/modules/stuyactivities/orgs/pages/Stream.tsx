import React, { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { Box, Stack, Typography } from "@mui/material";
import { sortPostByDate } from "../../../../utils/DataFormatters";
import OrgStreamPost from "../components/OrgStreamPost";

const Stream = () => {
    const organization: OrgContextType = useContext(OrgContext);

    if (
        organization.state === "LOCKED" ||
        organization.state === "PENDING" ||
        organization.state === "PUNISHED"
    )
        return (
            <Box
                sx={{
                    minHeight: "55vh",
                    marginBottom: "5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <i className="bx bx-no-entry bx-lg text-red-500 mb-5"></i>
                <Typography variant="h1" marginBottom={3}>
                    Stream Unavailable
                </Typography>
                <Typography variant="body1">
                    {`This Activity does not meet the requirements to post updates.`}
                </Typography>
            </Box>
        );

    return (
        <Stack spacing={3} marginTop={1} marginBottom={10}>
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
        </Stack>
    );
};

export default Stream;
