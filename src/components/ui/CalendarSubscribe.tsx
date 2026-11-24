import { type ReactNode, useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import AsyncButton, {
    BUTTON_CLASS,
    BUTTON_SHADOW,
} from "./buttons/AsyncButton";
import { SUPABASE_URL } from "../../config/constants";
import { supabase } from "../../lib/supabaseClient";

/* the calendar-feed function; query is "token=..." with an optional "&club=..." */
export const calendarFeedUrl = (query: string) =>
    `${SUPABASE_URL.replace(/\/+$/, "")}/functions/v1/calendar-feed?${query}`;

const readToken = (userId: number) =>
    supabase
        .from("calendar_tokens")
        .select("token, hidden_organizations")
        .eq("user_id", userId)
        .maybeSingle();

/* the user's private calendar token: undefined while loading or if it couldn't
   be read (see error), null if they have none yet */
export const useCalendarToken = (userId?: number) => {
    const [token, setToken] = useState<string | null>();
    const [error, setError] = useState(false);
    // clubs left out of the all-clubs link
    const [hidden, setHidden] = useState<number[]>([]);
    const hiddenRef = useRef<number[]>([]);
    // what the server last confirmed, and the saves sent in order
    const savedRef = useRef<number[]>([]);
    const saves = useRef(Promise.resolve());
    const saveCount = useRef(0);
    const [reloads, setReloads] = useState(0);

    const showHidden = (next: number[]) => {
        hiddenRef.current = next;
        setHidden(next);
    };

    useEffect(() => {
        if (!userId || userId < 0) return;
        let live = true;
        readToken(userId).then(({ data, error }) => {
            if (!live) return;
            if (error) {
                setToken(undefined);
                setError(true);
                return;
            }
            setToken(data?.token ?? null);
            savedRef.current = data?.hidden_organizations ?? [];
            hiddenRef.current = savedRef.current;
            setHidden(savedRef.current);
        });
        return () => {
            live = false;
        };
    }, [userId, reloads]);

    const retry = () => {
        setError(false);
        setReloads((n) => n + 1);
    };

    const makeLink = async (regenerate: boolean) => {
        const { data, error } = await supabase.rpc("calendar_token", {
            regenerate,
        });
        if (error || !data) {
            enqueueSnackbar("Couldn't make a calendar link. Try again.", {
                variant: "error",
            });
            return false;
        }
        setToken(data as string);
        if (userId) {
            const { data: row, error: readError } = await readToken(userId);
            // the link was made, so keep showing it with the clubs as they were
            if (readError)
                console.error("Couldn't re-read the calendar token", readError);
            else {
                savedRef.current = row?.hidden_organizations ?? [];
                showHidden(savedRef.current);
            }
        }
        return true;
    };

    const saveHidden = (update: (current: number[]) => number[]) => {
        const next = update(hiddenRef.current);
        showHidden(next);
        const id = ++saveCount.current;
        // one save at a time, so the last list the user picked is the one kept
        saves.current = saves.current.then(async () => {
            const { error } = await supabase.rpc("set_calendar_hidden_clubs", {
                hidden: next,
            });
            if (!error) savedRef.current = next;
            else if (id === saveCount.current) {
                showHidden(savedRef.current);
                enqueueSnackbar(
                    "Couldn't save your calendar clubs. Try again.",
                    { variant: "error" },
                );
            }
        });
    };

    return { token, error, retry, makeLink, hidden, saveHidden };
};

const CalendarSubscribe = ({
    url,
    children,
}: {
    url: string;
    // extra actions after Copy Link
    children?: ReactNode;
}) => {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            enqueueSnackbar(
                'Calendar link copied. Paste it into your calendar app\'s "add calendar from URL".',
                { variant: "success" },
            );
        } catch {
            enqueueSnackbar(`Couldn't copy. The link is ${url}`, {
                variant: "warning",
            });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2.5">
            <a
                href={url.replace(/^https?:/, "webcal:")}
                className={`${BUTTON_CLASS} gap-1.5 bg-layer-2 text-typography-1 no-underline hover:brightness-125 active:scale-[98%]`}
                style={{ boxShadow: BUTTON_SHADOW }}
            >
                <i className="bx bx-calendar-plus" aria-hidden="true" />
                Subscribe to Calendar
            </a>
            <AsyncButton onClick={copy}>Copy Link</AsyncButton>
            {children}
        </div>
    );
};

export default CalendarSubscribe;
