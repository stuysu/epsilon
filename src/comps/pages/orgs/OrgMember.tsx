import { Box, Typography } from "@mui/material";

type Props = {
  role: Membership["role"];
  role_name: Membership["role_name"]
  email: User["email"];
  picture: User["picture"];
  first_name: User["first_name"];
  last_name: User["last_name"];
  is_faculty: User["is_faculty"];
};

const formatCapitals = (txt : string) => {
  return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
}

const OrgMember = ({
  role,
  role_name,
  email,
  picture,
  first_name,
  last_name,
  is_faculty,
}: Props) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "75px",
        display: "flex",
        flexWrap: "nowrap",
      }}
    >
      <Box sx={{ width: "75px", height: "75px", padding: "15px" }}>
        <img
          width="100%"
          height="100%"
          src={picture}
          style={{ borderRadius: "100%" }}
          alt={`Member ${first_name} ${last_name}`}
        />
      </Box>
      <Box sx={{ height: "75px", padding: "5px" }}>
        <Typography>
          {first_name} {last_name}
        </Typography>
        <Typography>
          {role_name || formatCapitals(role)}
          {is_faculty && " - Faculty"}
        </Typography>
        <Typography>{email}</Typography>
      </Box>
    </Box>
  );
};

export default OrgMember;
