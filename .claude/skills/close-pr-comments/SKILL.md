---
name: close-pr-comments
description:
  After review fixes have been approved, commit and push them to the PR, then
  reply to each unresolved review thread with what was done (or why not) and
  resolve it. The follow-up to fix-pr-comments. Defaults to the current branch's
  PR; takes an optional PR number and any extra instructions.
argument-hint: "[pr-number] [extra instructions]"
---

# Close PR review comments

Arguments: `$ARGUMENTS`. A leading number is the PR to work on; anything else is
extra instruction from the user and overrides the defaults here. With no
arguments, use the current branch's PR.

This is the second half of `fix-pr-comments`. That skill stops before committing
because the user reviews in the VS Code Source Control panel; this one runs
**only when the user has invoked it** — that invocation is the go-ahead to
commit, push, and speak in their name on the PR. Nothing here is a default to
fall into from another workflow.

## 1. Find the PR and check the working tree

With a PR number in the arguments, pass it explicitly — without it `gh pr view`
falls back to the current branch's PR, which is the wrong one:

```bash
gh pr view <N> --json number,baseRefName,headRefName,url
```

Otherwise omit the number. If no PR exists for this branch, say so and stop.

Confirm the checkout is on that PR's `headRefName` and look at
`git status --short`. The modified files should be the review fixes, plus any
regenerated snapshots under `e2e/theme.spec.js-snapshots/` that a visual fix
required. Anything else — an unrelated file, a new skill, a scratch edit — is
**not** staged: list it in the report and leave it in the working tree. **Stay
in this worktree**; never `git worktree add`.

If the tree is clean and the fixes are already committed but unpushed, skip to
pushing. If there is nothing to commit and nothing to push, ask whether the
threads should be answered without a code change before replying to any.

## 2. Verify before committing

Unless the suite has already been run on exactly these changes in this session:

```bash
npm run format        # prettier, writes
npm run lint          # stylelint + eslint; must be clean
npm run test:run      # vitest, non-watch — never bare `npm test` (watch mode)
npm run test:e2e      # playwright; slower
```

If `package.json` is among the changes, run `npm install` first, so a review fix
that adds or bumps a dependency is not linted and tested against the old one.

A failure stops the skill. Do not push red, and do not reply to a reviewer about
a fix that does not pass. The one judgement call is a known-flaky E2E test under
full local parallelism: rerun it alone (`--workers=1 --retries=0`) and, if it
passes, say so in the report rather than treating it as green or red silently.

## 3. Commit and push

Stage the review-fix files **by path**, never `git add -A`. The message format
and the `Co-Authored-By` trailer are in the `fix-issue` skill — follow it.
Reference the issue the PR closes, and say in the body that the commit addresses
review on the PR and why each change was made.

```bash
git push
```

Keep the short SHA: every reply cites it.

## 4. Fetch the unresolved threads

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

Filter to `isResolved == false`. Match each thread to what was actually done
this session — the `fix-pr-comments` report is the record. A thread nothing was
decided about is **not** answered: leave it open and name it in the report.

## 5. Reply, then resolve

One reply per thread. It says what changed and cites the SHA, or — where the
suggestion was not followed — why, with the evidence that decided it (the
spec, the test, the constraint the reviewer could not see from the diff). State
the facts once; do not argue, and do not restate the diff.

Write the body to a variable with a quoted heredoc so backticks and `$` survive
the shell, then reply and resolve in one chain, so a failed reply never leaves a
silently resolved thread:

```bash
body=$(cat <<'EOF'
Fixed in abc1234. …
EOF
)
gh api graphql \
  -f query='mutation($id:ID!,$body:String!){ addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$id, body:$body}){ comment{ url } } }' \
  -f id='<thread id>' -f body="$body" \
  --jq '.data.addPullRequestReviewThreadReply.comment.url' \
&& gh api graphql \
  -f query='mutation($id:ID!){ resolveReviewThread(input:{threadId:$id}){ thread{ isResolved } } }' \
  -f id='<thread id>' --jq '.data.resolveReviewThread.thread.isResolved'
```

Threads are independent: run them in parallel.

**When not to resolve.** Reply but leave the thread open when the reply
disagrees with a **human** reviewer and the user did not explicitly say to close
it — resolving your own rebuttal ends the conversation on their behalf. Bot
reviewers (`copilot-pull-request-reviewer` and the like) can be resolved after a
disagreeing reply. Leave open, too, any thread whose fix the user chose to
defer.

If the PR body needs amending as well and `gh pr edit` fails on a
Projects-classic deprecation, use
`gh api -X PATCH repos/lightofdata/website/pulls/<n> -F body=@<file>`.
Capital `-F`: lower-case `-f` sends `@<file>` as the literal body.

## 6. Report

- The commit SHA and that it is pushed.
- One line per thread: reviewer, file, what the reply said, the reply URL, and
  whether it is resolved.
- Every thread left open, and why.
- Anything in the working tree that was deliberately not committed.

CI (`.github/workflows/validate.yml`) runs on the push but skips the visual
snapshot tests and never runs WebKit; do not let a green check stand in for a
visual change or anything Safari-specific.
