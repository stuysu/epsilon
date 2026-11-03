import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import dayjs, { Dayjs } from "dayjs";
import { describe, expect, it } from "vitest";
import TextField from "./TextField";
import TagField from "./TagField";
import { DateField, TimeField } from "./DateTimeField";

const Harness = ({
    field: Field,
    initial,
}: {
    field: typeof DateField;
    initial: string;
}) => {
    const [value, setValue] = useState<Dayjs | null>(dayjs(initial));
    return (
        <>
            <Field label="When" value={value} onChange={setValue} />
            <output>{value?.format("YYYY-MM-DD HH:mm") ?? "none"}</output>
        </>
    );
};

describe("TextField", () => {
    it("names the input after its label", () => {
        render(<TextField label="Title" value="" onChange={() => {}} />);
        expect(screen.getByLabelText("Title")).toBeTruthy();
    });
});

describe("DateField", () => {
    it("keeps the time when a typed date is valid", () => {
        render(<Harness field={DateField} initial="2026-11-02T15:35:00" />);
        fireEvent.change(screen.getByLabelText("When"), {
            target: { value: "12/15/2026" },
        });
        expect(screen.getByRole("status").textContent).toBe("2026-12-15 15:35");
    });

    it("restores the last good date after a bad one", () => {
        render(<Harness field={DateField} initial="2026-11-02T15:35:00" />);
        const input = screen.getByLabelText("When") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "13/99/20" } });
        fireEvent.blur(input);
        expect(input.value).toBe("11/02/2026");
    });
});

describe("TimeField", () => {
    it("keeps the date and accepts lowercase times", () => {
        render(<Harness field={TimeField} initial="2026-11-02T15:35:00" />);
        fireEvent.change(screen.getByLabelText("When"), {
            target: { value: "4:05 pm" },
        });
        expect(screen.getByRole("status").textContent).toBe("2026-11-02 16:05");
    });
});

describe("TagField", () => {
    const Tags = ({ options }: { options?: string[] }) => {
        const [value, setValue] = useState<string[]>(["one"]);
        return (
            <>
                <TagField
                    label="Tags"
                    value={value}
                    onChange={setValue}
                    options={options}
                />
                <output>{value.join(",")}</output>
            </>
        );
    };

    it("adds typed tags on comma and removes the last on backspace", () => {
        render(<Tags />);
        const input = screen.getByLabelText("Tags");
        fireEvent.change(input, { target: { value: "two" } });
        fireEvent.keyDown(input, { key: "," });
        expect(screen.getByRole("status").textContent).toBe("one,two");
        fireEvent.keyDown(input, { key: "Backspace" });
        expect(screen.getByRole("status").textContent).toBe("one");
    });

    it("only accepts listed options when there are options", () => {
        render(<Tags options={["red", "blue"]} />);
        const input = screen.getByLabelText("Tags");
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: "zzz" } });
        fireEvent.keyDown(input, { key: "Enter" });
        expect(screen.getByRole("status").textContent).toBe("one");
    });
});
