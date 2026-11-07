import { CSSProperties, ReactNode } from "react";
import { Avatar as RadixAvatar } from "radix-ui";

type AvatarProps = {
    src?: string | null;
    alt?: string;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    onLoad?: () => void;
};

const Avatar = ({
    src,
    alt,
    className = "",
    style,
    children,
    onLoad,
}: AvatarProps) => (
    <RadixAvatar.Root
        className={`relative flex h-10 w-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full text-[1.25rem] ${className}`}
        style={style}
    >
        <RadixAvatar.Image
            src={src || undefined}
            alt={alt}
            className="h-full w-full object-cover"
            onLoadingStatusChange={(status) => {
                if (status === "loaded") onLoad?.();
            }}
        />
        {/* with a picture, wait a moment so the placeholder doesn't flash before it loads */}
        <RadixAvatar.Fallback
            delayMs={src ? 600 : undefined}
            className={`flex h-full w-full items-center justify-center ${
                style?.backgroundColor
                    ? ""
                    : "bg-[#757575] text-white scheme-dark:text-[#121212]"
            }`}
        >
            {children ?? <i className="bx bxs-user text-[1.5rem]" />}
        </RadixAvatar.Fallback>
    </RadixAvatar.Root>
);

export default Avatar;
