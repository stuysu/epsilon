import { useContext } from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import OrgContext from "../../context/OrgContext";

const OrgInspector = () => {
    const organization: OrgContextType = useContext(OrgContext);

    const getPlatform = (url: string): string => {
        const { hostname } = new URL(url);
        const clamp = hostname.replace(/^www\./, "");
        return clamp.endsWith(".com") ? clamp.slice(0, -4) : clamp;
    };

    return (
        <div className="sm:block hidden">
            <Box
                width={350}
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
