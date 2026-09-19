# Changelog

All notable changes to the Timesheet Frontend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.5.0] - 2026-09-19

### Added
- **Silent Token Refresh Interceptor**: Automatically recovers from expired access tokens on HTTP 401 errors using `POST /api/v1/auth/refresh` without disrupting the user session. Includes mutex queuing to prevent duplicate refresh calls during concurrent requests.
- **Server-Side Session Revocation on Logout**: Properly invalidates active server sessions and refresh tokens via `POST /api/v1/auth/logout` before clearing local client credentials.
- **Complete Admin User Editing**: Added comprehensive user editing modal (`/users`) supporting partial and full profile updates (`PATCH /api/v1/admin/users/:id`), including role, employee ID, BNI ID, company, division, department, site, and active status.
- **Activity Server-Side Pagination & Filtering**: Integrated full backend query filters (`year`, `month`, `start_date`, `end_date`, `status_id`, `sort`, `page`, `limit`) with pagination metadata on `GET /api/v1/activities`.
- **Automated Branch Synchronization Workflow**: Added `.github/workflows/sync-main-to-development.yml` to automatically merge `main` into `development` on release merges.

### Changed
- **Master Data Query Filter Alignment**: Aligned department lookup parameters (`GET /api/v1/departments`) with backend Swagger documentation (`division` and `division_id`), replacing legacy non-existent parameters.
- **Supply Chain & Lockfile Consolidation**: Removed competing `pnpm-lock.yaml` and `pnpm-workspace.yaml` files, consolidating the build and runtime package management entirely on Bun (`bun.lock`).
- **Next.js Framework Patch**: Upgraded Next.js to version `14.2.35` to include the latest security patches and stability improvements.

### Fixed
- **Code Duplication Elimination**: Refactored `api.ts` by extracting unified fetch and retry logic (`fetchWithRetry`), reducing duplicated code density to 0.0%.
- **Test Coverage Expansion**: Expanded isolated unit testing suite with comprehensive coverage for silent refresh, download utilities, and error edge cases, achieving 95.8% test coverage and 100% clean SonarCloud Quality Gate.

### Security
- **Strict-Transport-Security (HSTS)**: Configured HTTP Strict Transport Security (`max-age=31536000; includeSubDomains; preload`) in Nginx to prevent SSL-stripping attacks.
- **Content Security Policy (CSP) Tightening**: Restricted `connect-src` to `'self'`, blocking unauthorized external outbound connections from malicious scripts.
- **Nginx Security Header Inheritance**: Fixed Nginx configuration flaw where `add_header Cache-Control` on immutable and static assets inadvertently suppressed global security headers.
- **Service Worker Open Redirect Prevention**: Enforced strict relative URL validation on push notification clicks in `public/sw.js`, preventing arbitrary protocol or domain redirection.
- **Environment File Protection**: Hardened `.gitignore` to block all `.env*` variations while explicitly preserving `.env.example`.
- **Script Execution Isolation**: Added `--ignore-scripts` to dependency installation in CI workflows to protect against malicious package lifecycle scripts.

---

## [0.4.0] - 2026-09-17

### Added
- **New User Creation Workflow**: Dedicated administrator screen (`/users/new`) allowing rapid onboarding of employees with role assignments, departments, divisions, and email setup.
- **Automated Web Push Unsubscribe**: Integrated push notification clean-up during logout, ensuring notifications do not persist on shared workstations.
- **Dynamic Division Assignment**: Active divisions are now dynamically populated in department creation and edit forms to ensure relational data integrity.
- **Comprehensive Unit Testing Suite**: Standardized unit tests using Bun test runner with automated test coverage reporting and SonarCloud analysis in CI pipelines.

### Changed
- **Lightweight Native Grid Interface**: Replaced heavy third-party table libraries (Handsontable) with a lightweight, responsive native React accordion/grid layout, drastically reducing client bundle weight.
- **Framework Modernization**: Upgraded Next.js to version `14.2.35` for enhanced build performance and framework stability.
- **Master Data Endpoint Alignment**: Refactored approvers and company dropdowns across master data views to utilize dedicated administrative API endpoints.

### Fixed
- **Identifier Validation**: Enforced strict validation rules for MII and BNI ID fields during user profile and management operations.
- **Profile State Synchronization**: Fixed user profile and password change synchronization issues.
- **Static Export Compilation**: Resolved static page export and linting warnings during production builds.

### Security
- **HTTP Security Headers & CSP**: Added strict Content-Security-Policy (CSP), Permissions-Policy, and hidden server tokens in Nginx responses.
- **Static Asset Security Inheritance**: Fixed Nginx configuration flaw ensuring security headers (`nosniff`, `Referrer-Policy`) persist on cached static and JavaScript assets.
- **Database Network Isolation**: Restricted PostgreSQL port mapping to `127.0.0.1` (localhost) in Docker Compose, preventing direct exposure to public networks.
- **Automated Dependency Security Auditing**: Integrated automated dependency security checks in GitHub Actions CI workflows to detect vulnerable packages.

---

## [0.3.0] - 2026-09-15

### Added
- **Multi-Stage Docker Containerization**: High-performance, lightweight production container (~25MB) using Nginx Alpine to serve compiled Next.js static exports with automated Gzip compression and long-term asset caching.
- **Zero-CORS API Reverse Proxy**: Integrated reverse proxy configuration in Nginx routing all `/api/` requests directly to backend services within internal Docker networks, eliminating CORS issues and ensuring reliable cookie delivery.
- **Full-Stack Docker Compose Orchestration**: Unified `docker-compose.yml` orchestrating the frontend, Go backend API, and PostgreSQL 16 database with health check dependencies and bridge networking.
- **Automated CI/CD Quality Gates (`ci.yml`)**: Continuous integration workflow running Gitleaks secret leak detection, TypeScript type checking (`tsc --noEmit`), Next.js static build validation, SonarQube quality analysis, and Docker dry-run builds.
- **Container Vulnerability Scanning & GHCR Publishing (`docker-publish.yml`)**: Automated Docker image publishing to GitHub Container Registry (GHCR) on `development` merges and release tags, integrated with Trivy security vulnerability scanning and SARIF reporting.
- **Automated GitHub Releases & Changelog (`release.yml`)**: Automated GitHub Release generation on `v*.*.*` tags with release notes and Docker pull instructions.
- **Conventional PR Validation (`semantic-pr.yml`)**: Automated pull request title validation enforcing Conventional Commits standards.

---

## [0.2.0] - 2026-09-15

### Added
- **Master Data Administration**: Dedicated administration interfaces for managing companies, departments, divisions, projects, and approvers.
- **Admin User Management**: Comprehensive user administration interface featuring search, role filtering, user creation, and status management.
- **User Profile & Passkey Overview**: Profile screen (`/profile`) providing personal details, account overview, registered WebAuthn passkeys, and change request status tracking.
- **Admin Profile Change Review**: Dedicated management screen (`/profile-changes`) for administrators to inspect, approve, or reject employee profile change requests.
- **Self-Service Password Change**: Dedicated `/change-password` interface with validation rules and instant status feedback.

### Changed
- **Company Mapping Integrity**: Synchronized company ID, code, and display name across user management tables, creation forms, and profile dropdowns.
- **Session Auto-Redirect & Fallback**: Enabled automatic redirection for authenticated users on `/login` and added fallback retrieval from `/api/v1/me` if user details are omitted during login.

### Fixed
- **Build Resolution**: Fixed Next.js static build configuration and page export handling.
- **Standardized Auth Token Cookie**: Standardized authentication cookie storage key to `ts_auth_token` across all API wrappers.

---

## [0.1.0] - 2026-09-12

### Added
- **WebAuthn Passkey Authentication**: Biometric passwordless login with Conditional UI autofill alongside standard password authentication.
- **Employee Activity Dashboard**: Interactive dashboard featuring timesheet summaries, daily activity logging, and push notification controls.
- **Activity Tracking & Overtime**: Dedicated activity forms with handsontable grid inputs, project tagging, and overtime tracking.
- **Historical Timesheet Records**: Historical data viewing interface with multi-criteria filtering and tabular data inspection.
- **Role-Based Navigation Shell**: Responsive layout providing dynamic navigation bars and role-aware access controls for users and administrators.

### Security
- **Cookie-Based JWT Hardening**: Replaced `localStorage` token storage with `SameSite=Lax` secure HTTP cookies to mitigate XSS attack vectors.
