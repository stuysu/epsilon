import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import OrgMember from "../components/OrgMember";
import { AnimatePresence, motion } from "framer-motion";

import {
    MemberSort,
    sortMembers,
    sortMembersBy,
    memberSortOptions,
} from "../../../../utils/DataFormatters";
import useMembershipJoinDates from "../../../../utils/useMembershipJoinDates";
import LoginGate from "../../../../components/ui/content/LoginGate";
import ItemList from "../../../../components/ui/lists/ItemList";
import OrgAdvisors from "../components/OrgAdvisors";
import SearchInput from "../../../../components/ui/input/SearchInput";
import SortSelect from "../../../../components/ui/input/SortSelect";

const Members = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<MemberSort>("default");
    const joinDates = useMembershipJoinDates(
        organization.id,
        organization.memberships?.length ?? 0,
    );
    const contentRef = useRef<HTMLDivElement>(null);
    const [boxHeight, setBoxHeight] = useState<number | "auto">(0);

    const filteredMembers = useMemo(() => {
        if (!organization?.memberships) return [];
        const matching = organization.memberships
            .filter((member) => member.active && member.role !== "ADVISOR")
            .filter((member) => {
                const name =
                    `${member.users?.first_name ?? ""} ${member.users?.last_name ?? ""}`.toLowerCase();
                const email = member.users?.email?.toLowerCase() ?? "";
                const query = search.trim().toLowerCase();
                return name.includes(query) || email.includes(query);
            })
            .sort(sortMembers);

        return sortMembersBy(matching, sort, (member) => ({
            first_name: member.users?.first_name,
            last_name: member.users?.last_name,
            joined_at: joinDates.get(member.id as number),
        }));
    }, [organization.memberships, search, sort, joinDates]);

    const showNoMatch = filteredMembers.length === 0 && !!search.trim();

    /* follow the list's real height, including after removed rows finish
       fading out and when the "no match" message appears or wraps */
    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) return;
        const measure = () => setBoxHeight(content.scrollHeight);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(content);
        return () => observer.disconnect();
        // re-run on these too, in case the list mounts after the first render
    }, [filteredMembers.length, showNoMatch]);

    return (
        <LoginGate page="view members">
            <section className="w-full mt-2 mb-10">
                <h1 className="mb-6 mt-2">Members</h1>
                <div className="mb-5">
                    <SearchInput
                        containerClassName="mb-0"
                        placeholder="Search people"
                        value={search}
                        onChange={setSearch}
                        trailing={
                            <SortSelect
                                compact
                                value={sort}
                                onChange={setSort}
                                options={memberSortOptions}
                                label="Sort members"
                            />
                        }
                    />
                </div>
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
                                    picture={member.users?.picture || undefined}
                                    first_name={
                                        member.users?.first_name || "First"
                                    }
                                    last_name={
                                        member.users?.last_name || "Last"
                                    }
                                    className="transition-colors sm:hover:!bg-layer-3"
                                    filledRole
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* always rendered so screen readers announce the change */}
                    <p
                        role="status"
                        className={
                            showNoMatch
                                ? "px-4 py-6 text-center text-typography-2"
                                : "sr-only"
                        }
                    >
                        {showNoMatch
                            ? `No members match “${search.trim()}”`
                            : ""}
                    </p>
                </ItemList>
                <div className="mt-8 xl:hidden">
                    <OrgAdvisors editable={false} />
                </div>
            </section>
        </LoginGate>
    );
};

export default Members;
