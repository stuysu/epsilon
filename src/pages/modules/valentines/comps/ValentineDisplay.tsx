import { Valentine } from "../ValentineType";

const ValentineDisplay = ({ valentine }: { valentine: Valentine }) => {
    return (
        <>
            {[
                "id",
                "sender",
                "receiver",
                "show_sender",
                "message",
                "background",
            ].map((key: string) => (
                <p>
                    {key}: {valentine[key]}
                </p>
            ))}
            valentine yes<p>a</p>
        </>
    );
};

export default ValentineDisplay;
