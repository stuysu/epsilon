import { Box, Typography, Card, Button } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useSnackbar } from "notistack";
import OrgContext from "../../../comps/context/OrgContext";

const Strikes = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const { enqueueSnackbar } = useSnackbar();
    const [orgStrikes, setOrgStrikes] = useState<Strike[]>([]);

    useEffect(() => {
        const fetchStrikes = async () => {
            try {
                const { data, error } = await supabase
                    .from("strikes")
                    .select(
                        `
                        id,
                        reason,
                        created_at,
                        organizations (
                            name
                        ),
                        users (
                            first_name,
                            last_name,
                            picture
                        )
                    `,
                    )
                    .eq("organization_id", organization.id);

                if (error || !data) {
                    throw error;
                }

                setOrgStrikes(data as Strike[]);
            } catch (error) {
                enqueueSnackbar("Failed to load strikes.", {
                    variant: "error",
                });
            }
        };

        fetchStrikes();
    }, [enqueueSnackbar]);

    return (
        <Box>
            <Typography variant="h1" align="center">
                Strikes
            </Typography>
            {orgStrikes.map((strike, index) => (
                <Box
                    key={index}
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "10px",
                    }}
                >
                    <Card sx={{ width: "500px", padding: "20px" }}>
                        <Typography variant="h2">{strike.reason}</Typography>
                        <Typography variant="body1">
                            Issued by {strike.users?.first_name}{" "}
                            {strike.users?.last_name}
                        </Typography>
                    </Card>
                </Box>
            ))}
        </Box>
    );
};

export default Strikes;
