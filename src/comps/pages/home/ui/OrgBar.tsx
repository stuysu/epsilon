import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";

type Props = {
    name?: Organization["name"];
    role?: Membership["role"];
    role_name: Membership["role_name"];
    url: Organization["url"];
    picture: Organization["picture"];
};

const formatCapitals = (txt: string) => {
    return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
};

const OrgBar = ({ name, url, role, role_name, picture }: Props) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/${url}`)}
            style={{
                display: "flex",
                flexDirection: "column",
                width: "200px"
            }}
        >
            <div>
                {picture ? (
                    <img
                        src={picture}
                        alt={name}
                        style={{
                            height: "200px",
                            borderRadius: "15px",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "50%",
                            backgroundColor: "#ccc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            color: "#fff",
                        }}
                    >
                        {name?.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div style={{padding: 10}}>
                <Typography variant="h4" height={45}>{name}</Typography>
                <Typography sx={{ fontVariationSettings: "'wght' 700" }}>
                    {role_name || formatCapitals(role || "Member")}
                </Typography>
            </div>
        </div>
    );
};

export default OrgBar;