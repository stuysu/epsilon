import { useMemo } from "react";
import CheckboxInput from "../../../../components/ui/input/CheckboxInput";
import { sortRooms } from "../../../../utils/DataFormatters";

type RoomOption = {
    id: number;
    name: string;
    floor?: number;
};

const chipClass =
    "text-nowrap px-3 pt-1 pb-[0.35rem] rounded-lg text-sm text-typography-2 transition-colors bg-layer-2 shadow-control sm:hover:bg-layer-3 cursor-pointer important";

const MAX_COLUMN_CHARS = 22;

const columnWidth = (rooms: RoomOption[]) =>
    Math.min(
        Math.max(...rooms.map((room) => room.name.length), 4),
        MAX_COLUMN_CHARS,
    );

const RoomChecklist = ({
    rooms,
    selected,
    onChange,
}: {
    rooms: RoomOption[];
    selected: number[];
    onChange: (selected: number[]) => void;
}) => {
    const floors = useMemo(() => {
        const groups: { floor: number | null; rooms: RoomOption[] }[] = [];

        for (const room of rooms.slice().sort(sortRooms)) {
            const floor: number | null = room.floor ?? null;
            const last = groups[groups.length - 1];

            if (last && last.floor === floor) {
                last.rooms.push(room);
            } else {
                groups.push({ floor, rooms: [room] });
            }
        }

        return groups;
    }, [rooms]);

    const setMany = (ids: number[], checked: boolean) => {
        const next = new Set(selected);
        ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
        onChange(Array.from(next));
    };

    const selectedCount = rooms.filter((room) =>
        selected.includes(room.id),
    ).length;

    return (
        <div className="my-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h4>Rooms</h4>
                <div className="flex flex-wrap items-center gap-2">
                    <p>
                        {selectedCount} of {rooms.length} selected
                    </p>
                    <button
                        type="button"
                        className={chipClass}
                        onClick={() => onChange(rooms.map((room) => room.id))}
                    >
                        Select all
                    </button>
                    <button
                        type="button"
                        className={chipClass}
                        onClick={() => onChange([])}
                    >
                        Select none
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {floors.map((group) => {
                    const ids = group.rooms.map((room) => room.id);
                    const count = ids.filter((id) =>
                        selected.includes(id),
                    ).length;
                    const floorLabel =
                        group.floor === null
                            ? "Other rooms"
                            : `Floor ${group.floor}`;

                    return (
                        <div
                            key={group.floor ?? "other"}
                            className="bg-layer-1 rounded-xl shadow-control p-4"
                        >
                            <label className="flex items-center gap-3 cursor-pointer">
                                <CheckboxInput
                                    checked={
                                        count === 0
                                            ? false
                                            : count === ids.length
                                              ? true
                                              : "indeterminate"
                                    }
                                    onChange={(checked) =>
                                        setMany(ids, checked)
                                    }
                                    label={`Select every room on ${floorLabel}`}
                                />
                                <span className="important">{floorLabel}</span>
                                <span className="text-sm text-typography-2">
                                    {count} of {ids.length}
                                </span>
                            </label>

                            <div
                                className="grid gap-x-6 gap-y-4 mt-4 pl-1"
                                style={{
                                    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, calc(${columnWidth(group.rooms)}ch + 2.75rem)), 1fr))`,
                                }}
                            >
                                {group.rooms.map((room) => (
                                    <label
                                        key={room.id}
                                        className="flex items-center gap-2.5 cursor-pointer"
                                    >
                                        <CheckboxInput
                                            checked={selected.includes(room.id)}
                                            onChange={(checked) =>
                                                setMany([room.id], checked)
                                            }
                                            label={`Room ${room.name}`}
                                        />
                                        <span className="min-w-0 break-words">
                                            {room.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoomChecklist;
