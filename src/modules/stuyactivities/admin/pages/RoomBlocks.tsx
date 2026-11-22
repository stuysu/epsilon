import { useCallback, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import dayjs, { Dayjs } from "dayjs";
import { supabase } from "../../../../lib/supabaseClient";
import { Calendar } from "../../../../components/ui/input/DateTimeField";
import TextField from "../../../../components/ui/input/TextField";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import RoomChecklist from "../components/RoomChecklist";
import { isoToWallClock, wallClockToISO } from "../../../../utils/NewYorkTime";
import { functionErrorText } from "../../../../utils/FunctionErrors";
import { sortRooms } from "../../../../utils/DataFormatters";

type RoomOption = {
    id: number;
    name: string;
    floor?: number;
};

type RoomBlock = {
    room_id: number;
    blocked_on: string;
    reason: string | null;
    rooms: { name: string; floor?: number } | null;
};

const DATE_FORMAT = "YYYY-MM-DD";

const plural = (count: number, word: string) =>
    `${count} ${word}${count === 1 ? "" : "s"}`;

const RoomBlocks = () => {
    const { enqueueSnackbar } = useSnackbar();

    /* New York's today, not the browser's */
    const todayKey = isoToWallClock().format(DATE_FORMAT);
    const today = useMemo(() => dayjs(todayKey), [todayKey]);
    const [day, setDay] = useState<Dayjs>(today);
    const [rooms, setRooms] = useState<RoomOption[]>([]);
    const [blocks, setBlocks] = useState<RoomBlock[]>([]);
    const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState<{
        meetings: number;
        heldRoomIds: number[];
    } | null>(null);

    const dayKey = day.format(DATE_FORMAT);
    const isPast = day.isBefore(today, "day");
    /* blocks from today on, plus the picked day if it has passed */
    const fromKey = dayKey < todayKey ? dayKey : todayKey;

    const fetchBlocks = useCallback(async () => {
        const PAGE = 1000;
        const all: RoomBlock[] = [];
        for (let from = 0; ; from += PAGE) {
            const { data, error } = await supabase
                .from("room_blocks")
                .select("room_id, blocked_on, reason, rooms(name, floor)")
                .gte("blocked_on", fromKey)
                .order("blocked_on", { ascending: true })
                .order("room_id", { ascending: true })
                .range(from, from + PAGE - 1)
                .returns<RoomBlock[]>();
            if (error || !data) {
                enqueueSnackbar("Failed to fetch blocked rooms.", {
                    variant: "error",
                });
                return;
            }
            all.push(...data);
            if (data.length < PAGE) break;
        }
        setBlocks(all);
    }, [enqueueSnackbar, fromKey]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("rooms")
                .select("id, name, floor")
                .order("name", { ascending: true });
            if (error || !data) {
                enqueueSnackbar("Failed to fetch rooms.", {
                    variant: "error",
                });
            } else {
                setRooms(data);
            }
            setLoading(false);
        })();
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchBlocks();
    }, [fetchBlocks]);

    const blockedDays = useMemo(
        () => new Set(blocks.map((block) => block.blocked_on)),
        [blocks],
    );

    const dayBlocks = useMemo(
        () =>
            blocks
                .filter((block) => block.blocked_on === dayKey)
                .sort((a, b) =>
                    sortRooms(
                        { name: a.rooms?.name ?? "", floor: a.rooms?.floor },
                        { name: b.rooms?.name ?? "", floor: b.rooms?.floor },
                    ),
                ),
        [blocks, dayKey],
    );

    const openRooms = useMemo(
        () =>
            rooms.filter(
                (room) => !dayBlocks.some((block) => block.room_id === room.id),
            ),
        [rooms, dayBlocks],
    );

    const upcoming = useMemo(() => {
        const groups: { date: string; rooms: string[] }[] = [];
        for (const block of blocks) {
            if (dayjs(block.blocked_on).isBefore(today, "day")) continue;
            const last = groups[groups.length - 1];
            const name = block.rooms?.name ?? "Unknown room";
            if (last && last.date === block.blocked_on) last.rooms.push(name);
            else groups.push({ date: block.blocked_on, rooms: [name] });
        }
        return groups;
    }, [blocks, today]);

    const roomsToBlock = openRooms.filter((room) =>
        selectedRoomIds.includes(room.id),
    );

    const pickDay = (next: Dayjs) => {
        setDay(next.startOf("day"));
        setSelectedRoomIds([]);
        setConfirming(null);
    };

    const startBlocking = async () => {
        if (!roomsToBlock.length) {
            enqueueSnackbar("Select at least one room.", { variant: "error" });
            return;
        }

        const dayStart = wallClockToISO(day);
        const dayEnd = wallClockToISO(day.add(1, "day"));

        const { data: meetings, error } = await supabase
            .from("meetings")
            .select("id, room_id, organizations!inner(state)")
            .in(
                "room_id",
                roomsToBlock.map((room) => room.id),
            )
            .lt("start_time", dayEnd)
            .gt("end_time", dayStart)
            .gt("start_time", new Date().toISOString())
            .returns<
                {
                    id: number;
                    room_id: number;
                    organizations: { state: string };
                }[]
            >();

        if (error || !meetings) {
            enqueueSnackbar(
                "Couldn't check the meetings in these rooms, so nothing was blocked. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        const heldRoomIds = Array.from(
            new Set(
                meetings
                    .filter(
                        (meeting) => meeting.organizations.state === "ADMIN",
                    )
                    .map((meeting) => meeting.room_id),
            ),
        );

        setConfirming({
            meetings: meetings.filter(
                (meeting) => !heldRoomIds.includes(meeting.room_id),
            ).length,
            heldRoomIds,
        });
    };

    const blockRooms = async () => {
        const { data, error } = await supabase.functions.invoke("block-rooms", {
            body: {
                date: dayKey,
                room_ids: roomsToBlock.map((room) => room.id),
                reason: reason.trim() || undefined,
            },
        });

        if (error) {
            const message = await functionErrorText(error);
            enqueueSnackbar(message || "Failed to block rooms.", {
                variant: "error",
            });
            return;
        }

        const result = data as {
            blocked: number[];
            held: number[];
            cancelled: number;
            unemailed: number[];
        };

        enqueueSnackbar(
            `${plural(result.blocked.length, "room")} blocked${
                result.cancelled
                    ? `, ${plural(result.cancelled, "meeting")} cancelled`
                    : ""
            }.`,
            { variant: "success" },
        );
        if (result.unemailed.length) {
            enqueueSnackbar(
                `Couldn't email ${result.unemailed.length === 1 ? "1 Activity" : `${result.unemailed.length} Activities`} about the cancellations. Contact it@stuysu.org.`,
                { variant: "error" },
            );
        }
        if (result.held.length) {
            enqueueSnackbar(
                `${plural(result.held.length, "room")} held by an admin club ${
                    result.held.length === 1 ? "was" : "were"
                } not blocked.`,
                { variant: "warning" },
            );
        }

        setConfirming(null);
        setSelectedRoomIds(result.held);
        setReason("");
        await fetchBlocks();
    };

    const unblock = async (block: RoomBlock) => {
        const { error } = await supabase
            .from("room_blocks")
            .delete()
            .eq("room_id", block.room_id)
            .eq("blocked_on", block.blocked_on);
        if (error) {
            enqueueSnackbar("Failed to unblock room.", { variant: "error" });
            return;
        }
        enqueueSnackbar(`${block.rooms?.name ?? "Room"} unblocked.`, {
            variant: "success",
        });
        await fetchBlocks();
    };

    return (
        <div className={"w-full p-4 sm:p-12"}>
            <h1>Block Rooms</h1>
            <hr className="border-divider" />
            <p className="my-4 max-w-2xl">
                Block rooms for a whole day. Meetings in those rooms that day
                are cancelled and their Activities are emailed, and no one can
                book them until they're unblocked.
            </p>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex flex-col gap-4 w-full lg:w-auto shrink-0">
                    <div className="bg-layer-1 rounded-xl shadow-control w-fit max-w-full">
                        <Calendar
                            value={day}
                            onSelect={pickDay}
                            today={today}
                            marked={(date) =>
                                blockedDays.has(date.format(DATE_FORMAT))
                            }
                            markLabel="has blocked rooms"
                        />
                    </div>

                    <div className="lg:w-[296px]">
                        <h4 className="mb-2">Upcoming</h4>
                        {upcoming.length ? (
                            <div className="flex flex-col gap-1">
                                {upcoming.map((group) => (
                                    <button
                                        key={group.date}
                                        type="button"
                                        onClick={() =>
                                            pickDay(dayjs(group.date))
                                        }
                                        className={`text-left rounded-lg px-3 py-2 transition-colors hover:bg-layer-2 ${
                                            group.date === dayKey
                                                ? "bg-layer-2"
                                                : ""
                                        }`}
                                    >
                                        <span className="important block">
                                            {dayjs(group.date).format(
                                                "ddd, MMM D",
                                            )}
                                        </span>
                                        <span className="text-sm text-typography-2 block truncate">
                                            {group.rooms.join(", ")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-typography-2">
                                No rooms are blocked from today on.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0 w-full">
                    <h2>{day.format("dddd, MMMM D, YYYY")}</h2>

                    <div className="bg-layer-1 rounded-xl shadow-control p-4 mt-3">
                        <h4 className="mb-2">Blocked rooms</h4>
                        {loading ? (
                            <p>Loading...</p>
                        ) : dayBlocks.length ? (
                            <div className="flex flex-col">
                                {dayBlocks.map((block) => (
                                    <div
                                        key={block.room_id}
                                        className="flex items-center justify-between gap-3 py-2 border-b border-divider last:border-b-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="important">
                                                {block.rooms?.name ??
                                                    "Unknown room"}
                                            </p>
                                            {block.reason && (
                                                <p className="text-sm text-typography-2 break-words">
                                                    {block.reason}
                                                </p>
                                            )}
                                        </div>
                                        <AsyncButton
                                            onClick={() => unblock(block)}
                                        >
                                            Unblock
                                        </AsyncButton>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-typography-2">
                                No rooms are blocked on this day.
                            </p>
                        )}
                    </div>

                    {isPast ? (
                        <p className="mt-4 text-typography-2">
                            This day has passed, so rooms can't be blocked on
                            it.
                        </p>
                    ) : (
                        !loading && (
                            <>
                                <TextField
                                    label="Reason"
                                    placeholder="Building closed"
                                    helperText="Optional. Included in the cancellation emails."
                                    value={reason}
                                    onChange={(event) =>
                                        setReason(event.target.value)
                                    }
                                    maxLength={500}
                                    sx={{ width: "100%", marginTop: "20px" }}
                                />

                                <RoomChecklist
                                    rooms={openRooms}
                                    selected={selectedRoomIds}
                                    onChange={(ids) => {
                                        setSelectedRoomIds(ids);
                                        setConfirming(null);
                                    }}
                                />

                                {confirming ? (
                                    <div className="bg-layer-1 rounded-xl shadow-control p-4 mt-2">
                                        <p className="important">
                                            Block{" "}
                                            {roomsToBlock.length === 1
                                                ? roomsToBlock[0].name
                                                : plural(
                                                      roomsToBlock.length,
                                                      "room",
                                                  )}{" "}
                                            on {day.format("MMMM D")}?
                                        </p>
                                        <p className="mt-1">
                                            {confirming.meetings
                                                ? `${plural(confirming.meetings, "meeting")} will be cancelled and their Activities will be emailed.`
                                                : "No meetings will be cancelled."}
                                        </p>
                                        {confirming.heldRoomIds.length > 0 && (
                                            <p className="mt-1">
                                                {roomsToBlock
                                                    .filter((room) =>
                                                        confirming.heldRoomIds.includes(
                                                            room.id,
                                                        ),
                                                    )
                                                    .map((room) => room.name)
                                                    .join(", ")}{" "}
                                                {confirming.heldRoomIds
                                                    .length === 1
                                                    ? "is"
                                                    : "are"}{" "}
                                                held by an admin club and will
                                                not be blocked.
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <AsyncButton onClick={blockRooms}>
                                                Confirm Block
                                            </AsyncButton>
                                            <AsyncButton
                                                onClick={() =>
                                                    setConfirming(null)
                                                }
                                            >
                                                Cancel
                                            </AsyncButton>
                                        </div>
                                    </div>
                                ) : (
                                    <AsyncButton
                                        onClick={startBlocking}
                                        disabled={!roomsToBlock.length}
                                        sx={{
                                            width: "100%",
                                            marginTop: "10px",
                                        }}
                                    >
                                        {roomsToBlock.length
                                            ? `Block ${plural(roomsToBlock.length, "Room")}`
                                            : "Block Rooms"}
                                    </AsyncButton>
                                )}
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomBlocks;
