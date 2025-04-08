import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Box, Stack, Typography } from "@mui/material";
import OrgMember from "../../comps/pages/orgs/OrgMember";

import { sortByRole } from "../../utils/DataFormatters";

const Members = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h1" width="100%">
                {`${
                    organization.memberships.filter((member) => member.active)
                        .length
                } Members`}
            </Typography>
            <Box
                height="100%"
                bgcolor="#1f1f1f80"
                padding={0.5}
                borderRadius={3}
                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
            >
                <Stack direction="column" spacing={0.3} borderRadius={2} overflow="hidden">
            {organization.memberships
                ?.sort(sortByRole)
                .map(
                    (member, i) =>
                        member.active && (
                            <OrgMember
                                key={i}
                                role={member.role || "MEMBER"}
                                role_name={member.role_name}
                                email={member.users?.email || "no email"}
                                picture={
                                    member.users?.picture ||
                                    "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                                }
                                first_name={member.users?.first_name || "First"}
                                last_name={member.users?.last_name || "Last"}
                                is_faculty={member.users?.is_faculty || false}
                            />
                        ),
                )}
                </Stack>
            </Box>
        </Box>
    );
};

export default Members;
