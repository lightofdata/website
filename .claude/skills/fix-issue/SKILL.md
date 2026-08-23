---
name: fix-issue
description:
  Fix a GitHub issue in this repo end to end — verify the issue's claims,
  branch, implement, test, then stop for review before committing and opening a
  PR into dev. Takes an issue number and any extra instructions.
argument-hint: <issue-number> [extra instructions]
---

# Fix an issue

Arguments: `$ARGUMENTS`. The first token is the issue number; anything after it
is extra instruction from the user and overrides the defaults here.

## 1. Read the issue, then check whether it is still true

```bash
gh issue view <N> --json title,body,labels,state -q '.title + "\n\n" + .body'
```

**Re-read every line the issue cites before acting on it.** The issue may have
been written weeks ago against markup that has since moved, and a fix aimed at a
stale quote is worse than no fix. That matters more than usual here: nearly all
of the page lives in one big `index.html`, so line numbers drift constantly.

If the issue turns out to be wrong or already fixed, say so and stop rather than
inventing work to justify the ticket.

Note what the issue explicitly puts out of scope, and what it lists as _related_
issues — those usually touch the same file and are where a later conflict will
land. Mention them in the PR rather than silently fixing them too.

## 2. Branch

Branch from the current branch by default, following the repo's convention —
`feature/<N>-<short-kebab-slug>` for new work, `bugfix/<N>-<short-kebab-slug>`
for a defect:

```bash
git checkout -b feature/<N>-<short-kebab-slug>
```

Before doing anything else, check how that base sits against the PR base:

```bash
git fetch origin
git log --oneline origin/dev..HEAD
```

If that prints nothing, the two are level and there is nothing to think about.
If it prints commits, **they will all appear in the PR diff** alongside the fix,
because `dev` is the base the PR is opened against. Say so plainly — list what
is being carried and ask whether to keep it or rebranch from `origin/dev` —
before writing any code. Do not switch the base unasked.

Carrying them is often right: a fix that builds on unmerged work has to. What is
never right is carrying them without noticing. When the PR does stack on
something, say in its body what it stacks on and why.

Either way, name the base commit in your report so a wrong one is visible before
the PR is opened rather than after.

**Stay in this worktree** — never `git worktree add`. If you need to look at
another branch, check it out here and switch back. Check the working tree is
clean before switching; if it is not, ask rather than moving someone's
uncommitted work.

Never use bare `git stash` / `git stash pop`: the stash stack is shared with the
main checkout and other sessions. Use a temporary WIP commit, or
`git stash push -u -m "<unique-tag>"` and recover with `git stash apply <sha>`.

## 3. Find the prior art before inventing anything

`.github/copilot-instructions.md` is the architecture summary for this repo —
read it first. The longer-form docs are worth knowing:

- `TESTING.md` and `E2E_TESTING_GUIDE.md` — the unit and E2E strategy, and the
  shared helpers the specs expect you to reuse.
- `COOKIES.md` and `GOOGLE_ANALYTICS.md` — the consent model and the GA
  Consent Mode v2 wiring. Anything touching tracking, consent, or the cookie
  dialog has a documented answer already; do not improvise a new one.

The shape of the codebase:

- `index.html` holds the page content **and** its JavaScript inline. New
  behaviour usually belongs in the existing inline script, not a new module,
  unless the issue asks for extraction.
- `src/style.css` is the single stylesheet, driven by CSS custom properties
  (`--smooth-ease`, `--smooth-duration`). It is mobile-first with one
  consolidated `@media (max-width: 600px)` block — put responsive rules there
  rather than opening a second breakpoint.
- The theme system persists to `localStorage` with a system-preference
  fallback, and a theme switch updates several assets at once (GitHub and
  LinkedIn icons, favicon). Miss one and the visual snapshots catch it.
- Static assets live in `public/images/` in size- and format-specific
  subdirectories.

## 4. Implement

Things in this repo that bite:

- **Consent first.** No analytics call, script tag, or cookie may fire ahead of
  consent. If a change adds anything that touches GA, walk through the
  denied-consent path explicitly and say in the report that you did.
- **GA has three modes** — development (`GA-DEVELOPMENT-MODE`, console-logged),
  test (`GA-TEST-MODE`, injected by `vitest.config.js`), and the real
  production id substituted at build time by `@rollup/plugin-replace`. A change
  that only works in one of the three is a bug.
- **Visual snapshots are committed.** `e2e/theme.spec.js-snapshots/` holds
  per-browser, per-platform PNGs (`*-linux.png`). Any deliberate visual change
  needs them regenerated — `npx playwright test --update-snapshots` — and the
  regenerated files belong in the PR. Say plainly that they were regenerated,
  and never update a snapshot to silence a failure you have not explained.
- **Mobile is a distinct code path**, not just narrower CSS: the hamburger menu
  is absolutely positioned and the E2E specs drive it through
  `ensureMobileMenuOpen()` / `clickMobileNavLink()`. Check a nav change on both.

## 5. Verify

```bash
npm run format        # prettier, writes
npm run lint          # stylelint + eslint; must be clean
npm run test:run      # vitest, non-watch
npm run test:e2e      # playwright; slower — chromium, firefox, Mobile Chrome
```

`npm test` alone starts vitest in **watch mode** and will hang a non-interactive
run — always use `test:run`.

If Playwright complains about missing browsers:
`npx playwright install --with-deps chromium firefox`.

Add tests for the actual defect, in the existing file for that area —
`src/test/*.test.js` for unit (jsdom, with global mocks in
`src/test/setup.js`), `e2e/*.spec.js` for end-to-end. Reuse the existing
helpers, `handleCookieConsent()` above all: an E2E spec that does not dismiss
the consent dialog fails for the wrong reason.

## 6. Stop. Do not commit.

Report what changed and **leave everything as unstaged modifications**. The user
reviews in the VS Code Source Control panel, which reads the working tree — a
commit empties it and the review step silently disappears.

In the report:

- Point at the two or three hunks most worth scrutiny, by `file:line`.
- Call out anything **beyond the issue's scope** you did anyway, and offer to
  cut it.
- Call out anything **irreversible** and why you chose it now — regenerated
  visual snapshots count.
- Say what you could not verify yourself.

If a commit was already made by mistake:
`git reset --soft HEAD~1 && git restore --staged .`

## 7. On an explicit go-ahead: commit, push, PR

Commit message: `type(scope): summary (#N)` — a body explaining _why_, wrapped
at ~72 columns, ending with:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

Then push and open the PR **into `dev`**, not `main`:

```bash
git push -u origin <branch>
gh pr create --base dev --title "..." --body-file <file>
```

`dev` is promoted to `main` separately, by its own PR, and pushing to `main` is
what deploys the live site. Never open a fix PR straight into `main`.

Write the body to a scratchpad file rather than passing it inline. Include
`Closes #<N>`, the reasoning, what you left out, and the same scope flags from
the review report. End with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

If `gh pr edit` fails on a Projects-classic deprecation (it does in the sibling
`time_tracker` repo), amend the PR with:

```bash
gh api -X PATCH repos/lightofdata/website/pulls/<n> -f body=@<file>
```

CI (`.github/workflows/validate.yml`) runs on PRs to `main` and `dev`: build,
`format:check`, `lint`, `test:run`, then E2E on chromium and firefox. It does
**not** run WebKit — `test:e2e:webkit` is opt-in behind `ENABLE_WEBKIT=true`,
so a Safari-only bug will pass CI. If the fix can only be observed on a real
device or in Safari, say that plainly rather than letting a green check imply
otherwise.
