# Changelog

All notable changes to the Timesheet Frontend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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
