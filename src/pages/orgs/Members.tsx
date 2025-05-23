import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Box, Stack, Typography } from "@mui/material";
import OrgMember from "../../comps/pages/orgs/OrgMember";

import { sortByRole } from "../../utils/DataFormatters";
import LoginGate from "../../comps/ui/LoginGate";

const Members = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <LoginGate page="view members">
            <Box sx={{ width: "100%" }} marginTop={1}>
                <Box
                    height="100%"
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    marginBottom={10}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Typography variant="body1" align={"center"}>
                        Search
                    </Typography>
                    <Stack
                        direction="column"
                        spacing={0.3}
                        borderRadius={2}
                        overflow="hidden"
                    >
                        {organization.memberships
                            ?.sort(sortByRole)
                            .map(
                                (member, i) =>
                                    member.active && (
                                        <OrgMember
                                            key={i}
                                            role={member.role || "MEMBER"}
                                            role_name={member.role_name}
                                            email={
                                                member.users?.email ||
                                                "no email"
                                            }
                                            picture={
                                                member.users?.picture ||
                                                "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                                            }
                                            first_name={
                                                member.users?.first_name ||
                                                "First"
                                            }
                                            last_name={
                                                member.users?.last_name ||
                                                "Last"
                                            }
                                            is_faculty={
                                                member.users?.is_faculty ||
                                                false
                                            }
                                        />
                                    ),
                            )}
                    </Stack>
                </Box>
            </Box>
        </LoginGate>
    );
};

export default Members;
