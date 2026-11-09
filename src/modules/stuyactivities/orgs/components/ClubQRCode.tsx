import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const PNG_SIZE = 1024;

/* clubs without a picture get their first letter, like their avatar */
const letterImage = (name: string) =>
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#2a2a2a"/><text x="50" y="68" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="600" fill="#ffffff" text-anchor="middle">${(name.trim().charAt(0) || "?").toUpperCase().replace(/[<&>"]/g, "")}</text></svg>`,
    );

/* the logo has to be inlined, or the canvas can't export the image */
const toDataUrl = async (src: string) => {
    const response = await fetch(src, { mode: "cors" });
    if (!response.ok) throw new Error("picture unavailable");
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });

const svgToPng = async (svg: SVGSVGElement) => {
    const markup = new XMLSerializer().serializeToString(svg);
    const image = await loadImage(
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup),
    );
    const canvas = document.createElement("canvas");
    canvas.width = PNG_SIZE;
    canvas.height = PNG_SIZE;
    canvas.getContext("2d")?.drawImage(image, 0, 0, PNG_SIZE, PNG_SIZE);
    return canvas.toDataURL("image/png");
};

const ClubQRCode = ({
    value,
    picture,
    name,
    className,
}: {
    value: string;
    picture?: string;
    name?: string;
    className?: string;
}) => {
    const [png, setPng] = useState<string>();
    const [logo, setLogo] = useState<string>();
    const hidden = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let stale = false;
        const fallback = letterImage(name || "");
        setPng(undefined);
        (picture
            ? toDataUrl(picture).catch(() => fallback)
            : Promise.resolve(fallback)
        ).then((src) => !stale && setLogo(src));
        return () => {
            stale = true;
        };
    }, [picture, name]);

    useEffect(() => {
        const svg = hidden.current?.querySelector("svg");
        if (!logo || !svg) return;
        let stale = false;
        svgToPng(svg)
            .then((url) => !stale && setPng(url))
            .catch(() => !stale && setPng(undefined));
        return () => {
            stale = true;
        };
    }, [logo, value]);

    const settings = {
        src: logo || letterImage(name || ""),
        width: Math.round(PNG_SIZE * 0.2),
        height: Math.round(PNG_SIZE * 0.2),
        excavate: true,
    };

    return (
        <>
            {png ? (
                <img
                    src={png}
                    alt={`QR code for ${name || "this meeting"}'s attendance`}
                    className={className}
                />
            ) : (
                <QRCodeSVG
                    value={value}
                    size={PNG_SIZE}
                    level="H"
                    includeMargin
                    imageSettings={settings}
                    className={className}
                    role="img"
                    aria-label="QR code"
                />
            )}
            <div ref={hidden} aria-hidden="true" className={"hidden"}>
                {logo && (
                    <QRCodeSVG
                        value={value}
                        size={PNG_SIZE}
                        level="H"
                        includeMargin
                        imageSettings={settings}
                    />
                )}
            </div>
        </>
    );
};

export default ClubQRCode;
