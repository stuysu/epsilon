import { Popover } from "radix-ui";
import dayjs from "dayjs";
import { DateField } from "../../../../../components/ui/input/DateTimeField";
import { MeetingWhen, meetingWhenOptions } from "./meetingFilters";

type Props = {
    when: MeetingWhen;
    from: string;
    to: string;
    onChange: (patch: {
        when?: MeetingWhen;
        from?: string;
        to?: string;
    }) => void;
};

export default function MeetingDateFilter({ when, from, to, onChange }: Props) {
    const active = when !== "any";
    return (
        <Popover.Root>
            <Popover.Trigger
                aria-label={`Meeting dates: ${meetingWhenOptions.find((o) => o.value === when)?.label}`}
                className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg outline-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1 ${
                    active
                        ? "text-accent"
                        : "text-typography-2 hover:text-typography-1"
                }`}
            >
                <i
                    className={`bx ${active ? "bxs-calendar" : "bx-calendar"} bx-sm`}
                    aria-hidden="true"
                />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={6}
                    collisionPadding={16}
                    className="z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-divider bg-bg p-1 shadow-2xl"
                >
                    <div role="radiogroup" aria-label="Meeting dates">
                        {meetingWhenOptions.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                role="radio"
                                aria-checked={when === o.value}
                                onClick={() => onChange({ when: o.value })}
                                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-typography-1 outline-0 hover:bg-layer-3 focus-visible:bg-layer-3"
                            >
                                {o.label}
                                {when === o.value && (
                                    <i
                                        className="bx bx-check"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                    {when === "custom" && (
                        <div className="flex flex-col gap-3 px-2 pb-2 pt-3">
                            {(["from", "to"] as const).map((end) => {
                                const day = end === "from" ? from : to;
                                return (
                                    <DateField
                                        key={end}
                                        label={end === "from" ? "From" : "To"}
                                        value={day ? dayjs(day) : null}
                                        onChange={(d) =>
                                            onChange({
                                                [end]: d?.isValid()
                                                    ? d.format("YYYY-MM-DD")
                                                    : "",
                                            })
                                        }
                                        sx={{ width: "100%" }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
