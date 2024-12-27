import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";

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
        <ListItem sx={{ height: "75px" }}>
            <ListItemAvatar>
                <Avatar alt={`${first_name} ${last_name}`} src={picture}>
                    {(first_name || "O").charAt(0).toUpperCase()}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={`${first_name} ${last_name}`}
                secondary={
                    <>
                        {l1}
                        {l1 && <br />}
                        {email}
                    </>
                }
            />
        </ListItem>
    );
};

export default OrgMember;
