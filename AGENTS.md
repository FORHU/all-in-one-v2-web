# All-In-One V2 Web (Merchant Admin) Rules

## Branching: Continuous Staging and On-Demand Main Synchronization

> This section takes precedence over any other branch or pull-request-target instruction in this file.
> `main` is this repository's production branch.

The development workflow is continuous and is not restricted to a daily schedule, a single task, or a fixed number of tasks.

- Before beginning a new development cycle, inspect the relationship between `main` and `staging` and synchronize them when necessary.
- All task branches must originate from the latest `staging`.
- Completed tasks must be submitted through PRs targeting `staging`.
- Developers and agents may continue starting and completing additional tasks for as long as needed.
- Do not synchronize `staging` into `main` automatically after each task, after a fixed time interval, or simply because the day has ended.
- Synchronize `staging` into `main` only when the team explicitly decides that the accumulated changes are ready for delivery.
- Before synchronization, validate the combined changes and complete all required reviews and checks.
- Never merge unfinished or known-broken changes into `main`.
- After synchronization, verify the resulting branch state before continuing.
- **When a task is done, ask the repository owner / team lead whether it is all good.** They decide whether it merges and when `staging` is synchronized; an agent's or author's own judgment is not approval.
- **Check deploy triggers before merging into `staging`:** some repos deploy on pushes to `staging` (see `.github/workflows/`). Merging is a deployment decision, not just a code review.
- **Project board:** move the item through the product's GitHub Project — Backlog → To-Do → In progress → Done.

**Workflow:** Establish baseline → Develop tasks → Merge completed tasks into staging → Continue working or synchronize to main when ready → Repeat.

`staging` is the continuous integration branch. `main` is updated on demand when the team chooses to deliver the accumulated changes.

```bash
# Start a task
git fetch origin
git log --oneline origin/main..origin/staging   # what staging has that main doesn't
git checkout staging && git pull
git checkout -b <type>/<short-description>      # feat/, fix/, docs/, test/, chore/ ...

# Finish a task: open a PR into staging (never into main)
gh pr create --base staging

# Deliver (only when the owner decides): one PR from staging into main
gh pr create --base main --head staging
```

---

## 1. Git Branching and Work Safety

### Inspect Before Editing

- Before making any changes, inspect `git status`, the current branch, and `git diff`.
- Check for uncommitted changes and verify whether they belong to the current task.
- Never discard, reset, clean, stash, or commit existing work without explicit authorization.

### Dedicated Branches Are Mandatory

- Before implementing a new feature, bug fix, refactor, optimization, or other code change, create or switch to a dedicated task branch.
- Never develop directly on `main`, `master`, or `staging`.
- Use descriptive branch names (`feat/*`, `fix/*`, `perf/*`, `refactor/*`, `docs/*`, `test/*`, `chore/*`).
- If a change spans multiple services, use the matching branch name across repositories.

### Preserve Existing Work

- If the current branch contains unrelated uncommitted changes, do not automatically commit, stash, or move them.
- If existing changes overlap with the task or ownership is unclear, stop and ask for clarification before editing.
- Before switching branches, check whether uncommitted changes could carry into another branch.

### Completion & Branch Preservation

- Report the branch used in the task completion summary.
- Do not merge into protected or shared branches, push changes, or open a pull request unless explicitly requested or authorized.
- **Never delete branches (local or remote)**: Do not delete any branch (`git branch -d`, `git branch -D`, or `git push --delete`), even after a merge or pull request is completed, unless explicitly instructed by the user.

---

## 2. Architecture & Tenant Isolation

- **Architecture Validation**: Enforced via `pnpm validate` (`tools/validate-architecture.mjs`). All files and module boundaries must conform to project structure.
- **Multi-Tenant Registry**: Respect tenant isolation rules and schema configuration in `tenants/registry.ts` and `tenants/types.ts`.
- **Component Design System**: Reusable UI components belong in `components/ui/`, feature modules belong in their dedicated feature directory.

---

## 3. Verification Commands

Always verify changes before opening PRs:

```bash
pnpm validate          # Architecture validation (validate-architecture.mjs)
pnpm type-check        # TypeScript check (tsc --noEmit)
pnpm lint              # ESLint check
pnpm test              # Vitest test suite
pnpm build             # Production Next.js build
```
