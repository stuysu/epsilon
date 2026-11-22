/*
toasts are drawn outside the dialog, so pressing one would otherwise count
as clicking away and close the dialog along with anything typed in it
*/
const keepOpenOnToast = (event: {
    target: EventTarget | null;
    preventDefault: () => void;
}) => {
    if (
        event.target instanceof Element &&
        event.target.closest(".notistack-SnackbarContainer")
    ) {
        event.preventDefault();
    }
};

export default keepOpenOnToast;
