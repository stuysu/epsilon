import { useSnackbar } from "notistack";
import { functionErrorText } from "../../../../utils/FunctionErrors";
import { useState } from "react";

import { supabase } from "../../../../lib/supabaseClient";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import RoomGrants from "./RoomGrants";
import CheckboxInput from "../../../../components/ui/input/CheckboxInput";
import CheckboxField from "../../../../components/ui/input/CheckboxField";
import { SUPPORT_EMAIL } from "../../../../config/constants";
import { toNewYork } from "../../../../utils/NewYorkTime";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const dayName = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

type CancelResult = { cancelled?: number; unemailed?: number[] };

const AdminRoom = ({
    roomId,
    name,
    floor,
    availableDays,
    comments,
    approvalRequired,
    aisDays,
    onDelete,
    create,
    onCreate,
}: {
    roomId?: number;
    name?: string;
    floor?: number;
    availableDays?: Room["available_days"];
    comments?: string;
    approvalRequired?: boolean;
    aisDays?: string[];
    onDelete?: () => void;
    create?: boolean;
    onCreate?: (room: {
        name: string;
        floor: number;
        available_days: string;
        comments: string;
        approval_required: boolean;
        ais_days: string[];
    }) => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();

    const [roomName, setRoomName] = useState(name);
    const [roomFloor, setRoomFloor] = useState(floor);
    const [roomAvailableDays, setRoomAvailableDays] = useState(
        availableDays || [],
    );
    const [roomApprovalRequired, setRoomApprovalRequired] =
        useState(approvalRequired);

    const [roomAisDays, setRoomAisDays] = useState<string[]>(aisDays || []);
    const [aisExpanded, setAisExpanded] = useState(false);
    const [clubsExpanded, setClubsExpanded] = useState(false);

    const [isChanged, setIsChanged] = useState(false);
    const [confirm, setConfirm] = useState(false);
    // upcoming meetings in the room; null when they couldn't be counted
    const [upcoming, setUpcoming] = useState<number | null>(null);
    const [savedDays, setSavedDays] = useState<string[]>(availableDays || []);
    const [savedAisDays, setSavedAisDays] = useState<string[]>(aisDays || []);
    const [confirmSave, setConfirmSave] = useState(false);
    // upcoming meetings that saving cancels; null when unknown
    const [cancelling, setCancelling] = useState<number | null>(null);
    const removedDays = savedDays.filter(
        (d) => !roomAvailableDays.includes(d as Room["available_days"][number]),
    );
    const addedAis = roomAisDays.filter((d) => !savedAisDays.includes(d));
    const changedDays = [...new Set([...removedDays, ...addedAis])];
    const trimmedName = roomName?.trim() ?? "";
    const room = trimmedName || "this room";
    const changeText = [
        removedDays.length &&
            `Taking ${removedDays.map(dayName).join(", ")} off ${room}`,
        addedAis.length &&
            `${removedDays.length ? "making" : "Making"} ${addedAis
                .map(dayName)
                .join(
                    ", ",
                )} AIS-only${removedDays.length ? "" : ` in ${room}`}`,
    ]
        .filter(Boolean)
        .join(" and ");

    const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

    const reportCancelled = (result: CancelResult | null, done: string) => {
        const cancelled = result?.cancelled ?? 0;
        enqueueSnackbar(
            `${done}${cancelled ? `, ${plural(cancelled, "meeting")} cancelled` : ""}.`,
            { variant: "success" },
        );
        const unemailed = result?.unemailed?.length ?? 0;
        if (unemailed)
            enqueueSnackbar(
                `Couldn't email ${unemailed === 1 ? "1 Activity" : `${unemailed} Activities`} about the cancellations. Contact ${SUPPORT_EMAIL}.`,
                { variant: "error" },
            );
    };

    const validate = () => {
        if (!trimmedName) {
            enqueueSnackbar("Room name is required.", { variant: "error" });
            return false;
        }
        if (
            roomFloor === undefined ||
            roomFloor === null ||
            Number.isNaN(roomFloor)
        ) {
            enqueueSnackbar("Room floor is required", { variant: "error" });
            return false;
        }
        return true;
    };

    // taking days off the room or making them AIS days cancels meetings, so ask first
    const requestSave = async () => {
        if (!isChanged || !validate()) return;
        if (!removedDays.length && !addedAis.length) return saveRoom();
        setCancelling(await countCancelled());
        setConfirmSave(true);
    };

    /* the same meetings update_room cancels: none reserved by an admin; on
       new AIS days all others; on removed days not those of clubs with
       access to the room or admin clubs */
    const countCancelled = async () => {
        const [meetings, grants] = await Promise.all([
            supabase
                .from("meetings")
                .select(
                    "start_time, reserved_by_admin, organization_id, organizations (state)",
                )
                .eq("room_id", roomId)
                .gte("start_time", new Date().toISOString()),
            supabase
                .from("room_grants")
                .select("organization_id")
                .eq("room_id", roomId),
        ]);
        if (meetings.error || grants.error) return null;
        const granted = new Set(grants.data.map((g) => g.organization_id));
        return meetings.data.filter((m) => {
            const day = toNewYork(m.start_time).format("dddd").toUpperCase();
            return (
                !m.reserved_by_admin &&
                (addedAis.includes(day) ||
                    (removedDays.includes(day) &&
                        !granted.has(m.organization_id) &&
                        (m.organizations as { state?: string } | null)
                            ?.state !== "ADMIN"))
            );
        }).length;
    };

    const saveRoom = async () => {
        if (!isChanged || !validate()) return;

        const { data, error: saveError } = await supabase.functions.invoke(
            "update-room",
            {
                body: {
                    room_id: roomId,
                    name: trimmedName,
                    floor: roomFloor,
                    available_days: roomAvailableDays,
                    comments,
                    approval_required: roomApprovalRequired,
                    ais_days: roomAisDays,
                },
            },
        );

        if (saveError) {
            enqueueSnackbar(
                (await functionErrorText(saveError)) || "Failed to save room",
                { variant: "error" },
            );
            return;
        }

        setIsChanged(false);
        setRoomName(trimmedName);
        setSavedDays(roomAvailableDays);
        setSavedAisDays(roomAisDays);
        reportCancelled(
            data as CancelResult | null,
            `Room ${trimmedName} saved`,
        );
    };

    const requestDelete = async () => {
        const { count, error } = await supabase
            .from("meetings")
            .select("id", { count: "exact", head: true })
            .eq("room_id", roomId)
            .gte("start_time", new Date().toISOString());
        setUpcoming(error ? null : (count ?? null));
        setConfirm(true);
    };

    const deleteRoom = async () => {
        const { data, error: deleteError } = await supabase.functions.invoke(
            "delete-room",
            {
                body: {
                    room_id: roomId,
                },
            },
        );

        if (deleteError) {
            enqueueSnackbar(
                (await functionErrorText(deleteError)) ||
                    "Failed to delete room",
                { variant: "error" },
            );
            return;
        }

        reportCancelled(
            data as CancelResult | null,
            `Room ${trimmedName} deleted`,
        );
        if (onDelete) onDelete();
    };

    const createRoom = async () => {
        if (!validate()) return;

        const { error: createError } = await supabase.from("rooms").insert({
            name: trimmedName,
            floor: roomFloor,
            available_days: roomAvailableDays.join(", "),
            comments,
            approval_required: roomApprovalRequired,
            ais_days: roomAisDays,
        });
        if (createError) {
            enqueueSnackbar(
                createError.code === "23505"
                    ? "A room with that name already exists."
                    : "Failed to create room",
                { variant: "error" },
            );
            return;
        }

        enqueueSnackbar(`Room ${trimmedName} created!`, { variant: "success" });
        if (onCreate) {
            onCreate({
                name: trimmedName,
                floor: roomFloor || -1,
                available_days: roomAvailableDays.join(", "),
                comments: "",
                approval_required: roomApprovalRequired || false,
                ais_days: roomAisDays,
            });
        }
        // clear the row for the next room
        setRoomName(undefined);
        setRoomFloor(undefined);
        setRoomAvailableDays([]);
        setRoomApprovalRequired(undefined);
        setRoomAisDays([]);
        setIsChanged(false);
    };

    return (
        <div className="border-b border-divider w-full pb-3">
            <div className="gap-3 flex h-12 justify-between w-full items-center">
                <input
                    value={roomName || ""}
                    maxLength={255}
                    className="text text-typography-1 w-52 rounded-md px-3 h-9 bg-layer-1 outline-hidden placeholder:text-typography-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1"
                    placeholder="Room name"
                    onChange={(e) => {
                        setRoomName(e.target.value);
                        setIsChanged(true);
                    }}
                />

                <input
                    value={roomFloor ?? ""}
                    className="text text-typography-1 rounded-md px-3 w-16 h-9 bg-layer-1 outline-hidden placeholder:text-typography-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1"
                    placeholder="Floor"
                    inputMode="numeric"
                    onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setRoomFloor(Number.isNaN(v) ? undefined : v);
                        setIsChanged(true);
                    }}
                />

                <div className="w-36 flex justify-center">
                    <CheckboxInput
                        checked={Boolean(roomApprovalRequired)}
                        label="Approval required"
                        onChange={(checked) => {
                            setRoomApprovalRequired(checked);
                            setIsChanged(true);
                        }}
                    />
                </div>

                <div className="w-96">
                    <div className="flex flex-wrap justify-center">
                        {(DAYS as Room["available_days"]).map((day) => (
                            <CheckboxField
                                key={day}
                                checked={Boolean(
                                    roomAvailableDays?.includes(day),
                                )}
                                label={day.slice(0, 2)}
                                onChange={(checked) => {
                                    if (checked) {
                                        setRoomAvailableDays([
                                            ...roomAvailableDays,
                                            day,
                                        ]);
                                    } else {
                                        setRoomAvailableDays(
                                            roomAvailableDays?.filter(
                                                (d) => d !== day,
                                            ),
                                        );
                                    }
                                    setIsChanged(true);
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-1 w-44">
                    {create ? (
                        <button
                            aria-label="Create room"
                            title="Create room"
                            className="h-10 w-10 grid place-items-center rounded-md sm:hover:bg-layer-2"
                            onClick={createRoom}
                        >
                            <i className="bx bx-plus text-green text-2xl" />
                        </button>
                    ) : (
                        <>
                            <button
                                aria-label="Toggle AIS days"
                                title="AIS days"
                                className={`h-10 w-10 grid place-items-center rounded-md sm:hover:bg-layer-2 text-sm font-bold ${
                                    roomAisDays.length > 0
                                        ? "text-red"
                                        : "text-typography-2"
                                }`}
                                onClick={() => setAisExpanded((prev) => !prev)}
                            >
                                AIS
                            </button>
                            <button
                                aria-label="Toggle clubs"
                                title="Special Access"
                                className="h-10 w-10 grid place-items-center rounded-md sm:hover:bg-layer-2 text-typography-2"
                                onClick={() =>
                                    setClubsExpanded((prev) => !prev)
                                }
                            >
                                <i className="bx bx-group text-2xl" />
                            </button>
                            <button
                                aria-label="Save room"
                                title="Save changes"
                                disabled={!isChanged}
                                className={`h-10 w-10 grid place-items-center rounded-md ${
                                    isChanged
                                        ? "sm:hover:bg-layer-2"
                                        : "opacity-40 cursor-not-allowed"
                                }`}
                                onClick={requestSave}
                            >
                                <i className="bx bx-save text-typography-1 text-2xl" />
                            </button>
                            <button
                                aria-label="Delete room"
                                title="Delete room"
                                className="h-10 w-10 grid place-items-center rounded-md sm:hover:bg-layer-2"
                                onClick={requestDelete}
                            >
                                <i className="bx bx-trash text-red text-2xl" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {aisExpanded && !create && (
                <div className="flex items-center gap-3 pl-2 pt-1 pb-1 justify-end">
                    <p className="text-sm text-typography-2 whitespace-nowrap">
                        AIS Days:
                    </p>
                    <div>
                        <div className="flex flex-wrap">
                            {DAYS.map((day) => (
                                <CheckboxField
                                    key={day}
                                    checked={Boolean(roomAisDays.includes(day))}
                                    label={day.slice(0, 2)}
                                    onChange={(checked) => {
                                        if (checked) {
                                            setRoomAisDays([
                                                ...roomAisDays,
                                                day,
                                            ]);
                                        } else {
                                            setRoomAisDays(
                                                roomAisDays.filter(
                                                    (d) => d !== day,
                                                ),
                                            );
                                        }
                                        setIsChanged(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {clubsExpanded && !create && roomId !== undefined && (
                <RoomGrants roomId={roomId} roomName={roomName} />
            )}

            <UserDialog
                title="Delete Room?"
                description={`${
                    upcoming === 0
                        ? `${roomName || "This room"} has no upcoming meetings.`
                        : `Deleting ${roomName || "this room"} cancels ${
                              upcoming === null
                                  ? "its upcoming meetings"
                                  : `its ${plural(upcoming, "upcoming meeting")}`
                          } and emails their Activities.`
                } Past meetings keep their record without a room. This can't be undone.`}
                imageSrc="/symbols/warning.png"
                confirmText="Delete Room"
                onConfirm={deleteRoom}
                onClose={() => setConfirm(false)}
                open={confirm}
            />
            <UserDialog
                title="Change Days?"
                description={`${changeText} ${
                    cancelling === 0
                        ? "cancels none of its meetings."
                        : `cancels ${
                              cancelling === null
                                  ? "its upcoming meetings"
                                  : `its ${plural(cancelling, "upcoming meeting")}`
                          } on ${
                              changedDays.length === 1
                                  ? "that day"
                                  : "those days"
                          } and emails their Activities.`
                } ${
                    !addedAis.length
                        ? "Meetings of Activities with special access or admin reservations stay."
                        : removedDays.length
                          ? "Admin reservations stay, and so do meetings of Activities with special access on the removed days."
                          : "Admin reservations stay."
                }`}
                imageSrc="/symbols/warning.png"
                confirmText="Save Room"
                onConfirm={saveRoom}
                onClose={() => setConfirmSave(false)}
                open={confirmSave}
            />
        </div>
    );
};

export default AdminRoom;
