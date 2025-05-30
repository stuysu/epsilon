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
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                width: "180px",
            }}
        >
            <div>
                {picture ? (
                    <div
                        className={"relative"}
                        onMouseEnter={(e) => {
                            const img = e.currentTarget.querySelector("img");
                            if (img) img.style.filter = "blur(30px)";
                        }}
                        onMouseLeave={(e) => {
                            const img = e.currentTarget.querySelector("img");
                            if (img) img.style.filter = "blur(10px)";
                        }}
                    >
                        <img
                            src={picture}
                            alt={name}
                            style={{
                                height: "180px",
                                borderRadius: "15px",
                                objectFit: "cover",
                                opacity: "0.2",
                                filter: "blur(10px)",
                                transition: "filter 0.2s ease",
                            }}
                        />
                        <img
                            src={picture}
                            alt={name}
                            style={{
                                position: "absolute",
                                bottom: "0px",
                                zIndex: 10,
                                height: "180px",
                                borderRadius: "15px",
                                objectFit: "cover",
                                transition: "filter 0.3s ease",
                            }}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            width: "180px",
                            height: "180px",
                            borderRadius: "15px",
                            backgroundColor: "#232323",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "100px",
                            color: "#fff",
                        }}
                    >
                        <h1>{name?.charAt(0).toUpperCase()}</h1>
                    </div>
                )}
            </div>
            <div style={{ padding: 10, paddingTop: 15 }}>
                <Typography variant="h4" height={60}>
                    {name}
                </Typography>
                <Typography sx={{ fontVariationSettings: "'wght' 700" }}>
                    {role_name || formatCapitals(role || "Member")}
                </Typography>
            </div>
        </div>
    );
};

export default OrgBar;
