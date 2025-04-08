import { useContext } from "react";
import { Link, Box, Typography, Stack } from "@mui/material";
import OrgContext from "../../context/OrgContext";

const OrgInspector = () => {
    const organization: OrgContextType = useContext(OrgContext);

    const getPlatform = (url: string): string => {
        const { hostname } = new URL(url);
        const clamp = hostname.replace(/^www\./, "");
        return clamp.endsWith(".com") ? clamp.slice(0, -4) : clamp;
    };

    return (
        <Box
            minWidth={300}
            height="100%"
            bgcolor="#1f1f1f80"
            padding={0.5}
            marginLeft={5}
            marginRight={3}
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

                {organization.socials && organization.socials.split(" ").some(social => social.startsWith("http")) ? (
                    organization.socials.split(" ").map((social, i) =>
                    social.startsWith("http") ? (
                        <Stack
                            sx={{
                                marginRight: "10px",
                                width: "100%",
                                padding: 3,
                                backgroundColor: "#36363650",
                                transition: "background-color 0.1s ease-in-out",
                                "&:hover": {
                                    backgroundColor: "#4d4d4d50"
                                },
                            }}>
                            <Typography sx={{ fontVariationSettings: "'wght' 700" }}>{getPlatform(social)}</Typography>
                        <Link
                            key={i}
                            href={social}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {social.replace(/^https?:\/\/[^\/]+\/?/, "")}
                        </Link>
                        </Stack>
                    ) : null)
                ) : (
                    <Typography paddingLeft={3} paddingBottom={2}>No Links Provided</Typography>
                )}
                </Stack>
        </Box>
    );
};

export default OrgInspector;
