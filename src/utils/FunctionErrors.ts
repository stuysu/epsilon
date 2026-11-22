/*
edge function errors from supabase.functions.invoke carry the Response in
`context`, except network/CORS failures, where `context` is the thrown error
and has no body. These helpers never throw.
*/
const responseOf = (error: unknown): Response | undefined => {
    const context = (error as { context?: unknown } | null)?.context;
    return context instanceof Response ? context : undefined;
};

/* the message the function sent back, or "" if there isn't one */
export const functionErrorText = async (error: unknown): Promise<string> => {
    const response = responseOf(error);
    if (!response) return "";
    try {
        return (await response.clone().text()).trim();
    } catch {
        return "";
    }
};

/* the HTTP status the function answered with, if it answered at all */
export const functionErrorStatus = (error: unknown): number | undefined =>
    responseOf(error)?.status;
