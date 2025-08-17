import { Avatar } from "radix-ui";
import ToggleChip from "../../../../components/ui/ToggleChip";

type Props = {
    role?: Membership["role"];
    role_name?: Membership["role_name"];
    email?: User["email"];
    picture: User["picture"];
    first_name?: User["first_name"];
    last_name?: User["last_name"];
    is_faculty?: User["is_faculty"];
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
}: Props) => {
    let l1 =
        role_name || formatCapitals(role) + (is_faculty ? " - Faculty" : "");

    return (
        <div
            className={
                "flex flex-row items-center justify-between flex-wrap bg-layer-2 px-4"
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
                        className="text-center size-full flex items-center justify-center bg-layer-3 text-xl relative pt-1 text-typography-2"
                        delayMs={600}
                    >
                        {(first_name || "O").charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                </Avatar.Root>

                <div className={"flex flex-col pt-1"}>
                    <h4>{`${first_name} ${last_name}`}</h4>
                    <p>{<>{email}</>}</p>
                </div>
            </div>

            <div className={"my-3"}>
                <ToggleChip title={l1} selectable={false} />
            </div>
        </div>
    );
};

export default OrgMember;
