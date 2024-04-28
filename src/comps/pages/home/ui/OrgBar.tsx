import { Box, Typography, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
  name?: Organization['name'];
  role?: Membership['role'];
  role_name: Membership['role_name'];
  url: Organization['url'];
  picture: Organization['picture'];
};

const formatCapitals = (txt : string) => {
  return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
}

const OrgBar = ({ name, url, role, role_name, picture }: Props) => {
  const navigate = useNavigate();

  return (
    <ListItemButton onClick={() => navigate(`/${url}`)}>
      <ListItemAvatar>
        <Avatar 
          alt={name} 
          src={
            picture ||
            "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
          }
        />
      </ListItemAvatar>
      <ListItemText
        primary={name} 
        secondary={
          role_name || 
          formatCapitals(role || "Member")
        } 
      />
    </ListItemButton>
  );
};

export default OrgBar;
