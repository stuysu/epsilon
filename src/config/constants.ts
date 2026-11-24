// links and assets point at this site, wherever it is served from
export const PUBLIC_URL =
    process.env.REACT_APP_PUBLIC_URL || window.location.origin;
export const SUPABASE_URL =
    process.env.REACT_APP_SUPABASE_URL || "https://base.stuysu.org/";
export const SUPABASE_ANON_KEY =
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg3OTY4Mzk2LCJleHAiOjE5NDU2NDgzOTZ9.Ajo4QUjgnsVUYKjTW7rdDYOUpLI3X-A7SWQFVtFrhmg";

// npm start without local settings would otherwise read and write production data
if (
    process.env.NODE_ENV === "development" &&
    !process.env.REACT_APP_SUPABASE_URL &&
    process.env.REACT_APP_ALLOW_PROD_DB !== "true"
) {
    throw new Error(
        "REACT_APP_SUPABASE_URL is not set, so this would use the production database. Point it at a local Supabase, or set REACT_APP_ALLOW_PROD_DB=true.",
    );
}

// where people are told to write when something breaks
export const SUPPORT_EMAIL = "it@stuysu.org";
