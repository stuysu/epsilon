import {
    Avatar,
    Chip,
    ListItem,
    ListItemAvatar,
    Stack,
    Typography,
} from "@mui/material";

type Props = {
    role?: Membership["role"];
    role_name?: Membership["role_name"];
    email?: User["email"];
    picture: User["picture"];
    first_name?: User["first_name"];
    last_name?: User["last_name"];
    is_faculty?: User["is_faculty"];
};

const formatCapitals = (txt?: string) => {
    if (!txt) return "";
    return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
};

const OrgMember = ({
    role,
    role_name,
    email,
    picture,
    first_name,
    last_name,
    is_faculty,
}: Props) => {
    let l1 =
        role_name || formatCapitals(role) + (is_faculty ? " - Faculty" : "");

    return (
        <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            flexWrap={"wrap"}
            sx={{ background: "#36363680" }}
        >
            <ListItem sx={{ height: "75px", width: "fit-content" }}>
                <ListItemAvatar>
                    <Avatar
                        alt={`${first_name} ${last_name}`}
                        src={picture}
                        sx={{
                            borderRadius: "5px",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "white",
                        }}
                    >
                        <Typography variant={"h2"}>
                            {(first_name || "O").charAt(0).toUpperCase()}
                        </Typography>
                    </Avatar>
                </ListItemAvatar>
                <div>
                    <Typography
                        variant="h4"
                        sx={{ position: "relative", top: "3px" }}
                    >
                        {`${first_name} ${last_name}`}
                    </Typography>
                    <Typography variant="body1">{<>{email}</>}</Typography>
                </div>
            </ListItem>
            <Chip
                label={l1}
                sx={{
                    marginRight: "20px",
                    marginLeft: "10px",
                    marginY: "10px",
                    maxWidth: "600px",
                }}
            />
        </Stack>
    );
};

export default OrgMember;
