# AI Agent Guidelines & Operating Instructions

This repository is **Timesheet Portal Frontend** (`timesheet-front-end`), a high-performance modern web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Bun**.

All AI agents (Antigravity, Copilot, Cursor, etc.) working on this repository MUST strictly follow the directives outlined in this document.

---

## 1. Git Workflow & Branching Discipline

Before creating branches, writing commits, or opening PRs, review [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md).

1. **Base Branch Rule**:
   - Every new feature (`feat/*`) or regular bugfix branch (`fix/*`) **MUST** be branched from the latest `development`:
     ```bash
     git checkout development && git pull origin development
     git checkout -b feat/<feature-name>
     ```
   - Only emergency production hotfixes (`hotfix/*` or `fix/critical-*`) are branched directly from `main`.
2. **PR Target Rule**:
   - Pull Requests for all new work (`feat/*`, `fix/*`) **MUST** target `development`.
   - Only release PRs (`release/vX.Y.Z` → `main`) or emergency hotfixes target `main`.
3. **Merge Strategy**:
   - All PRs (feature to `development` and release to `main`) **MUST** be merged using **"Create a merge commit" (`--no-ff`)** to preserve full atomic commit history and traceability.
4. **Commit & PR Conventions**:
   - Commit messages and PR titles must strictly follow [Conventional Commits](https://www.conventionalcommits.org/):
     ```
     feat(scope): short description in lowercase
     fix(scope): short description in lowercase
     refactor(scope): architectural improvements
     test(scope): unit/integration test additions
     chore(scope): build, CI/CD, or dependencies
     ```
   - Commits must be atomic. Do not bundle unrelated changes, refactorings, or formatting tweaks into a single commit.
5. **Changelog Maintenance & Retention Policy**:
   - Every user-facing feature, fix, or deprecation must update [`CHANGELOG.md`](CHANGELOG.md) under `## [Unreleased]` following [Keep a Changelog](https://keepachangelog.com/) in clear, consumer-facing English.
   - **5-Version Retention Limit**: [`CHANGELOG.md`](CHANGELOG.md) strictly maintains a rolling window of only the latest **5 released versions** plus the active `## [Unreleased]` section. Historical entries older than the 5 latest released versions must be pruned to maintain clarity, fast loading, and relevancy.

---

## 2. Architecture & Code Organization

The repository follows Next.js App Router structure with modular feature groupings:

```
src/
├── app/                        # Next.js App Router pages and route handlers
│   ├── (account)/              # Profile, passkeys, and password management
│   ├── (admin)/                # Admin consoles (users, master-data, profile-changes)
src/
├── app/                        # Next.js App Router thin route adapters & layouts
│   ├── (account)/              # Route adapters for profile & password management
│   ├── (admin)/                # Route adapters for admin consoles (users, master-data, profile-changes)
│   ├── (user)/                 # Route adapters for employee features (dashboard, activity, overtime, history)
│   ├── globals.css             # Theme tokens, Tabler CSS imports, and font variables
│   └── layout.tsx              # Root HTML shell, providers, and toast mounting
├── components/                 # Global layout & shared primitives (Shell, Toast, Guard, tabler/...)
├── features/                   # Feature-based domain modules
│   ├── account/                # Self-service profile, password change, passkeys
│   ├── activity/               # Daily activity logging & timesheet entries
│   ├── admin-master-data/      # Master data management (departments, divisions, sites, holidays, etc.)
│   ├── admin-profile-changes/  # Admin approval workflow for employee profile updates
│   ├── admin-users/            # User account provisioning & UU PDP compliance
│   ├── auth/                   # Authentication, passkey login, reset password
│   ├── dashboard/              # Employee monthly timesheet overview & quick actions
│   ├── historical-data/        # Historical activity records & filters
│   ├── overtime/               # Overtime tracking & approval flows
│   └── setup/                  # First-run administrator wizard
├── lib/                        # Core utilities and shared infrastructure
│   ├── api.ts                  # Central HTTP client with retry and refresh token rotation
│   ├── auth.tsx                # Authentication context, session checks, and login flows
│   ├── push.ts                 # WebPush subscription and service worker interaction
│   ├── theme.tsx               # Theme state manager (light/dark) synchronized with data-bs-theme
│   ├── types.ts                # TypeScript contract definitions and domain interfaces
│   └── webauthn.ts             # FIDO2 / WebAuthn passkey registration and assertion
└── services/                   # Shared business domain API clients (activityService, etc.)
```

### Architectural Rules:
- **Feature-Based Architecture**:
  - Keep domain logic, custom hooks, presentation components, and feature services co-located in `src/features/<feature>/`.
  - App Router files (`src/app/**/page.tsx`) must remain thin wrappers that render feature views.
- **Single Source of Truth for Types**:
  - Always maintain TypeScript interfaces in [`src/lib/types.ts`](src/lib/types.ts). Keep frontend contracts strictly synchronized with the backend Swagger/OpenAPI spec (`http://localhost:8080/swagger/doc.json`).
- **Centralized API Communication**:
  - All HTTP requests to backend endpoints must route through `api()` or `apiWithMeta()` from [`src/lib/api.ts`](src/lib/api.ts) to guarantee automatic JWT token injection, cookie-based session refreshes, and standardized error handling.
- **Role-Based Protection & Route Guards**:
  - Enforce access controls based on user role (`admin` vs `user`). Protect admin-only features and hide unauthorized navigation links.
- **UU PDP / Data Privacy Compliance**:
  - Check for anonymized accounts using `isUserAnonymized(user)`. Anonymized accounts must never be edited, reactivated, assigned companies, or re-anonymized in the UI.

---

## 3. Frontend Standards & Design Aesthetics

All frontend code in this repository must maintain the established design language and performance standards:

### 3.1. Tabler UI Design System
- **Core Architecture**:
  - Uses `@tabler/core` and `@tabler/icons-react` for a clean, accessible, enterprise dashboard aesthetic.
  - Native Tabler styling classes: `card`, `card-header`, `card-body`, `table table-vcenter card-table`, `badge`, `btn btn-primary`, `form-control`, `form-select`.
  - Pure React-controlled interactive components (modals, dropdowns, tabs) to avoid bootstrap.js DOM mutations conflicting with React 19 Virtual DOM and hydration.
- **Dark Mode Parity**:
  - Both `data-bs-theme="dark" | "light"` and `data-theme="dark" | "light"` are synchronized on `document.documentElement` by `ThemeProvider`.
  - Maintain WCAG AA contrast standards across all accent badges and action buttons.

### 3.2. Accessibility & Assistive Technology (WCAG AA)
- Form inputs must always have explicit association with their labels (`id` matching `htmlFor`).
- Interactive elements must be keyboard navigatable with visible `:focus-visible` outlines.
- Icon-only buttons must provide accessible labels via `aria-label` or `title`.

### 3.3. React 19 & Next.js 16 Idioms
- Clearly mark interactive components with `"use client"`. Keep parent layout components and purely presentational elements as Server Components when possible.
- Avoid unnecessary state re-renders; utilize memoization (`useCallback`, `useMemo`) for expensive computations and callbacks passed to child grids.
- Avoid inline function declarations inside loops when passing handlers to list items.

---

## 4. Pre-Commit Verification & Quality Gates

Before submitting any work, creating commits, or opening PRs, you **MUST** run and pass the following quality gates locally:

```bash
# 1. TypeScript Static Typecheck
bun run typecheck

# 2. Automated Test Suite (Isolated Environment)
bun test

# 3. Test Coverage Validation
bun run test:coverage

# 4. Production Static Build Verification
bun run build

# 5. Git Status & Security Cleanliness
git status
git diff --staged
```

### Non-Negotiable Test Rules:
- **Never bypass, delete, or comment out failing tests** to force a green build. Fix the underlying implementation or update test assertions to reflect intended contract updates.
- **Always accompany new services, helpers, or hooks with unit tests** (`*.test.ts` / `*.test.tsx`).
- **No Pre-Implementation Test Runs**: Do NOT run tests before starting feature implementation or bug fixing. Execute tests strictly during the post-implementation verification phase to avoid slow, redundant test executions.
- **SonarQube Standards**:
  - **Quality Profile (`Sonar way comprehensive`)**: The project enforces the **Sonar way comprehensive** profile for TypeScript/JavaScript, CSS, and HTML. All code must satisfy this profile: zero code smells, zero vulnerabilities, zero bugs, low cognitive complexity, and clean code hygiene.
  - **Quality Gate (`Sonar way`)**: New code must pass the **Sonar way** quality gate (0 new bugs, 0 new vulnerabilities, 0 security hotspots, >= 80% test coverage on new code, <= 3% duplication, and Maintainability Rating A).

---

## 5. Operational Safety & Behavioral Constraints

1. **Scope Discipline**:
   - Modify only the files strictly necessary to accomplish the user's objective.
   - Do not perform unsolicited refactorings, reformat entire directories, or touch unrelated pages.
2. **Preserve Documentation & Comments**:
   - Retain existing comments, docstrings, and architectural tags (`// ponytail: ...`).
3. **No Hardcoded Credentials or Secrets**:
   - Never commit API secrets, private keys, or passwords.
   - Environment variables must be loaded via `.env.local` or `.env.development` and guarded by `.gitignore`.
4. **English-Only Messages**:
   - All messages—including commit messages, PR descriptions, code comments, and UI labels/form fields—MUST strictly be in English.
5. **No Upfront Testing**:
   - Do NOT execute tests before beginning work or code changes; run tests only once after completing implementation to avoid redundant test cycles.
6. **SonarQube Compliance**:
   - Strictly adhere to the **Sonar way comprehensive** profile for TypeScript/JavaScript/HTML and fulfill the **Sonar way** quality gate on all new or modified code.
