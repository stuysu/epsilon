import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { supabase } from "../../../../lib/supabaseClient";
import { invalidate } from "../../../../lib/useCachedQuery";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import MarkupDisplayer from "../../../../components/markup/MarkupDisplayer";
import MarkupEditor from "../../../../components/markup/MarkupEditor";
import isBlankMarkdown from "../../../../components/markup/isBlankMarkdown";
import { DateField } from "../../../../components/ui/input/DateTimeField";
import SwitchField from "../../../../components/ui/input/SwitchField";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import { toNewYork, wallClockToISO } from "../../../../utils/NewYorkTime";
import { PUBLIC_URL, SUPPORT_EMAIL } from "../../../../config/constants";

type AdminAnnouncement = Announcement & {
    ends_at: string | null;
    pinned: boolean;
};

const byPinnedThenNewest = (a: AdminAnnouncement, b: AdminAnnouncement) =>
    Number(b.pinned) - Number(a.pinned) ||
    b.created_at.localeCompare(a.created_at);

const isExpired = (a: AdminAnnouncement) =>
    !!a.ends_at && new Date(a.ends_at) <= new Date();

const Announcements = () => {
    const [content, setContent] = useState("");
    const [editorKey, setEditorKey] = useState(0);
    const [endsOn, setEndsOn] = useState<Dayjs | null>(null);
    const [pinned, setPinned] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
    const [visibleAnnouncements, setVisibleAnnouncements] = useState(3);
    const [deleting, setDeleting] = useState<AdminAnnouncement | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .order("pinned", { ascending: false })
                .order("created_at", { ascending: false });

            if (error || !data) {
                enqueueSnackbar(
                    `Failed to load announcements. Contact ${SUPPORT_EMAIL} for support.`,
                    { variant: "error" },
                );
                return;
            }

            setAnnouncements(data as AdminAnnouncement[]);
        };

        fetchAnnouncements();
    }, [enqueueSnackbar]);

    // from the latest list; rows keep their place on pin/unpin until the next load
    const changed = (
        update: (current: AdminAnnouncement[]) => AdminAnnouncement[],
        resort = false,
    ) => {
        setAnnouncements((current) =>
            resort
                ? [...update(current)].sort(byPinnedThenNewest)
                : update(current),
        );
        invalidate(["home", "announcements"]);
    };

    const createAnnouncement = async () => {
        if (isBlankMarkdown(content)) {
            enqueueSnackbar("Announcement cannot be empty.", {
                variant: "error",
            });
            return;
        }

        // shown through the end of the chosen day, New York time
        const ends_at = endsOn ? wallClockToISO(endsOn.endOf("day")) : null;
        if (ends_at && new Date(ends_at) <= new Date()) {
            enqueueSnackbar("Pick an end date that hasn't passed.", {
                variant: "error",
            });
            return;
        }

        const { data, error } = await supabase
            .from("announcements")
            .insert({ content, ends_at, pinned })
            .select("*")
            .limit(1)
            .single();

        if (error || !data) {
            enqueueSnackbar(
                `Failed to create announcement. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }

        setContent("");
        setEditorKey((k) => k + 1);
        setEndsOn(null);
        setPinned(false);
        changed((current) => [data as AdminAnnouncement, ...current], true);
        enqueueSnackbar("Announcement posted.", { variant: "success" });
    };

    const togglePin = async (announcement: AdminAnnouncement) => {
        const { error } = await supabase
            .from("announcements")
            .update({ pinned: !announcement.pinned })
            .eq("id", announcement.id);

        if (error) {
            enqueueSnackbar(
                `Failed to update announcement. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }

        changed((current) =>
            current.map((a) =>
                a.id === announcement.id
                    ? { ...a, pinned: !announcement.pinned }
                    : a,
            ),
        );
    };

    const deleteAnnouncement = async (id: number) => {
        const { error } = await supabase
            .from("announcements")
            .delete()
            .eq("id", id);

        if (error) {
            enqueueSnackbar(
                `Failed to delete announcement. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }

        changed((current) => current.filter((a) => a.id !== id));
        enqueueSnackbar("Announcement deleted.", { variant: "success" });
    };

    return (
        <div className={"w-full p-4 sm:p-12"}>
            <h1>StuyActivities Announcements</h1>
            <p className={"mb-10"}>
                Create an announcement to be broadcasted to everyone.
            </p>
            <div className={"w-full flex sm:flex-row flex-col gap-5"}>
                <div className={"w-full sm:w-2/3"}>
                    <MarkupEditor
                        key={editorKey}
                        onChange={setContent}
                        onSubmit={createAnnouncement}
                        label="Content"
                        placeholder="Write an announcement"
                        submitVerb="post"
                    />
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <DateField
                            label="End date (optional)"
                            value={endsOn}
                            onChange={setEndsOn}
                            sx={{ width: "100%", maxWidth: "240px" }}
                        />
                        <SwitchField
                            label="Pin to top"
                            checked={pinned}
                            onChange={setPinned}
                        />
                    </div>
                    <AsyncButton
                        sx={{ width: "100%", marginTop: "16px" }}
                        onClick={createAnnouncement}
                    >
                        Post Announcement
                    </AsyncButton>
                </div>
                <div className={"w-full flex flex-col gap-2"}>
                    {announcements.length === 0 && (
                        <p className="p-4 text-center">No announcements yet.</p>
                    )}
                    {announcements
                        .slice(0, visibleAnnouncements)
                        .map((announcement) => {
                            const expired = isExpired(announcement);
                            return (
                                <div
                                    key={announcement.id}
                                    className="w-full flex flex-wrap justify-center"
                                >
                                    <article className="w-full max-w-[600px] rounded-sm bg-layer-2 p-2.5 shadow-control">
                                        {/* always there, so pinning doesn't change the row's height */}
                                        <p className="mb-1 flex min-h-[1lh] flex-wrap gap-x-4 text-sm text-typography-2">
                                            {announcement.pinned && (
                                                <span>
                                                    <i
                                                        aria-hidden="true"
                                                        className="bx bxs-pin mr-1"
                                                    />
                                                    Pinned
                                                </span>
                                            )}
                                            {expired && (
                                                <span className="rounded-sm bg-layer-3 px-1.5 text-typography-1">
                                                    Expired
                                                </span>
                                            )}
                                            {announcement.ends_at && (
                                                <span>
                                                    {expired
                                                        ? "Ended"
                                                        : "Shows until"}{" "}
                                                    {toNewYork(
                                                        announcement.ends_at,
                                                    ).format("MMM D, YYYY")}
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <MarkupDisplayer
                                                className="min-w-0 flex-1 basis-60"
                                                text={announcement.content}
                                            />
                                            <div className="flex gap-2">
                                                <AsyncButton
                                                    onClick={() =>
                                                        togglePin(announcement)
                                                    }
                                                >
                                                    {announcement.pinned
                                                        ? "Unpin"
                                                        : "Pin"}
                                                </AsyncButton>
                                                <AsyncButton
                                                    onClick={() =>
                                                        setDeleting(
                                                            announcement,
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </AsyncButton>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    {visibleAnnouncements < announcements.length && (
                        <div className="w-full flex justify-center mt-2.5">
                            <AsyncButton
                                onClick={() =>
                                    setVisibleAnnouncements((prev) => prev + 3)
                                }
                            >
                                Show More
                            </AsyncButton>
                        </div>
                    )}
                </div>
            </div>
            <UserDialog
                title="Delete Announcement?"
                description={
                    deleting?.ends_at && isExpired(deleting)
                        ? "This announcement has already ended. Deleting it removes it for good."
                        : "Everyone will stop seeing this announcement, and it can't be brought back."
                }
                imageSrc={`${PUBLIC_URL}/symbols/warning.png`}
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={() => {
                    if (deleting) return deleteAnnouncement(deleting.id);
                }}
                confirmText="Delete Announcement"
            >
                {deleting && (
                    <div className="max-h-40 overflow-y-auto rounded-sm bg-layer-2 p-3">
                        <MarkupDisplayer text={deleting.content} />
                    </div>
                )}
            </UserDialog>
        </div>
    );
};

export default Announcements;
