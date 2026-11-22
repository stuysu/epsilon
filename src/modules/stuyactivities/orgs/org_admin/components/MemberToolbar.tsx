import { ReactNode, useState } from "react";
import { useSnackbar } from "notistack";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import SortSelect from "../../../../../components/ui/input/SortSelect";
import TextField from "../../../../../components/ui/input/TextField";
import SearchInput from "../../../../../components/ui/input/SearchInput";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";
import {
    MemberSort,
    memberSortOptions,
} from "../../../../../utils/DataFormatters";

/* a disabled text box with all the emails and a button to copy them */
const EmailCopyBox = ({
    label,
    emails,
    last = false,
}: {
    label?: string;
    emails: string;
    last?: boolean;
}) => {
    const { enqueueSnackbar } = useSnackbar();

    return (
        <div className={"w-full " + (last ? "" : "mb-[25px]")}>
            {label && (
                <p className={"font-medium text-typography-1 mt-2"}>{label}</p>
            )}
            <div className="w-full flex flex-nowrap items-center">
                <div className="pt-2 pb-2 w-full">
                    <TextField
                        aria-label={label}
                        disabled
                        fullWidth
                        value={emails}
                    />
                </div>
                <div className="pl-4 w-[100px]">
                    <AsyncButton
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(emails);
                                enqueueSnackbar("Copied emails to clipboard!", {
                                    variant: "success",
                                });
                            } catch {
                                enqueueSnackbar(
                                    "Failed to copy emails to clipboard. :( Try manually copying from the page.",
                                    { variant: "error" },
                                );
                            }
                        }}
                    >
                        Copy
                    </AsyncButton>
                </div>
            </div>
        </div>
    );
};

const MailingListDialog = ({
    open,
    onClose,
    leaderEmails,
    memberEmails,
}: {
    open: boolean;
    onClose: () => void;
    leaderEmails: string;
    memberEmails: string;
}) => (
    <UserDialog
        title="Mailing List"
        open={open}
        onClose={onClose}
        confirmText="Done"
        showCancel={false}
    >
        <EmailCopyBox label="Club leaders" emails={leaderEmails} />
        <EmailCopyBox label="All members" emails={memberEmails} last />
    </UserDialog>
);

const MemberToolbar = <S extends string = MemberSort>({
    query,
    onQueryChange,
    sort,
    onSortChange,
    leaderEmails,
    memberEmails,
    filter,
    sortOptions = memberSortOptions as { value: S; label: string }[],
    placeholder = "Search people",
}: {
    query: string;
    onQueryChange: (query: string) => void;
    sort: S;
    onSortChange: (sort: S) => void;
    sortOptions?: { value: S; label: string }[];
    leaderEmails?: string;
    memberEmails?: string;
    filter?: ReactNode;
    placeholder?: string;
}) => {
    const [mailingOpen, setMailingOpen] = useState(false);

    return (
        <>
            {memberEmails !== undefined && (
                <MailingListDialog
                    open={mailingOpen}
                    onClose={() => setMailingOpen(false)}
                    leaderEmails={leaderEmails ?? ""}
                    memberEmails={memberEmails}
                />
            )}
            <div className={"mb-5 flex items-start gap-3"}>
                <div className={"min-w-0 flex-1"}>
                    <SearchInput
                        containerClassName={"mb-0"}
                        placeholder={placeholder}
                        value={query}
                        onChange={onQueryChange}
                        inputClassName={filter ? "!pr-24" : ""}
                        trailing={
                            <div className={"flex items-center gap-1"}>
                                {filter}
                                <SortSelect
                                    compact
                                    value={sort}
                                    onChange={onSortChange}
                                    options={sortOptions}
                                    label="Sort members"
                                />
                            </div>
                        }
                    />
                </div>
                {memberEmails !== undefined && (
                    <AsyncButton
                        onClick={() => setMailingOpen(true)}
                        aria-label="Mailing List"
                        sx={{ height: "48px", minWidth: "48px" }}
                    >
                        <i
                            aria-hidden="true"
                            className={"bx bx-envelope bx-xs mt-px sm:mr-3"}
                        />
                        <span className={"hidden sm:inline"}>Mailing List</span>
                    </AsyncButton>
                )}
            </div>
        </>
    );
};

export default MemberToolbar;
