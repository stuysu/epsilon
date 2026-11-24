import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { SUPPORT_EMAIL } from "../../../../config/constants";
import useLatest from "../../../../utils/useLatest";

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

type Preview = {
    date: string;
    roomIds: number[];
    meetings: {
        id: number;
        title: string;
        start_time: string;
        room_id: number;
        organization: string;
    }[];
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
    const [unblockIds, setUnblockIds] = useState<number[]>([]);
    const [reason, setReason] = useState("");
    const [roomsLoaded, setRoomsLoaded] = useState(false);
    /* the range the current blocks were fetched for */
    const [blocksFrom, setBlocksFrom] = useState<string | null>(null);
    const [confirming, setConfirming] = useState<Preview | null>(null);
    const [blocking, setBlocking] = useState(false);
    /* bumped on every change so late responses are ignored */
    const previewVersion = useRef(0);
    const fetchVersion = useRef(0);

    const dayKey = day.format(DATE_FORMAT);
    const isPast = day.isBefore(today, "day");
    /* blocks from today on, plus the picked day if it has passed */
    const fromKey = dayKey < todayKey ? dayKey : todayKey;
    /* refreshes after a block or unblock use the current day's range */
    const fromKeyRef = useLatest(fromKey);
    const loading = !roomsLoaded || blocksFrom !== fromKey;

    const fetchBlocks = useCallback(async () => {
        const version = ++fetchVersion.current;
        const from = fromKeyRef.current;
        const PAGE = 1000;
        const all: RoomBlock[] = [];
        for (let offset = 0; ; offset += PAGE) {
            const { data, error } = await supabase
                .from("room_blocks")
                .select("room_id, blocked_on, reason, rooms(name, floor)")
                .gte("blocked_on", from)
                .order("blocked_on", { ascending: true })
                .order("room_id", { ascending: true })
                .range(offset, offset + PAGE - 1)
                .returns<RoomBlock[]>();
            if (version !== fetchVersion.current) return;
            if (error || !data) {
                enqueueSnackbar("Failed to fetch blocked rooms.", {
                    variant: "error",
                });
                setBlocksFrom(from);
                return;
            }
            all.push(...data);
            if (data.length < PAGE) break;
        }
        setBlocks(all);
        setBlocksFrom(from);
    }, [enqueueSnackbar, fromKeyRef]);

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
            setRoomsLoaded(true);
        })();
    }, [enqueueSnackbar]);

    useEffect(() => {
        fetchBlocks();
    }, [fetchBlocks, fromKey]);

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

    /* "All rooms", whole floors as "Floor N", then any other rooms */
    const describeRooms = useCallback(
        (ids: number[]) => {
            const picked = new Set(ids);
            if (rooms.length && rooms.every((room) => picked.has(room.id))) {
                return "All rooms";
            }

            const floors = new Map<number, RoomOption[]>();
            for (const room of rooms) {
                if (room.floor == null) continue;
                floors.set(room.floor, [
                    ...(floors.get(room.floor) ?? []),
                    room,
                ]);
            }

            const parts: string[] = [];
            const covered = new Set<number>();
            for (const [floor, floorRooms] of Array.from(floors).sort(
                (a, b) => a[0] - b[0],
            )) {
                if (
                    floorRooms.length > 1 &&
                    floorRooms.every((room) => picked.has(room.id))
                ) {
                    parts.push(`Floor ${floor}`);
                    floorRooms.forEach((room) => covered.add(room.id));
                }
            }

            const rest = rooms
                .filter((room) => picked.has(room.id) && !covered.has(room.id))
                .sort(sortRooms)
                .map((room) => room.name);
            return [...parts, ...rest].join(", ");
        },
        [rooms],
    );

    const upcoming = useMemo(() => {
        const groups: { date: string; roomIds: number[] }[] = [];
        for (const block of blocks) {
            if (dayjs(block.blocked_on).isBefore(today, "day")) continue;
            const last = groups[groups.length - 1];
            if (last && last.date === block.blocked_on) {
                last.roomIds.push(block.room_id);
            } else {
                groups.push({
                    date: block.blocked_on,
                    roomIds: [block.room_id],
                });
            }
        }
        return groups.map((group) => ({
            date: group.date,
            rooms: describeRooms(group.roomIds),
        }));
    }, [blocks, today, describeRooms]);

    const roomsToBlock = openRooms.filter((room) =>
        selectedRoomIds.includes(room.id),
    );

    const resetPreview = () => {
        previewVersion.current++;
        setConfirming(null);
    };

    const pickDay = (next: Dayjs) => {
        if (blocking) return;
        setDay(next.startOf("day"));
        setSelectedRoomIds([]);
        setUnblockIds([]);
        resetPreview();
    };

    const roomName = (id: number) =>
        rooms.find((room) => room.id === id)?.name ?? "Unknown room";

    const startBlocking = async () => {
        if (!roomsToBlock.length) {
            enqueueSnackbar("Select at least one room.", { variant: "error" });
            return;
        }

        const version = ++previewVersion.current;
        const date = dayKey;
        const roomIds = roomsToBlock.map((room) => room.id);
        const dayStart = wallClockToISO(day);
        const dayEnd = wallClockToISO(day.add(1, "day"));

        const { data: meetings, error } = await supabase
            .from("meetings")
            .select("id, title, start_time, room_id, organizations!inner(name)")
            .in("room_id", roomIds)
            .lt("start_time", dayEnd)
            .gt("end_time", dayStart)
            .gt("start_time", new Date().toISOString())
            .order("start_time", { ascending: true })
            .returns<
                {
                    id: number;
                    title: string;
                    start_time: string;
                    room_id: number;
                    organizations: { name: string };
                }[]
            >();

        /* the day or rooms changed while this was loading */
        if (version !== previewVersion.current) return;

        if (error || !meetings) {
            enqueueSnackbar(
                `Couldn't check the meetings in these rooms, so nothing was blocked. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }

        setConfirming({
            date,
            roomIds,
            meetings: meetings.map((meeting) => ({
                id: meeting.id,
                title: meeting.title,
                start_time: meeting.start_time,
                room_id: meeting.room_id,
                organization: meeting.organizations.name,
            })),
        });
    };

    /* blocks exactly what was previewed */
    const blockRooms = async (preview: Preview) => {
        setBlocking(true);
        const { data, error } = await supabase.functions
            .invoke("block-rooms", {
                body: {
                    date: preview.date,
                    room_ids: preview.roomIds,
                    reason: reason.trim() || undefined,
                },
            })
            .catch((error) => ({ data: null, error }));

        if (error) {
            setBlocking(false);
            const message = await functionErrorText(error);
            enqueueSnackbar(message || "Failed to block rooms.", {
                variant: "error",
            });
            return;
        }

        const result = data as {
            blocked: number[];
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
                `Couldn't email ${result.unemailed.length === 1 ? "1 Activity" : `${result.unemailed.length} Activities`} about the cancellations. Contact ${SUPPORT_EMAIL}.`,
                { variant: "error" },
            );
        }
        /* stay locked until the new blocks are in, so they can't be picked again */
        await fetchBlocks();
        resetPreview();
        setSelectedRoomIds([]);
        setReason("");
        setBlocking(false);
    };

    const blockedRooms = dayBlocks.map((block) => ({
        id: block.room_id,
        name: block.rooms?.name ?? "Unknown room",
        floor: block.rooms?.floor,
    }));
    const toUnblock = unblockIds.filter((id) =>
        dayBlocks.some((block) => block.room_id === id),
    );

    /* each reason with how many rooms it covers */
    const reasons = Array.from(
        dayBlocks.reduce((counts, block) => {
            if (block.reason) {
                counts.set(block.reason, (counts.get(block.reason) ?? 0) + 1);
            }
            return counts;
        }, new Map<string, number>()),
    );

    const unblock = async () => {
        const { data, error } = await supabase
            .from("room_blocks")
            .delete()
            .eq("blocked_on", dayKey)
            .in("room_id", toUnblock)
            .select("room_id");
        if (error || !data?.length) {
            enqueueSnackbar("Failed to unblock rooms.", { variant: "error" });
            await fetchBlocks();
            return;
        }
        enqueueSnackbar(`${plural(data.length, "room")} unblocked.`, {
            variant: "success",
        });
        setUnblockIds([]);
        await fetchBlocks();
    };

    return (
        <div className={"w-full p-4 sm:p-12"}>
            <h1>Block Rooms</h1>
            <hr className="border-divider" />
            <p className="my-4">
                Block rooms for a whole day. Meetings in those rooms that day
                are cancelled and their Activities are emailed.
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
                        {!roomsLoaded || blocksFrom === null ? (
                            <p>Loading...</p>
                        ) : upcoming.length ? (
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
                                        <span className="text important block">
                                            {dayjs(group.date).format(
                                                "ddd, MMM D",
                                            )}
                                        </span>
                                        <span className="text block truncate">
                                            {group.rooms}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p>No rooms are blocked from today on.</p>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0 w-full">
                    <h2>{day.format("dddd, MMMM D, YYYY")}</h2>

                    {loading ? (
                        <p className="mt-3">Loading...</p>
                    ) : dayBlocks.length ? (
                        <>
                            {reasons.length > 0 && (
                                <div className="mt-3">
                                    {reasons.map(([text, count]) => (
                                        <p
                                            key={text}
                                            className="wrap-break-word"
                                        >
                                            <span className="important">
                                                {text}
                                            </span>
                                            {reasons.length > 1 ||
                                            count < dayBlocks.length
                                                ? ` · ${plural(count, "room")}`
                                                : ""}
                                        </p>
                                    ))}
                                </div>
                            )}
                            <RoomChecklist
                                title="Blocked rooms"
                                collapsible
                                rooms={blockedRooms}
                                selected={unblockIds}
                                onChange={setUnblockIds}
                            />
                            <AsyncButton
                                onClick={unblock}
                                disabled={!toUnblock.length}
                                sx={{ width: "100%" }}
                            >
                                {toUnblock.length
                                    ? `Unblock ${plural(toUnblock.length, "Room")}`
                                    : "Unblock Rooms"}
                            </AsyncButton>
                            <hr className="border-divider my-6" />
                        </>
                    ) : (
                        <p className="mt-3">
                            No rooms are blocked on this day.
                        </p>
                    )}

                    {isPast ? (
                        <p className="mt-4">
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
                                    title="Open rooms"
                                    collapsible
                                    rooms={openRooms}
                                    selected={selectedRoomIds}
                                    onChange={(ids) => {
                                        if (blocking) return;
                                        setSelectedRoomIds(ids);
                                        resetPreview();
                                    }}
                                />

                                {confirming ? (
                                    <div className="bg-layer-1 rounded-xl shadow-control p-4 mt-2">
                                        <p className="important">
                                            Block{" "}
                                            {confirming.roomIds.length === 1
                                                ? roomName(
                                                      confirming.roomIds[0],
                                                  )
                                                : plural(
                                                      confirming.roomIds.length,
                                                      "room",
                                                  )}{" "}
                                            on{" "}
                                            {dayjs(confirming.date).format(
                                                "MMMM D",
                                            )}
                                            ?
                                        </p>
                                        <p className="mt-1">
                                            {confirming.meetings.length
                                                ? `${plural(confirming.meetings.length, "meeting")} will be cancelled and their Activities will be emailed:`
                                                : "No meetings will be cancelled."}
                                        </p>
                                        {confirming.meetings.length > 0 && (
                                            <ul className="text mt-1">
                                                {confirming.meetings.map(
                                                    (meeting) => (
                                                        <li key={meeting.id}>
                                                            {isoToWallClock(
                                                                meeting.start_time,
                                                            ).format(
                                                                "h:mm A",
                                                            )}{" "}
                                                            · {meeting.title} ·{" "}
                                                            {
                                                                meeting.organization
                                                            }{" "}
                                                            ·{" "}
                                                            {roomName(
                                                                meeting.room_id,
                                                            )}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <AsyncButton
                                                onClick={() =>
                                                    blockRooms(confirming)
                                                }
                                            >
                                                Confirm Block
                                            </AsyncButton>
                                            <AsyncButton
                                                onClick={resetPreview}
                                                disabled={blocking}
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
