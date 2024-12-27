import { useContext, useEffect, useMemo, useState } from "react";

import {
    Box,
    Typography,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Link,
    Avatar,
} from "@mui/material";

import OrgContext from "../../context/OrgContext";
import UserContext from "../../context/UserContext";

import { supabase } from "../../../supabaseClient";
import { useSnackbar } from "notistack";

import { Link as NavLink, useLocation, useNavigate } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import ArticleIcon from "@mui/icons-material/Article";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AsyncButton from "../../ui/AsyncButton";

const OrgNav = ({ isMobile }: { isMobile: boolean }) => {
    const organization = useContext<OrgContextType>(OrgContext);
    const user = useContext<UserContextType>(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const main = `/${organization.url}`;

    const location = useLocation();

    const navLinks = [
        { to: main, display: "Overview", icon: <InfoIcon /> },
        { to: `${main}/charter`, display: "Charter", icon: <ArticleIcon /> },
        {
            to: `${main}/meetings`,
            display: "Meetings",
            icon: <CalendarMonthIcon />,
        },
        { to: `${main}/members`, display: "Members", icon: <PeopleIcon /> },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [attemptingInteract, setAttemptingInteract] = useState(false); // if in middle of sending join request, lock the button

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

    const isInOrg: boolean = !!organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );
    let isCreator = false;
    let isAdmin = false;
    let isActive = false;

    /* CHECK IF CREATOR */
    if (
        isInOrg &&
        organization.memberships?.find((m) => m.users?.id === user.id)?.role ===
            "CREATOR"
    ) {
        isCreator = true;
        isAdmin = true;
    }

    /* CHECK IF ADMIN */
    if (
        isInOrg &&
        organization.memberships?.find((m) => m.users?.id === user.id)?.role ===
            "ADMIN"
    ) {
        isAdmin = true;
    }

    /* CHECK IF MEMBERSHIP IS ACTIVE */
    if (
        isInOrg &&
        organization.memberships?.find((m) => m.users?.id === user.id)?.active
    ) {
        isActive = true;
    }

    /* Button on OrgNav that changes depending on the user */
    let interactString = isInOrg
        ? isActive
            ? "LEAVE"
            : "CANCEL JOIN"
        : "JOIN";
    const handleInteract = async () => {
        setAttemptingInteract(true);
        if (interactString === "JOIN") {
            /* JOIN ORGANIZATION */
            let body = {
                organization_id: organization.id,
            };
            const { data, error } = await supabase.functions.invoke(
                "join-organization",
                { body },
            );
            if (error || !data) {
                return enqueueSnackbar(
                    "Unable to join organization. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            // update context
            if (organization.setOrg) {
                organization.setOrg({
                    ...organization,
                    memberships: [...organization.memberships, data],
                });
            }

            enqueueSnackbar("Sent organization a join request!", {
                variant: "success",
            });
        } else if (
            interactString === "LEAVE" ||
            interactString === "CANCEL JOIN"
        ) {
            /* LEAVE ORGANIZATION */
            let membership = organization.memberships?.find(
                (m) => m.users?.id === user.id,
            );

            const { error } = await supabase
                .from("memberships")
                .delete()
                .eq("id", membership?.id);

            if (error) {
                return enqueueSnackbar(
                    "Unable to leave organization. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            // update context
            if (organization.setOrg) {
                organization.setOrg({
                    ...organization,
                    memberships: organization.memberships.filter(
                        (m) => m.users?.id !== user.id,
                    ),
                });
            }

            enqueueSnackbar("Left organization!", { variant: "success" });
        }
        setAttemptingInteract(false);
    };

    let disabled = false;
    if (isCreator) disabled = true;
    if (!isInOrg && !organization.joinable) {
        interactString = "JOINING DISABLED";
        disabled = true;
    } else if (!user.signed_in) {
        interactString = "sign in to join";
        disabled = true;
    }

    if (isAdmin) {
        navLinks.push({
            to: `${main}/admin`,
            display: "Admin",
            icon: <AdminPanelSettingsIcon />,
        });
    }

    return (
        <Box
            sx={{
                minWidth: "350px",
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
            >
                <Box
                    sx={{
                        width: "300px",
                        height: "300px",
                        borderRadius: "100%",
                        padding: "20px",
                    }}
                >
                    <Avatar
                        src={organization.picture || ""}
                        sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "100%",
                            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                            fontSize: "100px",
                            objectFit: "cover",
                        }}
                        alt={`organization ${organization.name}`}
                    >
                        {organization.name.charAt(0).toUpperCase()}
                    </Avatar>
                </Box>
                <Typography variant="h3" align="center" width="100%">
                    {organization.name}
                </Typography>
                <Typography
                    variant="body1"
                    align="center"
                    width="100%"
                    sx={{ overflowX: "hidden", marginBottom: "20px" }}
                >
                    {organization.purpose}
                </Typography>
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
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <AsyncButton
                        variant="contained"
                        onClick={handleInteract}
                        disabled={disabled || attemptingInteract}
                        sx={{
                            marginTop: "20px",
                            width: isMobile ? "80%" : "100%",
                        }}
                    >
                        {interactString}
                    </AsyncButton>
                </Box>
            </Box>

            <Divider sx={{ marginTop: "20px", height: "2px" }} />

            <List sx={{ width: "100%" }}>
                {navLinks.map((linkData, i) => (
                    <ListItemButton
                        key={i}
                        sx={{ height: `65px` }}
                        selected={currentIndex === i}
                        onClick={() => {
                            navigate(linkData.to);
                            setCurrentIndex(i);
                        }}
                    >
                        {linkData.icon && (
                            <ListItemIcon>{linkData.icon}</ListItemIcon>
                        )}
                        <ListItemText>{linkData.display}</ListItemText>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
};

export default OrgNav;
