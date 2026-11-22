import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgChat from "../components/OrgChat";
import SearchInput from "../../../../components/ui/input/SearchInput";
import Divider from "../../../../components/ui/Divider";

const SendMessage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [orgId, setOrgId] = useState<number>();
    const [orgName, setOrgName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);

    useEffect(() => {
        const fetchAllOrgs = async () => {
            const { data, error } = await supabase
                .from("organizations")
                .select("*");
            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load organizations. Contact support.",
                    { variant: "error" },
                );
                return;
            }
            setAllOrgs(data);
        };

        fetchAllOrgs();
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (searchInput) {
            setFilteredOrgs(
                allOrgs.filter((org) =>
                    org.name.toLowerCase().includes(searchInput.toLowerCase()),
                ),
            );
        } else {
            setFilteredOrgs([]);
        }
    }, [searchInput, allOrgs]);

    return (
        <div className={"w-full p-4 sm:p-12 min-h-dvh flex flex-col gap-4"}>
            <h1>Send Message</h1>
            <SearchInput
                placeholder="Search Activities..."
                value={searchInput}
                onChange={(e) => setSearchInput(e)}
            />
            {searchInput.length === 0 && orgId ? null : searchInput.length <
              3 ? (
                <p>Keep typing to find an Activity.</p>
            ) : filteredOrgs.length > 10 ? (
                <p>Too many activities, try a more specific query.</p>
            ) : filteredOrgs.length > 0 ? (
                <div>
                    {filteredOrgs.map((org) => (
                        <div key={org.id}>
                            <button
                                type="button"
                                className={
                                    "important w-full py-2 text-left cursor-pointer"
                                }
                                onClick={() => {
                                    setOrgId(org.id);
                                    setOrgName(org.name);
                                    setSearchInput("");
                                    setFilteredOrgs([]);
                                }}
                            >
                                {org.name}
                            </button>
                            <Divider />
                        </div>
                    ))}
                </div>
            ) : null}
            {orgId && (
                <section className="mt-5 flex w-full flex-col gap-3">
                    <h2 className="break-words">{orgName}</h2>
                    <OrgChat organization_id={orgId} />
                </section>
            )}
        </div>
    );
};

export default SendMessage;
