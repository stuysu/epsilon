import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Box, Typography } from "@mui/material";
import OrgMember from "../../comps/pages/orgs/OrgMember";

import { sortByRole } from "../../utils/DataFormatters";

const Members = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h1" align="center" width="100%">
                Members
            </Typography>
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
        </Box>
    );
};

export default Members;
