import { useContext, useEffect, useState } from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import OrgContext from "../../context/OrgContext";

const OrgInspector = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const location = useLocation();
    const [strikes, setStrikes] = useState<Strike[]>([]);

    const isAuditPage = location.pathname.includes("/audit");

    useEffect(() => {
        if (!isAuditPage) return;
        const fetchStrikes = async () => {
            const { data, error } = await supabase
                .from("strikes")
                .select(`id, reason, created_at, users (first_name, last_name)`)
                .eq("organization_id", organization.id);
            if (!error && data) setStrikes(data as Strike[]);
        };
        fetchStrikes();
    }, [isAuditPage, organization.id]);

    if (isAuditPage) {
        return (
            <div className="lg:block hidden">
                <Box
                    width={300}
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    marginLeft={5}
                    marginRight={3}
                    marginTop={1}
                    borderRadius={3}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Typography variant="h4" margin={3}>
                        Strikes
                    </Typography>
                    <Stack
                        direction="column"
                        borderRadius={2}
                        spacing={0.3}
                        overflow="hidden"
                    >
                        {strikes.length === 0 ? (
                            <Typography paddingLeft={3} paddingBottom={3}>
                                No Strikes
                            </Typography>
                        ) : (
                            strikes.map((strike, i) => (
                                <Stack
                                    sx={{
                                        marginRight: "10px",
                                        width: "100%",
                                        padding: 3,
                                        backgroundColor: "#36363650",
                                    }}
                                >
                                    <div
                                        className={
                                            "flex w-full justify-between mb-1"
                                        }
                                    >
                                        <Typography
                                            sx={{
                                                fontVariationSettings:
                                                    "'wght' 700",
                                            }}
                                        >
                                            Strike {i + 1}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontVariationSettings:
                                                    "'wght' 700",
                                            }}
                                        >
                                            {new Date(
                                                strike.created_at,
                                            ).toLocaleDateString()}
                                        </Typography>
                                    </div>
                                    <Typography>{strike.reason}</Typography>
                                </Stack>
                            ))
                        )}
                    </Stack>
                </Box>
            </div>
        );
    }

    const getPlatform = (url: string): string => {
        const { hostname } = new URL(url);
        const clamp = hostname.replace(/^www\./, "");
        return clamp.endsWith(".com") ? clamp.slice(0, -4) : clamp;
    };

    return (
        <div className="lg:block hidden">
            <Box
                width={300}
                bgcolor="#1f1f1f80"
                padding={0.5}
                marginLeft={5}
                marginRight={3}
                marginTop={1}
                borderRadius={3}
                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
            >
                <Typography variant="h4" margin={3}>
                    Links
                </Typography>

                <Stack
                    direction="column"
                    borderRadius={2}
                    spacing={0.3}
                    overflow="hidden"
                >
                    {organization.socials &&
                    organization.socials
                        .split(" ")
                        .some((social) => social.startsWith("http")) ? (
                        organization.socials.split(" ").map((social, i) =>
                            social.startsWith("http") ? (
                                <Link
                                    key={i}
                                    href={social}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline={"none"}
                                >
                                    <Stack
                                        sx={{
                                            marginRight: "10px",
                                            width: "100%",
                                            padding: 3,
                                            backgroundColor: "#36363650",
                                            transition:
                                                "background-color 0.1s ease-in-out",
                                            "&:hover": {
                                                backgroundColor: "#4d4d4d50",
                                            },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontVariationSettings:
                                                    "'wght' 700",
                                            }}
                                        >
                                            {getPlatform(social)
                                                .charAt(0)
                                                .toUpperCase() +
                                                getPlatform(social).slice(1)}
                                        </Typography>
                                        <Typography
                                            noWrap
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {social.replace(
                                                /^https?:\/\/[^\/]+\/?/,
                                                "",
                                            )}
                                        </Typography>
                                    </Stack>
                                </Link>
                            ) : null,
                        )
                    ) : (
                        <Typography paddingLeft={3} paddingBottom={3}>
                            No Links Provided
                        </Typography>
                    )}
                </Stack>
            </Box>
        </div>
    );
};

export default OrgInspector;
