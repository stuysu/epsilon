import { useContext, useState } from "react";
import { FROM_LIST } from "../../../../../components/ui/links/BackLink";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginGate from "../../../../../components/ui/content/LoginGate";
import OrgContext from "../../../../../contexts/OrgContext";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../../components/ui/lists/ItemList";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import Avatar from "../../../../../components/ui/Avatar";
import pressable from "../../../../../utils/pressable";
import {
    AttendanceMeeting,
    countMembers,
    useOrgAttendance,
} from "../../components/useOrgAttendance";
import {
    CountChip,
    ProgressBar,
    SegmentedControl,
    StatusPill,
} from "../../components/AttendanceBits";
import { AttendancePerformance } from "../../components/MeetingSideCards";
import { attendanceRecord } from "../../components/AttendanceRecord";
import MeetingChips from "../../components/MeetingChips";
import MemberToolbar from "../components/MemberToolbar";
import FilterSelect from "../../../../../components/ui/input/FilterSelect";
import {
    MemberSort,
    memberSortOptions,
    sortMembersBy,
} from "../../../../../utils/DataFormatters";

type AttendanceSort = MemberSort | "rate-high" | "rate-low";
const attendanceSortOptions: { value: AttendanceSort; label: string }[] = [
    ...memberSortOptions,
    { value: "rate-high", label: "Best attendance" },
    { value: "rate-low", label: "Worst attendance" },
];
import useMembershipJoinDates from "../../../../../utils/useMembershipJoinDates";
import dayjs from "dayjs";
import SearchInput from "../../../../../components/ui/input/SearchInput";
import SortSelect from "../../../../../components/ui/input/SortSelect";
import MeetingDateFilter from "../components/MeetingDateFilter";
import {
    DEFAULT_MEETING_FILTERS,
    MeetingFilters,
    filterMeetings,
    filtersActive,
    meetingSortOptions,
    meetingStatusOptions,
    meetingWhenOptions,
} from "../components/meetingFilters";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const pick = <T extends string>(
    value: string | null,
    options: { value: T }[],
    fallback: T,
): T => options.find((o) => o.value === value)?.value ?? fallback;

type View = "meetings" | "members";
type RoleFilter = "all" | "leaders" | "members";

const roleFilterOptions: { value: RoleFilter; label: string }[] = [
    { value: "all", label: "Everyone" },
    { value: "leaders", label: "Leaders" },
    { value: "members", label: "Members" },
];

const isLeader = (role?: string) => role === "ADMIN" || role === "CREATOR";

// matches attendance_checkin_opens_before() in the database
const CHECKIN_OPENS_MS = 15 * 60 * 1000;

const MeetingCard = ({
    meeting,
    live,
    upcoming = false,
    memberIds,
}: {
    meeting: AttendanceMeeting;
    live: boolean;
    upcoming?: boolean;
    memberIds: Set<number>;
}) => {
    const navigate = useNavigate();
    const memberCount = memberIds.size;
    const present = countMembers(meeting, memberIds);
    const late = countMembers(meeting, memberIds, (a) => a.late);
    const leftEarly = countMembers(meeting, memberIds, (a) => a.left_early);
    const taken = present > 0;

    return (
        <div
            className={
                "relative flex cursor-pointer flex-col gap-2 bg-layer-2 px-4 py-3 transition-colors sm:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1"
            }
            {...pressable(
                () => navigate(`${meeting.id}`, { state: FROM_LIST }),
                { role: "link" },
            )}
            aria-label={`${meeting.title}, ${upcoming ? "upcoming" : live ? "happening now" : "finished"}`}
        >
            {live && (
                <span
                    aria-hidden="true"
                    className={
                        "absolute bottom-3 left-1 top-3 w-[3px] rounded-full bg-yellow"
                    }
                />
            )}
            <div className={"flex items-start justify-between gap-3"}>
                <div className={"min-w-0"}>
                    <h4 className={"mb-2 break-words"}>{meeting.title}</h4>
                    <MeetingChips
                        align="start"
                        start_time={meeting.start_time}
                        end_time={meeting.end_time}
                        room_name={meeting.rooms?.name}
                    />
                </div>
                {upcoming ? (
                    <StatusPill>Upcoming</StatusPill>
                ) : (
                    <StatusPill>
                        {live ? "Happening Now" : "Finished"}
                    </StatusPill>
                )}
            </div>
            {upcoming ? null : taken || live ? (
                <>
                    <ProgressBar
                        value={memberCount ? present / memberCount : 0}
                        color={live ? "bg-blue" : "bg-typography-3"}
                        label={"Members present"}
                    />
                    <p className={"text-sm text-typography-2"}>
                        {present} of {memberCount} Members Present
                    </p>
                    {(late > 0 || leftEarly > 0) && (
                        <div className={"flex flex-wrap gap-1.5"}>
                            {late > 0 && (
                                <CountChip
                                    icon="bx-time-five"
                                    label={`${late} ${late === 1 ? "Tardy" : "Tardies"}`}
                                />
                            )}
                            {leftEarly > 0 && (
                                <CountChip
                                    icon="bx-log-out-circle"
                                    label={`${leftEarly} Early ${leftEarly === 1 ? "Dismissal" : "Dismissals"}`}
                                />
                            )}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <ProgressBar value={0} label={"Members present"} />
                    <p className={"text-sm text-red"}>Attendance Not Taken</p>
                </>
            )}
        </div>
    );
};

const MiniStat = ({
    value,
    label,
    ratio,
}: {
    value: string;
    label: string;
    ratio: number;
}) => (
    <div className={"flex w-28 flex-col gap-1.5"}>
        <p className={"whitespace-nowrap leading-none"}>
            <span className={"font-semibold tabular-nums text-typography-1"}>
                {value}
            </span>{" "}
            <span className={"text-sm text-typography-2"}>{label}</span>
        </p>
        <ProgressBar value={ratio} label={label} scored />
    </div>
);

const AttendanceOverview = () => {
    const org = useContext(OrgContext);
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const view: View =
        params.get("view") === "members" ? "members" : "meetings";
    const setView = (next: View) =>
        setParams(next === "members" ? { view: next } : {}, { replace: true });
    // kept in the address, so Back from a meeting returns to the same list
    const meetingFilters: MeetingFilters = {
        query: params.get("q") ?? "",
        when: pick(params.get("when"), meetingWhenOptions, "any"),
        from: DAY.test(params.get("from") ?? "") ? params.get("from")! : "",
        to: DAY.test(params.get("to") ?? "") ? params.get("to")! : "",
        status: pick(params.get("status"), meetingStatusOptions, "all"),
        sort: pick(
            params.get("sort"),
            meetingSortOptions,
            DEFAULT_MEETING_FILTERS.sort,
        ),
    };
    const setMeetingFilters = (patch: Partial<MeetingFilters>) => {
        const next = { ...meetingFilters, ...patch };
        const kept: Record<string, string> = {};
        if (next.query) kept.q = next.query;
        if (next.when !== "any") kept.when = next.when;
        if (next.when === "custom" && next.from) kept.from = next.from;
        if (next.when === "custom" && next.to) kept.to = next.to;
        if (next.status !== "all") kept.status = next.status;
        if (next.sort !== DEFAULT_MEETING_FILTERS.sort) kept.sort = next.sort;
        setParams(kept, { replace: true });
    };
    const clearMeetingFilters = () =>
        setParams(
            meetingFilters.sort === DEFAULT_MEETING_FILTERS.sort
                ? {}
                : { sort: meetingFilters.sort },
            { replace: true },
        );
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<AttendanceSort>("default");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const { meetings, error } = useOrgAttendance(org.id, true);
    const now = Date.now();

    const members = (org.memberships || []).filter(
        (m) => m.active && m.role !== "ADVISOR" && m.users?.id != null,
    );
    const memberIds = new Set(members.map((m) => m.users!.id as number));
    const joinDates = useMembershipJoinDates(
        org.id,
        org.memberships?.length ?? 0,
    );
    const searchText = query.trim().toLowerCase();
    const statsFor = (m: (typeof members)[number]) => {
        const counted = attendanceRecord(
            meetings || [],
            m.users!.id as number,
            joinDates.get(m.id as number),
        ).filter((r) => r.arrival !== "pending");
        const present = counted.filter((r) => r.arrival !== "absent").length;
        const onTime = counted.filter((r) => r.arrival === "onTime").length;
        return { counted: counted.length, present, onTime };
    };
    const rate = (s: ReturnType<typeof statsFor>) =>
        s.counted ? s.present / s.counted : -1;
    const filtered = members
        .filter(
            (m) =>
                (roleFilter === "all" ||
                    isLeader(m.role) === (roleFilter === "leaders")) &&
                `${m.users?.first_name ?? ""} ${m.users?.last_name ?? ""} ${m.users?.email ?? ""}`
                    .toLowerCase()
                    .includes(searchText),
        )
        .map((m) => ({ m, stats: statsFor(m) }));
    const shownMembers =
        sort === "rate-high" || sort === "rate-low"
            ? [...filtered].sort(
                  (a, b) =>
                      (sort === "rate-high" ? 1 : -1) *
                          (rate(b.stats) - rate(a.stats)) ||
                      b.stats.counted - a.stats.counted,
              )
            : sortMembersBy(filtered, sort, ({ m }) => ({
                  first_name: m.users?.first_name,
                  last_name: m.users?.last_name,
                  joined_at: joinDates.get(m.id as number),
              }));
    const isLive = (m: AttendanceMeeting) =>
        new Date(m.start_time).getTime() <= now &&
        new Date(m.end_time).getTime() >= now;
    // check-in opens before the start, so a meeting about to start counts
    const current =
        (meetings || []).find(isLive) ??
        (meetings || [])
            .filter((m) => {
                const start = new Date(m.start_time).getTime();
                return start > now && start - CHECKIN_OPENS_MS <= now;
            })
            .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
    const shownMeetings = filterMeetings(meetings || [], meetingFilters, (m) =>
        countMembers(m, memberIds),
    );
    const filtering = filtersActive(meetingFilters);
    const day = (d: string) => dayjs(d).format("MMM D, YYYY");
    const { when, from, to } = meetingFilters;
    const dateLabel =
        when === "custom"
            ? from && to
                ? `${day(from)} – ${day(to)}`
                : from
                  ? `From ${day(from)}`
                  : to
                    ? `Through ${day(to)}`
                    : ""
            : when === "any"
              ? ""
              : meetingWhenOptions.find((o) => o.value === when)!.label;

    return (
        <LoginGate>
            <header className={"mb-6 mt-2"}>
                <section
                    className={
                        "mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
                    }
                >
                    <h1>Attendance</h1>
                    <AsyncButton
                        isPrimary
                        disabled={!current}
                        onClick={() =>
                            current &&
                            navigate(`${current.id}`, { state: FROM_LIST })
                        }
                    >
                        {!current
                            ? "No Active Meetings"
                            : isLive(current)
                              ? "Take Attendance for Current Meeting"
                              : "Take Attendance for Next Meeting"}
                    </AsyncButton>
                </section>
                <p>
                    Take attendance here. Attendance records must be kept up to
                    date. Strikes will be issued if attendance is not marked or
                    falsely marked.
                </p>
            </header>

            <SegmentedControl
                label={"Attendance view"}
                value={view}
                onChange={setView}
                options={[
                    { value: "meetings", label: "Take Attendance" },
                    { value: "members", label: "View Members" },
                ]}
            />

            {error ? (
                <ContentUnavailable
                    icon="bx-error"
                    iconColor="text-red"
                    title="Attendance Unavailable"
                    description="Couldn't load attendance. Refresh the page or contact it@stuysu.org."
                />
            ) : !meetings ? (
                <></>
            ) : view === "meetings" ? (
                meetings.length === 0 ? (
                    <ContentUnavailable
                        icon="bx-calendar-x"
                        iconColor="text-yellow"
                        title="No Meetings Yet"
                        description="This Activity has no meetings yet. Schedule one in the Scheduler, then take its attendance here."
                    />
                ) : (
                    <>
                        <div className={"mb-5 flex flex-col gap-3"}>
                            <SearchInput
                                containerClassName={"mb-0"}
                                placeholder="Search meetings"
                                aria-label="Search meetings by title, room or date"
                                value={meetingFilters.query}
                                onChange={(q) =>
                                    setMeetingFilters({ query: q })
                                }
                                inputClassName={"!pr-36"}
                                trailing={
                                    <div className={"flex items-center gap-1"}>
                                        <MeetingDateFilter
                                            when={meetingFilters.when}
                                            from={meetingFilters.from}
                                            to={meetingFilters.to}
                                            onChange={setMeetingFilters}
                                        />
                                        <FilterSelect
                                            label="Filter meetings"
                                            value={meetingFilters.status}
                                            onChange={(status) =>
                                                setMeetingFilters({
                                                    status,
                                                })
                                            }
                                            options={meetingStatusOptions}
                                        />
                                        <SortSelect
                                            compact
                                            value={meetingFilters.sort}
                                            onChange={(sort) =>
                                                setMeetingFilters({
                                                    sort,
                                                })
                                            }
                                            options={meetingSortOptions}
                                            label="Sort meetings"
                                        />
                                    </div>
                                }
                            />
                            {filtering && (
                                <div
                                    className={
                                        "flex flex-wrap items-center gap-x-3 text-sm text-typography-2"
                                    }
                                >
                                    <p role="status">
                                        {shownMeetings.length} of{" "}
                                        {meetings.length}{" "}
                                        {meetings.length === 1
                                            ? "meeting"
                                            : "meetings"}
                                        {dateLabel && ` · ${dateLabel}`}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={clearMeetingFilters}
                                        className={
                                            "touch-target rounded font-semibold text-typography-1 underline-offset-2 sm:hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                                        }
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                        <ItemList height={"auto"}>
                            {shownMeetings.length === 0 && (
                                <p className={"bg-layer-2 px-4 py-3"}>
                                    No meetings match your search.
                                </p>
                            )}
                            {shownMeetings.map((meeting) => (
                                <MeetingCard
                                    key={meeting.id}
                                    meeting={meeting}
                                    live={isLive(meeting)}
                                    upcoming={
                                        new Date(meeting.start_time).getTime() >
                                        now
                                    }
                                    memberIds={memberIds}
                                />
                            ))}
                        </ItemList>
                    </>
                )
            ) : (
                <>
                    <MemberToolbar
                        query={query}
                        onQueryChange={setQuery}
                        sort={sort}
                        onSortChange={setSort}
                        sortOptions={attendanceSortOptions}
                        filter={
                            <FilterSelect
                                label="Filter members"
                                value={roleFilter}
                                onChange={setRoleFilter}
                                options={roleFilterOptions}
                            />
                        }
                    />
                    <ItemList height={"auto"}>
                        {shownMembers.length === 0 && (
                            <p className={"bg-layer-2 px-4 py-3"}>
                                No members match your search.
                            </p>
                        )}
                        {shownMembers.map(({ m, stats }) => {
                            const id = m.users!.id as number;
                            const { present, onTime } = stats;
                            const name =
                                `${m.users?.first_name ?? ""} ${m.users?.last_name ?? ""}`.trim();
                            return (
                                <div
                                    key={m.id}
                                    className={
                                        "group flex cursor-pointer flex-col bg-layer-2 px-4 py-3 transition-colors sm:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1"
                                    }
                                    aria-label={`${name}, ${present} of ${stats.counted} times present. View attendance record`}
                                    {...pressable(
                                        () =>
                                            navigate(`members/${id}`, {
                                                state: FROM_LIST,
                                            }),
                                        { role: "link" },
                                    )}
                                >
                                    <div
                                        className={
                                            "flex flex-wrap items-center gap-x-6 gap-y-3"
                                        }
                                    >
                                        <div
                                            className={
                                                "flex min-w-0 flex-1 basis-56 items-center gap-3"
                                            }
                                        >
                                            <Avatar
                                                src={m.users?.picture}
                                                alt=""
                                                className={"size-9 rounded-md"}
                                            >
                                                {m.users?.first_name?.charAt(0)}
                                            </Avatar>
                                            <div className={"min-w-0 flex-1"}>
                                                <h4 className={"break-words"}>
                                                    {m.users?.first_name}{" "}
                                                    {m.users?.last_name}
                                                </h4>
                                                <p
                                                    className={
                                                        "truncate text-sm text-typography-2"
                                                    }
                                                >
                                                    {m.users?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={"flex gap-5"}>
                                            <MiniStat
                                                value={`${present}/${stats.counted}`}
                                                label="Present"
                                                ratio={
                                                    stats.counted
                                                        ? present /
                                                          stats.counted
                                                        : 0
                                                }
                                            />
                                            <MiniStat
                                                value={`${onTime}/${present}`}
                                                label="On Time"
                                                ratio={
                                                    present
                                                        ? onTime / present
                                                        : 0
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </ItemList>
                </>
            )}
            <div className={"mt-8 xl:hidden"}>
                <AttendancePerformance />
            </div>
        </LoginGate>
    );
};

export default AttendanceOverview;
