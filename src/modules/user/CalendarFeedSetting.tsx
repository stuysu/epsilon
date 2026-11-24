import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import UserDialog from "../../components/ui/overlays/UserDialog";
import CheckboxInput from "../../components/ui/input/CheckboxInput";
import CalendarSubscribe, {
    calendarFeedUrl,
    useCalendarToken,
} from "../../components/ui/CalendarSubscribe";

type Club = { id: number; name: string };

/* a private calendar link with the meetings of the clubs the user picks */
const CalendarFeedSetting = ({
    userId,
    clubs,
}: {
    userId: number;
    clubs: Club[];
}) => {
    const {
        token,
        error,
        retry,
        makeLink: make,
        hidden,
        saveHidden,
    } = useCalendarToken(userId);
    const [confirmingReset, setConfirmingReset] = useState(false);
    const shown = clubs.filter((c) => !hidden.includes(c.id)).length;

    const makeLink = async (regenerate: boolean) => {
        if ((await make(regenerate)) && regenerate) {
            enqueueSnackbar(
                "New link made. Calendars using the old one stop updating.",
                { variant: "success" },
            );
        }
    };

    const toggle = (id: number, include: boolean) =>
        saveHidden((current) =>
            include
                ? current.filter((h) => h !== id)
                : [...current.filter((h) => h !== id), id],
        );

    return (
        <div className="my-4 flex flex-col gap-3 text-typography-1">
            <div className="flex flex-col gap-1">
                <h2 className="mt-2">Meetings Calendar</h2>
                <p className="text-typography-2">
                    Add your club meetings to Google Calendar, Apple Calendar or
                    Outlook. The link is just for you, so don&apos;t share it.
                </p>
            </div>
            {error ? (
                <div className="flex flex-wrap items-center gap-2.5">
                    <p role="alert" className="text-typography-2">
                        Couldn&apos;t load your calendar link.
                    </p>
                    <AsyncButton onClick={retry}>Try Again</AsyncButton>
                </div>
            ) : token === undefined ? null : token ? (
                <>
                    <CalendarSubscribe url={calendarFeedUrl(`token=${token}`)}>
                        <button
                            type="button"
                            onClick={() => setConfirmingReset(true)}
                            className="cursor-pointer px-2 py-1 text-sm text-typography-2 underline underline-offset-2 sm:hover:text-typography-1"
                        >
                            Reset Link
                        </button>
                    </CalendarSubscribe>
                    {clubs.length > 1 && (
                        <fieldset className="mt-2 max-w-xl rounded-xl bg-layer-1 p-4 shadow-control">
                            <legend className="sr-only">
                                Clubs in this calendar
                            </legend>
                            <div className="mb-3 flex items-baseline justify-between gap-3">
                                <p
                                    aria-hidden="true"
                                    className="[font-variation-settings:'wght'_600]"
                                >
                                    Clubs in this calendar
                                </p>
                                <p className="text-sm text-typography-2">
                                    {shown} of {clubs.length}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                {clubs.map((club) => (
                                    <label
                                        key={club.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 sm:hover:bg-layer-2"
                                    >
                                        <CheckboxInput
                                            small
                                            label={club.name}
                                            checked={!hidden.includes(club.id)}
                                            onChange={(on) =>
                                                toggle(club.id, on)
                                            }
                                        />
                                        <span className="min-w-0 wrap-break-word">
                                            {club.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-typography-2">
                                Clubs you join later are added automatically.
                                Calendar apps can take a few hours to show
                                changes.
                            </p>
                        </fieldset>
                    )}
                </>
            ) : (
                <div>
                    <AsyncButton onClick={() => makeLink(false)} isPrimary>
                        Create Calendar Link
                    </AsyncButton>
                </div>
            )}
            <UserDialog
                title="Reset Your Calendar Link?"
                description="Calendars that use the current link, including ones added from club pages, stop updating. You'll need to subscribe again with the new one."
                open={confirmingReset}
                onClose={() => setConfirmingReset(false)}
                onConfirm={() => makeLink(true)}
                confirmText="Reset Link"
            />
        </div>
    );
};

export default CalendarFeedSetting;
