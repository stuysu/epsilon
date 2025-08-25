# Contributing Guide - Epsilon Client

At this time, StuySU IT is **not** accepting external contributions.
The following documentation is meant for Directors and Members.

## Editing Process

1. Review the [developer wiki](https://github.com/stuysu/epsilon/wiki/).
2. Edit or create any files needed for your changes.
3. Test that all components and routes that you have modified work correctly. If
   your changes are stateful or otherwise depend on context (e.g. user login,
   React Router), make sure to consider all possibly relevant states, including
   but not limited to:
    1. Refreshing the page
    2. Directly entering the link into a new tab
    3. Unauthenticated vs. authenticated sessions
    4. Different breakpoints (mobile, tablet, desktop)
    5. Different color schemes (light mode, dark mode)
    6. Slow network conditions (use mobile simulation in DevTools or Network Link Conditioner to throttle
       bandwidth)
    7. Error states
4. Make sure to execute prettier (`npm run prettier`) to ensure that your code
   conforms to the project style guidelines. This will be automatically verified
   during step 5. Alternatively, use `npx prettier --write` to scan and edit
   specific files. (e.g. `npx prettier --write $(git diff --name-only)` to
   only edit files that have unstaged changes)
5. Verify via `git diff` that you have made the correct changes, and commit the
   changed files to a branch.
6. Create a pull request explaining your changes. If the changes address an open
   issue, please use one of the
   relevant [keywords](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests)
   in your commit or PR description.
7. Request a review from a Director. They will review your changes, and ask for
   modifications if needed.
8. When your code passes all checks (CI _and_ reviewer) — **especially for new, unreviewed commits, if any** — congratulations! Your PR will be merged and
   closed, with automatic deployment via Netlify soon to follow.

Note: Merges should be ideally be performed as fast-forwards (via Git CLI)
if possible, and in lieu of that, a merge commit or rebase is acceptable.
Changes should **_never_** be squashed.
