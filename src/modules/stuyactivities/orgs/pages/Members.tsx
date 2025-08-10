import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { Box, InputBase, Stack } from "@mui/material";
import OrgMember from "../components/OrgMember";
import { AnimatePresence, motion } from "framer-motion";

import { sortByRole } from "../../../../utils/DataFormatters";
import LoginGate from "../../../../components/ui/LoginGate";

const Members = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const [search, setSearch] = useState("");
    const contentRef = useRef<HTMLDivElement>(null);
    const [boxHeight, setBoxHeight] = useState<number | "auto">(0);

    const filteredMembers = useMemo(() => {
        if (!organization?.memberships) return [];
        return organization.memberships
            .filter((member) => member.active)
            .filter((member) => {
                const name =
                    `${member.users?.first_name ?? ""} ${member.users?.last_name ?? ""}`.toLowerCase();
                const email = member.users?.email?.toLowerCase() ?? "";
                const query = search.toLowerCase();
                return name.includes(query) || email.includes(query);
            })
            .sort(sortByRole);
    }, [organization.memberships, search]);

    useLayoutEffect(() => {
        if (contentRef.current) {
            setBoxHeight(contentRef.current.scrollHeight);
        }
    }, [filteredMembers.length]);

    return (
        <LoginGate page="view members">
            <Box
                sx={{ width: "100%", minHeight: "90vh" }}
                marginTop={1}
                marginBottom={10}
            >
                <InputBase
                    fullWidth
                    placeholder="Search members by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        borderRadius: "10px",
                        width: "100%",
                        padding: "10px 20px",
                        marginBottom: "20px",
                        fontVariationSettings: `'wght' 700`,
                        backgroundColor: "#1F1F1F80",
                        boxShadow:
                            "0px 0px 2px 0px rgba(255, 255, 255, 0.30) inset",
                    }}
                />

                <motion.div
                    animate={{ height: boxHeight }}
                    initial={false}
                    transition={{ duration: 0.3 }}
                >
                    <Box
                        bgcolor="#1f1f1f80"
                        padding={0.5}
                        borderRadius={3}
                        marginBottom={10}
                        boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                        sx={{ position: "relative" }}
                    >
                        <div ref={contentRef}>
                            <Stack
                                direction="column"
                                spacing={0.3}
                                borderRadius={2}
                                overflow="hidden"
                            >
                                <AnimatePresence initial={false}>
                                    {filteredMembers.map((member, i) => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <OrgMember
                                                role={member.role || "MEMBER"}
                                                role_name={member.role_name}
                                                email={
                                                    member.users?.email ||
                                                    "no email"
                                                }
                                                picture={
                                                    member.users?.picture ||
                                                    "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                                                }
                                                first_name={
                                                    member.users?.first_name ||
                                                    "First"
                                                }
                                                last_name={
                                                    member.users?.last_name ||
                                                    "Last"
                                                }
                                                is_faculty={
                                                    member.users?.is_faculty ||
                                                    false
                                                }
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </Stack>
                        </div>
                    </Box>
                </motion.div>
            </Box>
        </LoginGate>
    );
};

export default Members;
