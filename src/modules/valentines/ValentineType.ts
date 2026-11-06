export type Valentine = {
    [key: string]: any;
    id: number;
    // null on received valentines when the sender chose to stay anonymous
    sender: number | null;
    receiver: number;
    show_sender: boolean;

    message: string;
    background: string;
};
