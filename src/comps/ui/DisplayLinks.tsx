import Link from "@mui/material/Link";

const DisplayLinks = ({ text }: { text: string }) => {
    if (text)
        return (
            <>
                {text.split(" ").map((word, i, a) => {
                    if (!word.startsWith("http")) {
                        let outText = word;

                        if (i !== a.length - 1) {
                            outText += " ";
                        }

                        return outText;
                    }

                    return (
                        <Link
                            key={i}
                            href={word}
                            color="inherit"
                            target="_blank"
                            rel="noreferrer"
                            style={{ textAlign: "center" }}
                        >
                            {word}
                        </Link>
                    );
                })}
            </>
        );
    else return <></>;
};

export default DisplayLinks;
