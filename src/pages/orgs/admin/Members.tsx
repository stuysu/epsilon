import { useContext } from "react";
import OrgContext from "../../../comps/context/OrgContext";
import UserContext from "../../../comps/context/UserContext";

import AdminMember from "../../../comps/pages/orgs/admin/AdminMember";
import { Box, Typography } from "@mui/material";

const Members = () => {
  const user = useContext(UserContext);
  const organization = useContext<OrgContextType>(OrgContext);
  const members = organization.memberships
    ?.filter((member) => member.active)
    .map((member) => {
      return {
        name: member.users?.first_name + " " + member.users?.last_name,
        email: member.users?.email,
        membershipId: member.id,
        userId: member.users?.id,
        picture: member.users?.picture,
        role_name: member.role_name,
        role: member.role,
      };
    });

  const userMember = organization.memberships?.find(
    (member) => member.users?.id === user.id,
  );

  return (
    <Box sx={{ width: '100%'}}>
      <Typography variant='h1' align='center' width='100%'>Members</Typography>
      {members?.map((member, i) => (
        <AdminMember
          id={member.membershipId || -1}
          userId={member.userId || -1}
          name={member.name}
          email={member.email || ""}
          picture={member.picture}
          role={member.role || ""}
          role_name={member.role_name}
          isCreator={userMember?.role === "CREATOR"}
          key={i}
        />
      ))}
    </Box>
  );
};

export default Members;
