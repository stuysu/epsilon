import * as Separator from "@radix-ui/react-separator";

export default function Divider(props: Separator.SeparatorProps) {
    return (
        <Separator.Root className="bg-lineSeparator w-full h-px my-3" {...props} />
    );
}
