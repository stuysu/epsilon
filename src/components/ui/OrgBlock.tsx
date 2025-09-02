import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";

type Props = {
    name?: Organization["name"];
    role?: Membership["role"];
    role_name: Membership["role_name"];
    url?: Organization["url"];
    picture: Organization["picture"];
    force?: boolean;
};

const formatCapitals = (txt: string) => {
    return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
};

const OrgBlock = ({
    name,
    url,
    role,
    role_name,
    picture,
    force = false,
}: Props) => {
    const navigate = useNavigate();
    const [imgLoaded, setImgLoaded] = useState(false);

    const handleClick = () => {
        if (!url) return;
        force ? (window.location.href = `/${url}`) : navigate(`/${url}`);
    };

    return (
        <div
            onClick={url ? handleClick : undefined}
            style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                width: "180px",
            }}
        >
            <div>
                {picture ? (
                    <>
                        {!imgLoaded && (
                            <Skeleton
                                variant="rectangular"
                                width={180}
                                height={180}
                                sx={{ borderRadius: "15px" }}
                            />
                        )}
                        <div
                            className={"relative"}
                            onMouseEnter={(e) => {
                                const img =
                                    e.currentTarget.querySelector("img");
                                if (img) img.style.filter = "blur(30px)";
                            }}
                            onMouseLeave={(e) => {
                                const img =
                                    e.currentTarget.querySelector("img");
                                if (img) img.style.filter = "blur(10px)";
                            }}
                        >
                            {/*background glow*/}
                            <img
                                src={picture}
                                alt={name}
                                style={{
                                    display: imgLoaded ? "block" : "none",
                                    height: "180px",
                                    borderRadius: "15px",
                                    objectFit: "cover",
                                    opacity: "0.3",
                                    filter: "blur(10px)",
                                    transition: "filter 0.2s ease",
                                }}
                            />

                            {/*main avatar image*/}
                            <img
                                onLoad={() => setImgLoaded(true)}
                                src={picture}
                                alt={name}
                                style={{
                                    transition: "opacity 0.5s ease 0.5s",
                                    opacity: imgLoaded ? 1 : 0,
                                    position: "absolute",
                                    bottom: "0px",
                                    zIndex: 10,
                                    height: "180px",
                                    borderRadius: "15px",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    </>
                ) : (
                    // fallback for no picture
                    <div
                        style={{
                            width: "180px",
                            height: "180px",
                            overflow: "hidden",
                            borderRadius: "15px",
                            backgroundColor: "#232323",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "100px",
                            color: "#cdcdcd",
                        }}
                    >
                        <h1>{name?.charAt(0).toUpperCase()}</h1>
                    </div>
                )}
            </div>
            <div style={{ padding: 10, paddingTop: 10 }}>
                <h4
                    className={
                        "h-[3lh] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
                    }
                >
                    {name}
                </h4>
                <p className={"important"}>
                    {role_name || formatCapitals(role || "")}
                </p>
            </div>
        </div>
    );
};

export default OrgBlock;
