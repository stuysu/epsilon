import { ReactNode } from "react";
import { Avatar } from "radix-ui";
import ToggleChip from "../../../../components/ui/input/ToggleChip";

type Props = {
    role?: Membership["role"];
    role_name?: Membership["role_name"];
    email?: User["email"];
    picture: User["picture"];
    first_name?: User["first_name"];
    last_name?: User["last_name"];
    is_faculty?: User["is_faculty"];
    action?: ReactNode;
    className?: string;
    filledRole?: boolean;
};

const formatCapitals = (txt?: string) => {
    if (!txt) return "";
    return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
};

const OrgMember = ({
    role,
    role_name,
    email,
    picture,
    first_name,
    last_name,
    is_faculty,
    action,
    className = "",
    filledRole = false,
}: Props) => {
    const l1 =
        (role_name || formatCapitals(role)) + (is_faculty ? " - Faculty" : "");

    return (
        <div
            className={
                "flex flex-row flex-nowrap items-center justify-between gap-3 bg-layer-2 pr-4 pl-3 " +
                className
            }
        >
            <div
                className={
                    "min-h-16 py-2 w-fit max-w-full min-w-0 flex gap-3 items-center"
                }
            >
                <Avatar.Root className="w-10 h-10 shrink-0 rounded-md overflow-hidden">
                    <Avatar.Image
                        className="size-full object-cover"
                        src={picture}
                        alt={`${first_name} ${last_name}`}
                    />
                    <Avatar.Fallback
                        className="text-center size-full flex items-center justify-center bg-layer-3 text-xl text-typography-2"
                        delayMs={600}
                    >
                        {(first_name || "O").charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                </Avatar.Root>

                <div className={"flex flex-col min-w-0"}>
                    <h4
                        className={"line-clamp-2 break-words"}
                    >{`${first_name} ${last_name}`}</h4>
                    <p className={"truncate"}>{<>{email}</>}</p>
                    {filledRole && l1 && (
                        <span className="important mt-1.5 w-fit max-w-full truncate rounded-2xl bg-layer-2 px-2.5 py-0.5 text-xs text-typography-2 shadow-control sm:hidden">
                            {l1}
                        </span>
                    )}
                </div>
            </div>

            {(l1 || action) && (
                <div
                    className={
                        "my-3 max-w-full [&>button]:max-w-full [&>button]:truncate" +
                        (filledRole && !action ? " max-sm:hidden" : "") +
                        (action
                            ? " shrink-0 flex flex-col items-end gap-2 sm:flex-row sm:items-center"
                            : /* the name keeps most of the row; long roles cut off instead of wrapping */
                              " min-w-0 max-w-[45%] max-sm:max-w-[50%]")
                    }
                >
                    <ToggleChip title={l1} selectable={false} />
                    {action}
                </div>
            )}
        </div>
    );
};

export default OrgMember;
