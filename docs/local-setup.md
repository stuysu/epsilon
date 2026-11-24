# Local setup

Run the site, database and edge functions on your own machine, with fake data.
Never point local work at production.

You need Node 24 (see `.nvmrc`), Docker, and Deno 2 for the functions. The
Supabase CLI runs through `npx supabase`.

## 1. Start a local Supabase stack

Keep the stack in its own folder, outside the three repos:

```sh
mkdir -p ~/epsilon-localsb && cd ~/epsilon-localsb
npx supabase init
```

Set `project_id = "localsb"` in `supabase/config.toml`. The database repo's
`apply-migration.sh` defaults to the container name this gives
(`supabase_db_localsb`); with another id, set `DB_CONTAINER=supabase_db_<id>`.
`replay-migrations.sh` has no default, so pass it `DB_CONTAINER` (or
`DATABASE_URL`) as below.

```sh
npx supabase start
npx supabase status   # URLs and keys
```

- API: http://127.0.0.1:54321
- Postgres: 127.0.0.1:54322
- Studio: http://127.0.0.1:54323

The anon key in `.env.example` is the CLI's public demo key and works with this
stack. `supabase status` also prints the service role key; keep that one out of
the site and out of git.

## 2. Load the schema and fake data

From the `epsilon-database` repo:

```sh
DB_CONTAINER=supabase_db_localsb scripts/replay-migrations.sh
```

This applies every numbered migration in order as `supabase_admin`, then
`POPULATE_DATABASE.sql`. It refuses to run if `public` already has tables. To
start over:

```sh
docker exec -i supabase_db_localsb psql -U supabase_admin -d postgres \
  -v drop_everything=yes < DROP_ALL_TABLES.sql
```

In Studio, create a public storage bucket named `public-files` (5 MB limit) for
club pictures.

## 3. Sign in as a test user

The site only offers Google sign-in, which doesn't work locally. Instead, give a
seed user (for example `creator@example.com`, a site admin) an auth account with
a password, then hand the session to the browser.

1. Studio → Authentication → Add user → Create new user. Use the seed email,
   pick any password, and tick "Auto Confirm User".
2. Get a session (use the anon key from `.env.example`):

    ```sh
    curl -s "http://127.0.0.1:54321/auth/v1/token?grant_type=password" \
      -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
      -d '{"email":"creator@example.com","password":"<your password>"}'
    ```

3. On http://localhost:3000, open the console and run
   `localStorage.setItem("sb-127-auth-token", '<the JSON from step 2>')`, then
   reload.

Any email in `public.users` works the same way. An auth user whose email isn't
in `public.users` sees the "unauthorized" page.

## 4. Run the site

From this repo:

```sh
cp .env.example .env.local
npm ci
npm start           # http://localhost:3000
```

Other scripts: `npm run lint`, `npm test` (unit tests), `npm run build` (type check + build),
`npm run preview`.

Without `REACT_APP_SUPABASE_URL` the site would use production, so `npm start`
warns and the page refuses to load, and `npm run build` fails (except on
Netlify). Set `REACT_APP_ALLOW_PROD_DB=true` only if you really mean production.

## 5. Run the edge functions

The CLI serves functions from `supabase/functions` in the stack folder, so copy
the `epsilon-functions` repo there (re-run after each change):

```sh
rsync -a --delete --exclude .git ../epsilon-functions/ ~/epsilon-localsb/supabase/functions/
```

Create `~/epsilon-localsb/fn.env` for the settings the CLI doesn't provide
(`SUPABASE_URL` and the keys are filled in automatically):

```sh
NODEMAILER_HOST=host.docker.internal
NODEMAILER_PORT=1025
NODEMAILER_SECURE=false
NODEMAILER_EMAIL=test@example.com
NODEMAILER_PASSWORD=unused
NODEMAILER_FROM=epsilon@example.com
SITE_URL=http://localhost:3000
```

Then:

```sh
cd ~/epsilon-localsb
npx supabase functions serve --env-file fn.env
```

Functions answer at `http://127.0.0.1:54321/functions/v1/<name>`, which is
where the site already calls them.

## 6. Catch outgoing email with Mailpit

```sh
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Emails the functions send show up at http://localhost:8025. Nothing leaves your
machine.
