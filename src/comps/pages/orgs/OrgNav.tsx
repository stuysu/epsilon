import { useContext, useEffect, useState } from "react";

import { Box, Divider, List, Link, Typography } from "@mui/material";

import OrgContext from "../../context/OrgContext";

import { useLocation, useNavigate } from "react-router-dom";

const OrgNav = ({ isMobile }: { isMobile: boolean }) => {
    const organization = useContext<OrgContextType>(OrgContext);
    const navigate = useNavigate();
    const main = `/${organization.url}`;

    const location = useLocation();

    const navLinks = [
        { to: main, display: "Overview" },
        { to: `${main}/charter`, display: "Charter" },
        {
            to: `${main}/meetings`,
            display: "Meetings",
        },
        { to: `${main}/members`, display: "Members" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        let isCorrectIndex = false;
        if (location.pathname === main) {
            if (currentIndex !== 0) {
                setCurrentIndex(0);
            } else {
                isCorrectIndex = true;
            }
        } else {
            if (currentIndex === 0) {
                isCorrectIndex = location.pathname === main;
            } else {
                isCorrectIndex = location.pathname.startsWith(
                    navLinks[currentIndex]?.to,
                );
            }
        }

        if (!isCorrectIndex) {
            const correctIndex =
                navLinks
                    .slice(1)
                    .findIndex((link) =>
                        location.pathname.startsWith(link.to),
                    ) + 1;
            setCurrentIndex(~correctIndex ? correctIndex : 0);
        }
    }, [navLinks, location.pathname, currentIndex, main]);

    if (organization.memberships?.some((m) => m.role === "ADMIN")) {
        navLinks.push({
            to: `${main}/admin`,
            display: "Admin",
        });
    }

    return (
        <Box
            sx={{
                minWidth: "200px",
                width: isMobile ? "100%" : "",
                padding: isMobile ? "0px" : "20px",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            ></Box>
            {organization.socials &&
                organization.socials.split(" ").map((social, i, a) => {
                    if (!social.startsWith("http")) {
                        let outText = social;

                        if (i !== a.length - 1) {
                            outText += " ";
                        }

                        return outText;
                    }

                    return (
                        <Link
                            key={i}
                            href={social}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textAlign: "center" }}
                        >
                            {social}
                        </Link>
                    );
                })}

            <Divider sx={{ marginTop: "20px", height: "2px" }} />

            <List sx={{ width: "100%" }}>
                {navLinks.map((linkData, i) => (
                    <Box
                        key={i}
                        sx={{
                            height: `30px`,
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            padding: "0 10px",
                        }}
                        onClick={() => {
                            navigate(linkData.to);
                            setCurrentIndex(i);
                        }}
                    >
                        <Typography
                            sx={{
                                fontVariationSettings: `'wght' 600`,
                                color:
                                    currentIndex === i
                                        ? "rgba(232,232,232,80)"
                                        : "#rgba(174,174,174,80)",
                            }}
                        >
                            {linkData.display}
                        </Typography>
                    </Box>
                ))}
            </List>
        </Box>
    );
};

export default OrgNav;
