import { useEffect, useRef, useState } from "react";
import TextField from "../input/TextField";
import SelectField from "../input/SelectField";
import AsyncButton from "../buttons/AsyncButton";
import {
    ClubLink,
    LINK_TYPE_ORDER,
    LINK_TYPES,
    LinkType,
    MAX_LINK_NAME,
    MAX_LINK_URL,
    MAX_LINKS,
    linkProblem,
    linkProblems,
    normalizeLinkUrl,
    parseLinks,
    serializeLinks,
} from "../../../utils/SocialLinks";

type Props = {
    field: string;
    label?: string;
    description?: string;
    value?: string;
    onChange?: (value: string) => void;
    changeStatus?: (field: string, ok: boolean) => void;
    hideLabel?: boolean;
    className?: string;
};

type Row = ClubLink & { key: number; touched: boolean };

const typeOptions = LINK_TYPE_ORDER.map((type) => ({
    value: type,
    label: (
        <span className={"inline-flex items-center gap-2"}>
            <i aria-hidden="true" className={`bx ${LINK_TYPES[type].icon}`} />
            {LINK_TYPES[type].label}
        </span>
    ),
}));

const FormSocialLinks = ({
    field,
    label = "Socials",
    description,
    value,
    onChange,
    changeStatus,
    hideLabel,
    className = "w-full",
}: Props) => {
    const nextKey = useRef(0);
    const toRows = (links: ClubLink[]) =>
        links.map((l) => ({ ...l, key: nextKey.current++, touched: true }));
    const [rows, setRows] = useState<Row[]>(() => toRows(parseLinks(value)));
    const lastSent = useRef(value ?? "");

    /* only reload from props when someone else changed the value, ex. Cancel */
    useEffect(() => {
        if ((value ?? "") !== lastSent.current) {
            lastSent.current = value ?? "";
            setRows(toRows(parseLinks(value)));
        }
    }, [value]);

    useEffect(() => {
        changeStatus?.(field, linkProblems(value).length === 0);
    }, [value, field, changeStatus]);

    const update = (next: Row[]) => {
        setRows(next);
        const serialized = serializeLinks(next);
        lastSent.current = serialized;
        onChange?.(serialized);
    };

    const edit = (key: number, change: Partial<Row>) =>
        update(rows.map((r) => (r.key === key ? { ...r, ...change } : r)));

    const buttons = useRef(new Map<string, HTMLButtonElement>());
    const refocus = useRef<{ key: number; dir: "up" | "down" } | null>(null);
    const [announce, setAnnounce] = useState("");

    const move = (i: number, dir: "up" | "down") => {
        const j = dir === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= rows.length) return;
        const next = [...rows];
        [next[i], next[j]] = [next[j], next[i]];
        refocus.current = { key: rows[i].key, dir };
        setAnnounce(`Moved link to position ${j + 1} of ${rows.length}.`);
        update(next);
    };

    /* moving a row re-inserts it, which drops focus; at the top or bottom the pressed button is disabled, so use the other one */
    useEffect(() => {
        const target = refocus.current;
        if (!target) return;
        refocus.current = null;
        const pressed = buttons.current.get(`${target.key}-${target.dir}`);
        const other = buttons.current.get(
            `${target.key}-${target.dir === "up" ? "down" : "up"}`,
        );
        (pressed && !pressed.disabled ? pressed : other)?.focus();
    }, [rows]);

    const iconButton =
        "flex size-11 items-center justify-center rounded-lg text-typography-2 transition-colors disabled:opacity-30 sm:enabled:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1";

    return (
        <fieldset className={className}>
            <legend
                className={
                    hideLabel ? "sr-only" : "mb-1 text-typography-1 important"
                }
            >
                {label}
            </legend>
            {description && (
                <p className={"mb-3 text-sm text-typography-2"}>
                    {description}
                </p>
            )}
            <ul className={"flex flex-col gap-3"}>
                {rows.map((row, i) => {
                    const info = LINK_TYPES[row.type];
                    const problem = row.touched
                        ? linkProblem({
                              ...row,
                              url: normalizeLinkUrl(row.type, row.url),
                          })
                        : undefined;
                    return (
                        <li
                            key={row.key}
                            className={
                                "rounded-xl bg-layer-2 p-3 shadow-control"
                            }
                        >
                            <div
                                className={"-mr-2 -mt-2 mb-1 flex items-center"}
                            >
                                <p
                                    className={
                                        "flex-1 text-sm font-semibold text-typography-2"
                                    }
                                >
                                    Link {i + 1}
                                </p>
                                {(["up", "down"] as const).map((dir) => (
                                    <button
                                        key={dir}
                                        type="button"
                                        ref={(el) => {
                                            if (el)
                                                buttons.current.set(
                                                    `${row.key}-${dir}`,
                                                    el,
                                                );
                                            else
                                                buttons.current.delete(
                                                    `${row.key}-${dir}`,
                                                );
                                        }}
                                        aria-label={`Move link ${i + 1} ${dir}`}
                                        disabled={
                                            dir === "up"
                                                ? i === 0
                                                : i === rows.length - 1
                                        }
                                        onClick={() => move(i, dir)}
                                        className={`${iconButton} sm:enabled:hover:text-typography-1`}
                                    >
                                        <i
                                            aria-hidden="true"
                                            className={`bx bx-chevron-${dir} text-2xl`}
                                        />
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    aria-label={`Remove link ${i + 1}`}
                                    onClick={() =>
                                        update(
                                            rows.filter(
                                                (r) => r.key !== row.key,
                                            ),
                                        )
                                    }
                                    className={`${iconButton} sm:enabled:hover:text-red`}
                                >
                                    <i
                                        aria-hidden="true"
                                        className={"bx bx-trash text-xl"}
                                    />
                                </button>
                            </div>
                            <div
                                className={
                                    "grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-start"
                                }
                            >
                                <SelectField
                                    label={"Type"}
                                    value={row.type}
                                    options={typeOptions}
                                    fullWidth
                                    onChange={(type) =>
                                        edit(row.key, {
                                            type: type as LinkType,
                                        })
                                    }
                                />
                                <TextField
                                    label={"Link"}
                                    fullWidth
                                    value={row.url}
                                    placeholder={info.placeholder}
                                    maxLength={MAX_LINK_URL}
                                    inputMode={"url"}
                                    autoCapitalize={"off"}
                                    spellCheck={false}
                                    error={!!problem}
                                    helperText={problem}
                                    onChange={(e) =>
                                        edit(row.key, {
                                            url: e.target.value,
                                            touched: false,
                                        })
                                    }
                                    onBlur={() =>
                                        edit(row.key, {
                                            url: normalizeLinkUrl(
                                                row.type,
                                                row.url,
                                            ),
                                            touched: true,
                                        })
                                    }
                                />
                                <div className={"sm:col-start-2"}>
                                    <TextField
                                        label={
                                            row.type === "other"
                                                ? "Name"
                                                : "Name (optional)"
                                        }
                                        fullWidth
                                        value={row.name ?? ""}
                                        placeholder={info.label}
                                        maxLength={MAX_LINK_NAME}
                                        onChange={(e) =>
                                            edit(row.key, {
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <p className={"sr-only"} aria-live="polite">
                {announce}
            </p>
            <div className={"mt-3 flex items-center gap-3"}>
                <AsyncButton
                    disabled={rows.length >= MAX_LINKS}
                    onClick={() =>
                        update([
                            ...rows,
                            {
                                type: "instagram",
                                url: "",
                                name: "",
                                key: nextKey.current++,
                                touched: false,
                            },
                        ])
                    }
                >
                    <i aria-hidden="true" className={"bx bx-plus bx-xs mr-2"} />
                    Add Link
                </AsyncButton>
                <p className={"text-sm text-typography-3"}>
                    {rows.length}/{MAX_LINKS}
                </p>
            </div>
        </fieldset>
    );
};

export default FormSocialLinks;
