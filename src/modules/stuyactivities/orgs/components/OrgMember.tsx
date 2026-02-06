import { Avatar } from "radix-ui";
import InteractiveChip from "../../../../components/ui/input/InteractiveChip";
import React from "react";

type Props = {
    role?: Membership["role"];
    role_name?: Membership["role_name"];
    email?: User["email"];
    picture: User["picture"];
    first_name?: User["first_name"];
    last_name?: User["last_name"];
    is_faculty?: User["is_faculty"];
    approvalMode?: boolean;
    onApprove?: (e?: React.MouseEvent) => void;
    onReject?: (e?: React.MouseEvent) => void;
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
    approvalMode,
    onApprove,
    onReject,
}: Props) => {
    let l1 =
        role_name || formatCapitals(role) + (is_faculty ? " - Faculty" : "");

    return (
        <div
            className={
                "flex flex-row items-center justify-between flex-wrap bg-layer-2 pr-4 pl-3"
            }
        >
            <div className={"h-16 w-fit flex gap-3 items-center"}>
                <Avatar.Root className="w-10 h-10 rounded-md overflow-hidden">
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

                <div className={"flex flex-col"}>
                    <h4>{`${first_name} ${last_name}`}</h4>
                    <p>{<>{email}</>}</p>
                </div>
            </div>

            <div className={"my-3"}>
                {!approvalMode ? (
                    <InteractiveChip title={l1} selectable={false} flat={true} />
                ) : (
                    <>
                        <InteractiveChip
                            title="Approve"
                            selectable={false}
                            flat
                            onClick={(e) => {
                                e.stopPropagation();
                                onApprove?.(e as React.MouseEvent);
                            }}
                        />
                        <InteractiveChip
                            title="Reject"
                            selectable={false}
                            flat
                            onClick={(e) => {
                                e.stopPropagation();
                                onReject?.(e as React.MouseEvent);
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default OrgMember;
