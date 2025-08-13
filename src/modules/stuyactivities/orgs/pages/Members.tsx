import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import OrgMember from "../components/OrgMember";
import { AnimatePresence, motion } from "framer-motion";

import { sortByRole } from "../../../../utils/DataFormatters";
import LoginGate from "../../../../components/ui/LoginGate";
import ItemList from "../../../../components/ui/ItemList";
import SearchInput from "../../../../components/ui/SearchInput";

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
            <section className="w-full mt-2 mb-10">
                <SearchInput
                    placeholder="Search members by name or email..."
                    value={search}
                    onChange={setSearch}
                />
                <ItemList height={boxHeight} contentRef={contentRef}>
                    <AnimatePresence initial={false}>
                        {filteredMembers.map((member) => (
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
                                    email={member.users?.email || "no email"}
                                    picture={
                                        member.users?.picture ||
                                        "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                                    }
                                    first_name={
                                        member.users?.first_name || "First"
                                    }
                                    last_name={
                                        member.users?.last_name || "Last"
                                    }
                                    is_faculty={
                                        member.users?.is_faculty || false
                                    }
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </ItemList>
            </section>
        </LoginGate>
    );
};

export default Members;
