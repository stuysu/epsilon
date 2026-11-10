import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import BackLink from "../../../../../components/ui/links/BackLink";
import { useSnackbar } from "notistack";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useLiveRefresh from "../../../../../utils/useLiveRefresh";
import { motion, useReducedMotion } from "framer-motion";
import { useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { supabase } from "../../../../../lib/supabaseClient";
import { PUBLIC_URL } from "../../../../../config/constants";
import OrgContext from "../../../../../contexts/OrgContext";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import ItemList from "../../../../../components/ui/lists/ItemList";
import FilterSelect from "../../../../../components/ui/input/FilterSelect";
import MemberToolbar from "../components/MemberToolbar";
import { MemberSort, sortMembersBy } from "../../../../../utils/DataFormatters";
import useMembershipJoinDates from "../../../../../utils/useMembershipJoinDates";
import Avatar from "../../../../../components/ui/Avatar";
import {
    moveWithArrows,
    Ring,
    SegmentedControl,
} from "../../components/AttendanceBits";
import { AttendancePerformance } from "../../components/MeetingSideCards";
import ClubQRCode from "../../components/ClubQRCode";
import { AttendanceMark } from "../../components/useOrgAttendance";
import MeetingChips from "../../components/MeetingChips";

type MeetingData = {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    organization_id: number;
    rooms?: { name: string } | null;
    attendance: AttendanceMark[];
};

type Mark = "present" | "late" | "absent";
type MarkFilter = "all" | Mark | "early";

const markFilterOptions: { value: MarkFilter; label: string }[] = [
    { value: "all", label: "Everyone" },
    { value: "present", label: "Present" },
    { value: "late", label: "Late" },
    { value: "absent", label: "Absent" },
    { value: "early", label: "Left Early" },
];

const segment = (selected: boolean) =>
    `touch-target h-9 flex-1 rounded-full px-3 text-sm sm:px-4 font-semibold outline-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-typography-1 disabled:opacity-50 sm:flex-none ${
        selected
            ? "bg-accent text-white shadow-control"
            : "text-typography-2 enabled:sm:hover:text-typography-1"
    }`;

const MeetingAttendance = () => {
    const org = useContext(OrgContext);
    const { meetingId: meetingIdParam, orgUrl } = useParams();
    const meetingId = parseInt(meetingIdParam || "-1", 10);
    const { enqueueSnackbar } = useSnackbar();

    const [meeting, setMeeting] = useState<MeetingData>();
    const [lateAfter, setLateAfter] = useState(15);
    const [editingLate, setEditingLate] = useState(false);
    const [lateDraft, setLateDraft] = useState("15");
    const [view, setView] = useState<"overview" | "manual">("overview");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<MemberSort>("default");
    const [markFilter, setMarkFilter] = useState<MarkFilter>("all");
    const [busy, setBusy] = useState<number>();
    const [missing, setMissing] = useState(false);
    const [qrFull, setQrFull] = useState(false);
    const qrOpener = useRef<HTMLElement | null>(null);

    // the code proves a member was at the meeting; only leaders can read it
    const [code, setCode] = useState<string>();
    useEffect(() => {
        if (!/^\d+$/.test(meetingIdParam ?? "")) return;
        let live = true;
        supabase
            .rpc("meeting_checkin_code", { p_meeting_id: meetingId })
            .then(({ data }) => {
                if (live && typeof data === "string") setCode(data);
            });
        return () => {
            live = false;
        };
    }, [meetingId, meetingIdParam]);
    const link = code
        ? `${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}?code=${code}`
        : "";

    const reduceMotion = useReducedMotion();
    const request = useRef(0);
    const validId = /^\d+$/.test(meetingIdParam ?? "");
    const load = useCallback(async () => {
        if (!validId) {
            setMissing(true);
            return;
        }
        if (!org.id || org.id === -1) return;
        const id = ++request.current;
        const { data, error } = await supabase
            .from("meetings")
            .select(
                "id, title, start_time, end_time, organization_id, rooms (name), attendance (user_id, late, left_early)",
            )
            .eq("id", meetingId)
            .eq("organization_id", org.id)
            .returns<MeetingData>()
            .maybeSingle();
        if (error || id !== request.current) return;
        setMissing(!data);
        if (data) setMeeting(data);
    }, [meetingId, org.id, validId]);

    useLiveRefresh(load, 3000);

    useEffect(() => {
        if (!org.id || org.id === -1) return;
        supabase
            .from("organizations")
            .select("late_after_minutes")
            .eq("id", org.id)
            .maybeSingle()
            .then(({ data }) => {
                if (typeof data?.late_after_minutes === "number") {
                    setLateAfter(data.late_after_minutes);
                    setLateDraft(String(data.late_after_minutes));
                }
            });
    }, [org.id]);

    const members = (org.memberships || [])
        .filter((m) => m.active && m.role !== "ADVISOR" && m.users?.id != null)
        .map((m) => ({
            id: m.users!.id as number,
            membershipId: m.id as number,
            first_name: m.users?.first_name,
            last_name: m.users?.last_name,
            name: `${m.users?.first_name || ""} ${m.users?.last_name || ""}`.trim(),
            email: m.users?.email || "",
            picture: m.users?.picture,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const marks = new Map(
        (meeting?.attendance || []).map((a) => [a.user_id, a]),
    );
    const memberMarks = members
        .map((m) => marks.get(m.id))
        .filter((a) => a !== undefined);
    const present = memberMarks.length;
    const onTime = memberMarks.filter((a) => !a.late).length;

    const setMark = async (userId: number, name: string, mark: Mark) => {
        if (!meeting) return;
        setBusy(userId);
        let { error } =
            mark === "absent"
                ? await supabase
                      .from("attendance")
                      .delete()
                      .eq("meeting_id", meeting.id)
                      .eq("user_id", userId)
                : marks.has(userId)
                  ? await supabase
                        .from("attendance")
                        .update({ late: mark === "late" })
                        .eq("meeting_id", meeting.id)
                        .eq("user_id", userId)
                  : await supabase.from("attendance").insert({
                        user_id: userId,
                        meeting_id: meeting.id,
                        organization_id: meeting.organization_id,
                        late: mark === "late",
                    });
        // they checked themselves in since the last refresh
        if (error?.code === "23505")
            ({ error } = await supabase
                .from("attendance")
                .update({ late: mark === "late" })
                .eq("meeting_id", meeting.id)
                .eq("user_id", userId));
        if (error) {
            setBusy(undefined);
            enqueueSnackbar(`Couldn't update ${name}'s attendance.`, {
                variant: "error",
            });
            return;
        }
        await load();
        setBusy(undefined);
    };

    const toggleEarly = async (userId: number, name: string) => {
        const current = marks.get(userId);
        if (!meeting || !current) return;
        setBusy(userId);
        const { error } = await supabase
            .from("attendance")
            .update({ left_early: !current.left_early })
            .eq("meeting_id", meeting.id)
            .eq("user_id", userId);
        setBusy(undefined);
        if (error) {
            enqueueSnackbar(`Couldn't update ${name}'s attendance.`, {
                variant: "error",
            });
            return;
        }
        await load();
    };

    const saveLateAfter = async () => {
        const minutes = Number(lateDraft);
        if (
            lateDraft.trim() === "" ||
            !Number.isInteger(minutes) ||
            minutes < 0 ||
            minutes > 240
        ) {
            enqueueSnackbar("Enter a whole number of minutes from 0 to 240.", {
                variant: "error",
            });
            return;
        }
        const { error } = await supabase.rpc("set_organization_late_after", {
            org_id: org.id,
            minutes,
        });
        if (error) {
            enqueueSnackbar("Couldn't save the late cutoff.", {
                variant: "error",
            });
            return;
        }
        setLateAfter(minutes);
        setEditingLate(false);
    };

    const [copied, setCopied] = useState(false);
    const copiedTimer = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => () => clearTimeout(copiedTimer.current), []);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            clearTimeout(copiedTimer.current);
            copiedTimer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            enqueueSnackbar("Couldn't copy. The link is " + link, {
                variant: "info",
            });
        }
    };

    const joinDates = useMembershipJoinDates(
        org.id,
        org.memberships?.length ?? 0,
    );
    const markOf = (userId: number): Mark => {
        const mark = marks.get(userId);
        return !mark ? "absent" : mark.late ? "late" : "present";
    };
    const markRank: Record<Mark, number> = { present: 0, late: 1, absent: 2 };
    const byMarkThenName = (
        a: (typeof members)[number],
        b: (typeof members)[number],
    ) =>
        markRank[markOf(a.id)] - markRank[markOf(b.id)] ||
        (a.first_name ?? "").localeCompare(b.first_name ?? "", undefined, {
            sensitivity: "base",
        }) ||
        (a.last_name ?? "").localeCompare(b.last_name ?? "", undefined, {
            sensitivity: "base",
        });
    const filtered = members.filter(
        (m) =>
            (markFilter === "all" ||
                (markFilter === "early"
                    ? !!marks.get(m.id)?.left_early
                    : markOf(m.id) === markFilter)) &&
            `${m.name} ${m.email}`
                .toLowerCase()
                .includes(query.trim().toLowerCase()),
    );
    const shown =
        sort === "default"
            ? [...filtered].sort(byMarkThenName)
            : sortMembersBy(filtered, sort, (m) => ({
                  first_name: m.first_name,
                  last_name: m.last_name,
                  joined_at: joinDates.get(m.membershipId),
              }));

    if (missing)
        return (
            <ContentUnavailable
                icon="bx-calendar-x"
                iconColor="text-yellow"
                title="Meeting Not Found"
                description="This meeting doesn't exist or belongs to another Activity."
                action={
                    <BackLink
                        to={`/${orgUrl}/admin/attendance`}
                        className={
                            "inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-typography-1 underline-offset-2 sm:hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                        }
                    >
                        <i
                            aria-hidden="true"
                            className={"bx bx-chevron-left"}
                        />
                        Back to Attendance
                    </BackLink>
                }
            />
        );

    return (
        <div>
            <header className={"mb-6 mt-2"}>
                <h1 className={"mb-2 break-words"}>
                    <BackLink
                        to={`/${orgUrl}/admin/attendance`}
                        className={
                            "rounded-md text-typography-3 no-underline transition-colors sm:hover:text-typography-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                        }
                    >
                        Attendance
                    </BackLink>
                    <span aria-hidden="true" className={"text-typography-3"}>
                        /
                    </span>
                    {meeting?.title}
                </h1>
                {meeting && (
                    <div className={"mb-3"}>
                        <MeetingChips
                            align="start"
                            start_time={meeting.start_time}
                            end_time={meeting.end_time}
                            room_name={meeting.rooms?.name}
                        />
                    </div>
                )}
                <p>
                    Attendance records must be kept up to date. Strikes will be
                    issued if attendance is not marked or falsely marked.
                </p>
            </header>

            <SegmentedControl
                label={"Meeting attendance view"}
                value={view}
                onChange={setView}
                options={[
                    { value: "overview", label: "Overview" },
                    { value: "manual", label: "Manual Attendance" },
                ]}
            />

            {view === "overview" ? (
                <div
                    className={
                        "grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2"
                    }
                >
                    <section
                        aria-label="Attendance summary"
                        className={
                            "flex flex-col items-center justify-between gap-5 rounded-xl border border-divider bg-layer-1 p-5 shadow-prominent"
                        }
                    >
                        <div
                            className={
                                "flex max-w-full flex-1 items-center gap-4"
                            }
                        >
                            <Ring
                                size={128}
                                width={5}
                                value={
                                    members.length
                                        ? present / members.length
                                        : 0
                                }
                                stroke={"stroke-blue"}
                            >
                                <p
                                    className={
                                        "important text-2xl tabular-nums"
                                    }
                                >
                                    {present}/{members.length}
                                </p>
                                <p className={"text-sm"}>Present</p>
                            </Ring>
                            <Ring
                                size={128}
                                width={5}
                                value={present ? onTime / present : 0}
                                stroke={"stroke-green"}
                            >
                                <p
                                    className={
                                        "important text-2xl tabular-nums"
                                    }
                                >
                                    {present
                                        ? Math.round((onTime / present) * 100)
                                        : 0}
                                    %
                                </p>
                                <p className={"text-sm"}>On Time</p>
                            </Ring>
                        </div>
                        {editingLate ? (
                            <form
                                className={
                                    "flex h-11 flex-wrap items-center justify-center gap-2"
                                }
                                noValidate
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    void saveLateAfter();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key !== "Escape") return;
                                    e.preventDefault();
                                    setLateDraft(String(lateAfter));
                                    setEditingLate(false);
                                }}
                            >
                                <label
                                    htmlFor="late-after"
                                    className={"text-sm"}
                                >
                                    Late after
                                </label>
                                <input
                                    id="late-after"
                                    type="number"
                                    min={0}
                                    max={240}
                                    autoFocus
                                    value={lateDraft}
                                    onChange={(e) =>
                                        setLateDraft(e.target.value)
                                    }
                                    className={
                                        "h-9 w-16 rounded-lg bg-layer-2 px-2 text-center tabular-nums text-typography-1 shadow-control outline-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                                    }
                                />
                                <span className={"text-sm"}>min</span>
                                <button
                                    type="submit"
                                    aria-label="Save"
                                    className={
                                        "flex size-9 items-center justify-center rounded-full text-xl shadow-control transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1 bg-accent text-white sm:hover:brightness-110"
                                    }
                                >
                                    <i
                                        aria-hidden="true"
                                        className={"bx bx-check"}
                                    />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Cancel"
                                    onClick={() => {
                                        setLateDraft(String(lateAfter));
                                        setEditingLate(false);
                                    }}
                                    className={
                                        "flex size-9 items-center justify-center rounded-full text-xl shadow-control transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1 bg-layer-2 text-typography-2 sm:hover:bg-layer-3 sm:hover:text-typography-1"
                                    }
                                >
                                    <i
                                        aria-hidden="true"
                                        className={"bx bx-x"}
                                    />
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setEditingLate(true)}
                                aria-label={`Late after ${lateAfter} minutes. Edit`}
                                title="Self check-ins after this are marked late"
                                className={
                                    "touch-target inline-flex h-9 items-center gap-2 rounded-full bg-layer-2 px-4 text-sm font-semibold text-typography-1 shadow-control transition-colors sm:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                                }
                            >
                                <i
                                    aria-hidden="true"
                                    className={
                                        "bx bx-time-five text-base text-yellow"
                                    }
                                />
                                Late after {lateAfter} min
                                <i
                                    aria-hidden="true"
                                    className={
                                        "bx bx-pencil text-base text-typography-2"
                                    }
                                />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={copyLink}
                            disabled={!link}
                            aria-live="polite"
                            className={
                                "flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-layer-2 px-4 text-sm font-semibold text-typography-1 shadow-control transition-colors disabled:opacity-50 sm:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                            }
                        >
                            <i
                                aria-hidden="true"
                                className={`bx ${copied ? "bx-check text-green" : "bx-link text-yellow"} text-lg`}
                            />
                            {copied ? "Copied" : "Copy Attendance Link"}
                        </button>
                    </section>
                    <section
                        className={
                            "flex flex-col items-center gap-3 rounded-xl border border-divider bg-layer-1 p-5 text-center shadow-prominent"
                        }
                    >
                        <h2 className={"flex items-center gap-2 text-base"}>
                            <i
                                aria-hidden="true"
                                className={"bx bx-qr text-xl text-blue"}
                            />
                            QR Code
                        </h2>
                        <p className={"text-sm"}>
                            Members scan this at the meeting to check themselves
                            in.
                        </p>
                        <div
                            className={
                                "flex min-h-48 flex-1 items-center justify-center"
                            }
                        >
                            {!link ? (
                                <div
                                    className={
                                        "size-[184px] animate-pulse rounded-lg bg-layer-2"
                                    }
                                />
                            ) : (
                                <button
                                    type="button"
                                    aria-label="Show QR code full screen"
                                    onClick={() => setQrFull(true)}
                                    className={
                                        "cursor-zoom-in overflow-hidden rounded-lg bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                                    }
                                >
                                    <ClubQRCode
                                        value={link}
                                        picture={org.picture ?? undefined}
                                        name={org.name}
                                        className={"block size-[184px]"}
                                    />
                                </button>
                            )}
                        </div>
                        <AsyncButton
                            onClick={() => setQrFull(true)}
                            disabled={!link}
                        >
                            <i
                                aria-hidden="true"
                                className={"bx bx-fullscreen mr-2"}
                            />
                            Full Screen
                        </AsyncButton>
                    </section>
                </div>
            ) : (
                <>
                    <MemberToolbar
                        placeholder={"Search members"}
                        query={query}
                        onQueryChange={setQuery}
                        sort={sort}
                        onSortChange={setSort}
                        filter={
                            <FilterSelect
                                label="Filter by attendance"
                                value={markFilter}
                                onChange={setMarkFilter}
                                options={markFilterOptions}
                            />
                        }
                    />
                    <ItemList height={"auto"}>
                        {shown.length === 0 && (
                            <p className={"bg-layer-2 px-4 py-3"}>
                                No members match your search.
                            </p>
                        )}
                        {shown.map((m) => {
                            const mark = marks.get(m.id);
                            const state = markOf(m.id);
                            const disabled = busy === m.id;
                            return (
                                <motion.div
                                    key={m.id}
                                    layout={reduceMotion ? false : "position"}
                                    transition={{
                                        duration: 0.25,
                                        ease: [0.2, 0, 0, 1],
                                    }}
                                    className={"bg-layer-2 px-4 py-3"}
                                >
                                    <div
                                        className={
                                            "flex flex-wrap items-center gap-x-3 gap-y-2"
                                        }
                                    >
                                        <div
                                            className={
                                                "flex min-w-48 flex-1 items-center gap-3"
                                            }
                                        >
                                            <Avatar
                                                src={m.picture}
                                                alt=""
                                                className={"size-9 rounded-md"}
                                            >
                                                {m.name.charAt(0)}
                                            </Avatar>
                                            <div className={"min-w-0"}>
                                                <h4 className={"break-words"}>
                                                    {m.name}
                                                </h4>
                                                <p
                                                    className={
                                                        "truncate text-sm text-typography-2"
                                                    }
                                                >
                                                    {m.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                "flex flex-wrap items-center gap-2 max-sm:w-full"
                                            }
                                        >
                                            <div
                                                role="radiogroup"
                                                onKeyDown={(event) =>
                                                    moveWithArrows(event)
                                                }
                                                aria-label={`Attendance for ${m.name}`}
                                                className={
                                                    "flex rounded-full bg-layer-3 p-1 max-sm:flex-1"
                                                }
                                            >
                                                {(
                                                    [
                                                        ["present", "Present"],
                                                        ["late", "Late"],
                                                        ["absent", "Absent"],
                                                    ] as const
                                                ).map(([value, label]) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={
                                                            state === value
                                                        }
                                                        tabIndex={
                                                            state === value
                                                                ? 0
                                                                : -1
                                                        }
                                                        disabled={disabled}
                                                        onClick={() =>
                                                            state !== value &&
                                                            setMark(
                                                                m.id,
                                                                m.name,
                                                                value,
                                                            )
                                                        }
                                                        className={segment(
                                                            state === value,
                                                        )}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                aria-pressed={
                                                    !!mark?.left_early
                                                }
                                                disabled={disabled || !mark}
                                                title={
                                                    mark
                                                        ? undefined
                                                        : "Mark them present or late first"
                                                }
                                                onClick={() =>
                                                    toggleEarly(m.id, m.name)
                                                }
                                                className={`flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm sm:px-4 font-semibold outline-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1 disabled:opacity-40 ${
                                                    mark?.left_early
                                                        ? "bg-yellow text-black"
                                                        : "bg-layer-3 text-typography-2 enabled:sm:hover:text-typography-1"
                                                }`}
                                            >
                                                <i
                                                    aria-hidden="true"
                                                    className={
                                                        "bx bx-log-out-circle text-base max-sm:hidden"
                                                    }
                                                />
                                                Left Early
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </ItemList>
                </>
            )}
            <Dialog.Root open={qrFull} onOpenChange={setQrFull}>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className={
                            "fixed inset-0 z-[100] bg-black/85 backdrop-blur-md"
                        }
                    />
                    <Dialog.Content
                        onOpenAutoFocus={() => {
                            qrOpener.current =
                                document.activeElement as HTMLElement | null;
                        }}
                        onCloseAutoFocus={(event) => {
                            event.preventDefault();
                            if (qrOpener.current?.isConnected)
                                qrOpener.current.focus();
                        }}
                        className={
                            "fixed inset-0 z-[101] flex flex-col items-center justify-center gap-5 p-6 text-center outline-0"
                        }
                    >
                        <Dialog.Title className={"text-3xl text-typography-1"}>
                            {meeting?.title}
                        </Dialog.Title>
                        <Dialog.Description className={"text-lg"}>
                            Scan to record your attendance
                        </Dialog.Description>
                        <div
                            className={
                                "overflow-hidden rounded-3xl bg-white shadow-2xl"
                            }
                        >
                            <ClubQRCode
                                value={link}
                                picture={org.picture ?? undefined}
                                name={org.name}
                                className={
                                    "block aspect-square w-[min(65vh,calc(100vw-3rem))]"
                                }
                            />
                        </div>
                        <Dialog.Close
                            aria-label="Close full screen QR code"
                            className={
                                "absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-layer-2 text-typography-1 shadow-control sm:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                            }
                        >
                            <i aria-hidden="true" className={"bx bx-x bx-sm"} />
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            <div className={"mt-8 xl:hidden"}>
                <AttendancePerformance />
            </div>
        </div>
    );
};

export default MeetingAttendance;
