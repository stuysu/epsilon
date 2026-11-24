# Release checklist

Ship in this order: **database → functions → site**. Each step must work with the
previous version of the next one, since there's a gap between them.

## Before

- [ ] CI is green on all three PRs (site, functions, database).
- [ ] Each migration was dry-run on a local stack:
      `scripts/apply-migration.sh --dry-run NNN_NAME.sql` in `epsilon-database`.
- [ ] Nothing already applied was edited. Changes go in a new numbered file.
- [ ] You know how to undo each step (a follow-up migration, a revert commit).

## 1. Database

Production is the `supabase-db` container on the Supabase droplet. Run as
`supabase_admin`; the Studio SQL editor runs as `postgres` and can't alter most
tables.

- [ ] Dry run against production first:

    ```sh
    DB_SSH=<user>@<droplet> DB_CONTAINER=supabase-db \
      scripts/apply-migration.sh --dry-run NNN_NAME.sql
    ```

- [ ] Apply it (asks you to type the version):

    ```sh
    DB_SSH=<user>@<droplet> DB_CONTAINER=supabase-db \
      scripts/apply-migration.sh NNN_NAME.sql
    ```

- [ ] Check it was recorded:
      `select * from public.schema_migrations order by version desc limit 5;`
- [ ] Merge the database PR into `main`.

## 2. Functions

Merging to `master` in `epsilon-functions` deploys to production through a
webhook. There is no staging and no automatic rollback.

- [ ] Merge the functions PR into `master`.
- [ ] Call one changed function from the live site and check it works.
- [ ] If anything breaks, revert the merge commit on `master`; that redeploys the
      old code.

## 3. Site

- [ ] Merge the site PR into `main`. Netlify builds and deploys it.
- [ ] Wait for the Netlify deploy to finish.

## After

- [ ] Hard-refresh https://epsilon.stuysu.org and sign in.
- [ ] Open a club page, the calendar and anything the release touched.
- [ ] Check the browser console for errors.
- [ ] If emails changed, send one to yourself.
- [ ] Note what shipped in the PRs or release notes.
