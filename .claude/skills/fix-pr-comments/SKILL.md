---
name: fix-pr-comments
description:
  Fetch the unresolved review threads on a pull request and address them, then
  stop for review before committing. Defaults to the current branch's PR; takes
  an optional PR number and any extra instructions.
argument-hint: "[pr-number] [extra instructions]"
---

# Fix PR review comments

Arguments: `$ARGUMENTS`. A leading number is the PR to work on; anything else is
extra instruction from the user and overrides the defaults here. With no
arguments, use the current branch's PR.

## 1. Find the PR

With a PR number in the arguments, pass it explicitly — without it `gh pr view`
falls back to the current branch's PR, which is the wrong one:

```bash
gh pr view <N> --json number,baseRefName,headRefName
```

With no PR number, omit it and take the current branch's PR:

```bash
gh pr view --json number,baseRefName,headRefName
```

If no PR exists for this branch, say so and stop — do not create one.

Make sure the working tree is on that PR's head branch before editing anything.
**Stay in this worktree**; never `git worktree add`.

## 2. Fetch the unresolved threads

Substitute the `number` from step 1 for `NUMBER`:

```bash
gh api graphql -f query='
{ repository(owner: "lightofdata", name: "website") {
    pullRequest(number: NUMBER) {
      reviewThreads(first: 100) { nodes {
        id isResolved isOutdated path line
        comments(first: 10) { nodes { body author { login } } }
      } }
    } } }'
```

Filter to `isResolved == false`. If there are none, say so and stop.

Keep each thread's `id` — it is what a reply or a resolve needs later.

`isOutdated` threads point at code that has since moved. Read the current file
before deciding whether the comment still applies; an outdated thread is often
already handled, and saying so is a better answer than editing around it. Expect
plenty of these on `index.html`, where almost everything shares one file and
line numbers shift under any edit.

## 3. Work each thread

For every unresolved thread: read the file at that line **with surrounding
context**, understand what the reviewer is actually asking for, and fix the
cause rather than the symptom.

A review comment is a hypothesis, not an instruction. If the reviewer is
mistaken, or the fix they suggest would break something they could not see from
the diff, do not silently comply — make the case in your report and let the user
decide. Note it and move on; do not argue in the PR thread unasked.

Follow the house conventions in the `fix-issue` skill for anything the change
touches — in particular the consent-before-analytics rule, the single
`@media (max-width: 600px)` breakpoint, and the committed visual snapshots
under `e2e/theme.spec.js-snapshots/`. A review comment asking for a visual
tweak means those snapshots need regenerating in the same push.

## 4. Verify

```bash
npm run format        # prettier, writes
npm run lint          # stylelint + eslint; must be clean
npm run test:run      # vitest, non-watch — never bare `npm test` (watch mode)
npm run test:e2e      # playwright; slower
```

## 5. Stop. Do not commit.

Leave everything as unstaged modifications. The user reviews in the VS Code
Source Control panel, which reads the working tree — a commit empties it and the
review step silently disappears.

Report one line per thread: the reviewer, the file, what you changed, and
explicitly which threads you **did not** act on and why. Flag anything you could
not verify yourself — Safari behaviour in particular, since CI does not run
WebKit.

If a commit was already made by mistake:
`git reset --soft HEAD~1 && git restore --staged .`

## 6. On an explicit go-ahead

Commit and push to the existing PR branch. Message format and the
`Co-Authored-By` trailer are in the `fix-issue` skill — follow it rather than
reinventing them.

Do not resolve the threads yourself unless the user asks. Replying to or
resolving a thread is a message to the reviewer in the user's name, and that is
theirs to send.
