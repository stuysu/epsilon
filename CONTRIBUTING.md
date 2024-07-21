# Contributing Guide -- Epsilon Client

At this time, StuySU IT is **not** accepting external contributions.
The following documentation is meant for Directors and Members.

## Editing Process

1. Edit or create any files needed for your changes.
2. Test that all components and routes that you have modified work correctly. If
   your changes are stateful or otherwise depend on context (e.g. user login,
   React Router), make sure to consider all possibly relevant states, including
   but not limited to:
    1. Refreshing the page
    2. Directly entering the link into a new tab
    3. Unauthenticated sessions
    4. Authenticated sessions
    5. Light Mode
    6. Dark Mode
    7. Slow network conditions (use mobile simulation in DevTools to throttle
       bandwidth)
    8. Error states
3. Make sure to execute prettier (`npm run prettier`) to ensure that your code
   conforms to the project style guidelines. This will be automatically verified
   during step 5.
4. Verify via `git diff` that you have made the correct changes, and commit the
   changed files to a branch.
5. Create a pull request explaining your changes. If the changes address an open
   issue, please use one of the
   relevant [keywords](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests)
   in your commit or PR description.
6. Request a review from a Director. They will review your changes, and ask for
   modifications if needed.
7. When your code passes all checks, congratulations! Your PR will be merged and
   closed, with automatic deployment via Netlify soon to follow.
