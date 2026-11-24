# GitHub Actions

## CI (`ci.yml`)

Runs on every pull request and on pushes to `main`: `npm ci`, `tsc --noEmit`,
`eslint src`, `npm test` and `vite build`, on the Node version in `.nvmrc`. It uses
placeholder `REACT_APP_*` values, so it needs no secrets.

Make it a required check: Settings → Branches → branch protection rule for
`main` → "Require status checks to pass" → add `build`.

The functions repo (`check`) and the database repo (`replay`) have their own CI.
The functions check matters most, since merging to `master` deploys straight to
production.

## Bulletin import (`import-bulletin.yml`)

Runs twice a day and can be started by hand (with a dry-run option). It only
runs in `stuysu/epsilon`. Settings → Secrets and variables → Actions:

| Name                      | Kind     | What                                                                                                                                                     |
| ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`            | Variable | Production API URL                                                                                                                                       |
| `SUPABASE_ANON_KEY`       | Variable | Production anon key (public)                                                                                                                             |
| `BULLETIN_IMPORTER_TOKEN` | Secret   | A JWT whose `role` claim is `bulletin_importer`, signed with the production JWT secret. That role can only write the opportunity tables (migration 052). |
| `DISCORD_WEBHOOK_URL`     | Secret   | Optional. Gets a message when the import fails.                                                                                                          |

To test locally: `npm run import-bulletin -- --dry-run`, with the first three
set in your shell.

## Restyled (`restyled-io.yml`)

Checks formatting on pull requests and opens a fix-up PR when something is off.
