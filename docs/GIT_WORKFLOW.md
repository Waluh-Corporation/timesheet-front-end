# Git Workflow & Versioning Standard Operating Procedure (SOP)

This document defines the standard Git workflow, branching strategy, commit conventions, and release procedures for the **Timesheet Portal Frontend** repository (`timesheet-front-end`). It is strictly synchronized with the backend development model to ensure consistency, end-to-end traceability, and safe, reliable CI/CD pipelines.

---

## 1. Branching Strategy & Roles

This repository employs a **Dual-Branch (Dual-Trunk)** workflow designed for production stability and rapid feature integration:

```
[main] ──────────────────────────●──────────────● (Tagged v0.7.1) ────────● (Tagged v0.8.0)
                                 │              ▲                         ▲
                                 │              │ (PR Merge)              │ (PR Merge)
                                 │              └──── [release/v0.7.1]    └─── [release/v0.8.0]
                                 │ (Auto-sync)                                 ▲
                                 ▼                                             │
[development] ───●───────────────●──────────────────●──────────────────────────┘
                  ╲                                ╱
                   ●─────────●────────────────────╱ (PR Merge)
                   [feat/berita-acara-and-user-anonymization]
```

### Primary Branches

| Branch | Description | Base / Source | Target Merge | CI/CD Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **`main`** | **Production**. Always production-ready and deployable. Never commit directly; changes arrive exclusively via reviewed release or hotfix PRs. All official releases are tagged here. | Initial | `release/v*.*.*` or `hotfix/*` | **Tag Push**: Builds and publishes production Docker image (`:vX.Y.Z` and `:latest`) to GHCR and generates GitHub Release. |
| **`development`** | **Active Integration & Staging**. The shared convergence branch where all new features and bugfixes land. Acts as the default base for development PRs. | `main` | `feat/*`, `fix/*`, `chore/*` | **Push/Merge**: Automatically builds and pushes staging Docker images (`development` and `dev-<short-sha>`). |
| **`feat/*` / `fix/*`** | Feature implementation or non-critical bug fixes. | **`development`** | **`development`** | **PR Open/Sync**: Triggers Gitleaks, TypeScript typecheck, Bun unit test suite with coverage, Next.js static build, and SonarQube analysis. |
| **`hotfix/*`** | Emergency production bug fixes. | **`main`** | **`main`** | **PR Open/Sync**: Triggers full CI verification; merge triggers tag release and automated sync PR back to `development`. |
| **`release/v*.*.*`** | Release preparation branch for version bumps and changelog curation. | **`development`** | **`main`** | **PR Open/Sync**: Triggers full CI verification. |

---

## 2. Complete Development Lifecycle (Step-by-Step)

### Phase 1: Starting a New Feature or Fix
Every new feature or bugfix MUST branch off the latest `development` branch.

```bash
# 1. Switch to development and pull the latest commits
git checkout development
git pull origin development

# 2. Create your working branch adhering to naming conventions
git checkout -b feat/<feature-name>
```

#### Branch Naming Conventions:
- `feat/<short-title>`: New features (e.g., `feat/berita-acara-witness`, `feat/profile-notes`)
- `fix/<short-title>`: Bug fixes (e.g., `fix/company-select-guard`, `fix/passkey-icon-theme`)
- `refactor/<short-title>`: Code refactoring without behavior change (e.g., `refactor/activity-service`)
- `chore/<short-title>`: Tooling, dependencies, or configuration updates (e.g., `chore/update-deps`)

---

### Phase 2: Local Development & Commits (Save Point Pattern)
Adhere to the **Atomic Commit** principle (one logical change per commit) and **Conventional Commits**.

```bash
# Verify modified files and ensure no credentials or .env are staged
git status
git diff

# Run local verification quality gates
bun run typecheck
bun test
bun run build

# Stage and commit with structured conventional message
git add <file1> <file2>
git commit -m "feat(activity): add berita acara toggle and witness select to daily modal"
```

#### Commit Message Format:
```
<type>(<scope>): <lowercase short description>

[optional body explaining the 'why', not the 'what']
```

#### Supported Commit Types:
- `feat`: A new user-facing or API feature (triggers **MINOR** bump)
- `fix`: A bug fix (triggers **PATCH** bump)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or correcting tests
- `docs`: Documentation updates only
- `style`: Code style, formatting, or semicolons without logic changes
- `perf`: Performance improvement
- `build`: Build system or dependency updates
- `ci`: GitHub Actions or CI pipeline adjustments
- `chore`: Tooling, maintenance, or release preparation

---

### Phase 3: Opening a Pull Request (PR) to `development`

1. **Push your branch to GitHub**:
   ```bash
   git push -u origin feat/<feature-name>
   ```

2. **Open PR in GitHub**:
   - **Base branch**: `development`
   - **Compare branch**: `feat/<feature-name>`
   - **Title**: Follows Conventional Commits (e.g., `feat(activity): integrate berita acara flow`), validated automatically by `semantic-pr.yml`.
   - **Description**: Provide clear context on what was added/fixed, intentionally untouched areas, and verification steps.

3. **Automated CI Quality Gates**:
   Every PR must pass automated CI checks prior to merging:
   - **Secret Leak Detection (Gitleaks)**: Scans commits for leaked secrets, API keys, or private tokens.
   - **Typecheck & Static Build**: Executes `bun run typecheck` and `bun run build` to verify type safety and static site generation.
   - **Automated Tests & Coverage**: Executes `bun test --isolate --coverage` to ensure zero test regressions.
   - **SonarQube Quality Gate**: Evaluates code duplication, maintainability, and code smells.
   - **Semantic PR Title**: Validates that the PR title strictly matches Conventional Commits format.

4. **Peer Review & Merge Strategy**:
   - Requires at least **1 approval** from another team member.
   - Once CI is green and approved, perform **"Create a merge commit" (`--no-ff`)** into `development` to preserve full atomic commit history.

---

### Phase 4: Staging Verification in `development`

When a PR merges into `development`:
1. GitHub Actions (`docker-publish.yml`) builds and pushes staging container images to GitHub Container Registry (GHCR):
   - `ghcr.io/waluh-corporation/timesheet-front-end:development`
   - `ghcr.io/waluh-corporation/timesheet-front-end:dev-<short-sha>`
2. The staging environment automatically deploys this image, allowing the team to verify integration with backend services before production release.

---

### Phase 5: Production Release & Tagging (`v*.*.*`)

Once features integrated into `development` are thoroughly validated and ready for production:

1. **Create a Release Branch from `development`**:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b release/vX.Y.Z
   ```

2. **Update Version and Changelog**:
   - Bump `"version": "X.Y.Z"` in [`package.json`](package.json).
   - Update [`CHANGELOG.md`](CHANGELOG.md) under `## [X.Y.Z] - YYYY-MM-DD` following [Keep a Changelog](https://keepachangelog.com/).
   - **Enforce 5-Version Retention Limit**: Maintain only the latest 5 released versions plus `## [Unreleased]`. Prune older entries.

3. **Commit & Open Release PR into `main`**:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore(release): prepare vX.Y.Z release notes"
   git push origin release/vX.Y.Z
   ```
   Open a PR targeting base `main` with head `release/vX.Y.Z`.

4. **Merge and Push Semantic Tag**:
   - Once CI passes and PR is approved, merge into `main` using **"Create a merge commit" (`--no-ff`)**.
   - Create and push the annotated tag:
     ```bash
     git checkout main
     git pull origin main
     git tag -a vX.Y.Z -m "Release version X.Y.Z"
     git push origin vX.Y.Z
     ```

5. **Automated Post-Tag Workflows**:
   - **Production Docker Image**: Builds and tags `ghcr.io/...:vX.Y.Z` and `ghcr.io/...:latest`.
   - **GitHub Release**: Automatically creates an official GitHub Release with release notes.
   - **Auto-Sync**: Workflow `sync-main-to-development.yml` automatically merges `main` back into `development` to keep staging in sync.

---

## 3. Semantic Versioning (SemVer) Reference

Version format: `vMAJOR.MINOR.PATCH` (e.g., `v0.8.0`)

| Bump Type | When to Use | Examples | Version Transition |
| :--- | :--- | :--- | :--- |
| **PATCH** (`x.y.Z`) | Backward-compatible bug fixes and styling adjustments. | Fixed WCAG contrast, corrected input label association, fixed tooltip z-index. | `v0.7.0` → `v0.7.1` |
| **MINOR** (`x.Y.0`) | Backward-compatible new features and additive functionality. | Added Berita Acara witness flow, copy previous day activity, UU PDP user anonymization. | `v0.7.1` → `v0.8.0` |
| **MAJOR** (`X.0.0`) | **Breaking changes** requiring upstream client or platform migrations. | Complete design system overhaul, dropping supported authentication protocols. | `v0.8.0` → `v1.0.0` |

---

## 4. Emergency Production Hotfixes

If a critical security vulnerability or blocking regression occurs in production:

```
main (v0.7.1) ───────────● (v0.7.2)
                  ╲       ╱
                   ●── hotfix ──●
```

1. Branch directly off `main`:
   ```bash
   git checkout main && git pull origin main
   git checkout -b hotfix/critical-security-patch
   ```
2. Implement the fix, run local verification gates, and push.
3. Open an urgent PR directly targeting `main`.
4. After review and green CI checks, merge to `main` with a merge commit and push the new patch tag (e.g., `v0.7.2`).
5. Workflow `sync-main-to-development.yml` will automatically detect the new commit on `main` and open a sync PR into `development`, ensuring staging never drifts behind production fixes.

---

## 5. Daily Git Command Cheat Sheet

```bash
# === STARTING WORK / NEW FEATURE ===
git checkout development
git pull origin development
git checkout -b feat/my-feature

# === DURING DEVELOPMENT ===
bun run typecheck                     # TypeScript static analysis
bun test                              # Run test suite locally
bun run build                         # Verify production static build
git status                            # Check changed files
git add <file>                        # Stage atomic changes
git commit -m "feat(scope): message"  # Commit with Conventional Commits

# === BEFORE CREATING A PR (SYNC WITH DEVELOPMENT) ===
git fetch origin
git rebase origin/development         # Keep branch linear and resolve conflicts early
git push -u origin feat/my-feature

# === RELEASING TO PRODUCTION ===
git checkout main
git pull origin main
git tag -a v0.8.0 -m "Release v0.8.0"
git push origin v0.8.0
```
