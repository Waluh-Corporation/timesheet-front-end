# Changelog

All notable changes to the Timesheet Portal frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.10.0] - 2026-10-31

### Fixed
- **SonarCloud Reliability & Accessibility Standards Compliance**:
  - Resolved 3 reliability bugs (`typescript:S9383`) by explicitly handling floating promises using the `void` operator in `MonthlyWitnessCard.tsx` and `VerifyClient.tsx`.
  - Resolved 4 accessibility code smells (`typescript:S6853`) across `SignatureSection.tsx` and `ActivitiesTable.tsx` by replacing non-standard `<label>` wrappers with semantic `<span>` styling and ensuring explicit `htmlFor`/`id` association on radio controls.
  - Resolved CSS import ordering bug (`css:S8778`) by ensuring all `@import` and `@config` directives precede style declarations in `src/app/globals.css`.

### Added
- **Dynamic Push Reminder Schedule Integration**: Integrated dynamic reminder schedule endpoint (`GET /api/v1/push/schedule`) via `getPushSchedule` and `usePushScheduleQuery`. Replaced static hardcoded reminder labels with dynamic hour/minute formatting and server-configured timezone in Card 3 of `DashboardHeader`, including disabled state handling and human-readable hover tooltips.
- **Timesheet Digital Signing & Revocation Controls**:
  - Added dedicated timesheet sign-off and signature revocation action buttons (`Sign Timesheet` and `Revoke Timesheet Signature`) to the dashboard header, enabling employees to digitally lock their timesheet or unlock it if changes are necessary.
- **Witness Request Cancellation & Signature Revocation**:
  - Added direct action buttons to `MonthlyWitnessCard` and `UnsignedBeritaAcaraModal`:
    - `Cancel Witness Request`: Allows employees to cancel pending witness review requests when status is `pending_witness` or `submitted`.
    - `Revoke Signature`: Allows employees to revoke approved/signed Berita Acara signatures and return them to draft when revisions are needed.
- **TanStack Query v5 & Zustand Client Architecture**:
  - Integrated **Zustand** store (`useTimesheetStore`) managing active month, year, page, and rows-per-page limit.
  - Implemented **TanStack Query v5** hooks (`useActivities`, `useAssignMonthlyWitness`, `useGenerateTimesheet`) with `placeholderData: keepPreviousData` preventing layout flicker during pagination and caching active queries.
- **TanStack Table v8 Server-Side Pagination**:
  - Added `ActivitiesTable` with `manualPagination: true` consuming standard backend envelope `response.pagination` (`page`, `limit`, `total_rows`, `total_pages`).
  - Implemented accessible range counter (`Showing X to Y of Z results`), rows-per-page selector (`10`, `25`, `50`, `100`), smart page pills with ellipsis, and bi-directional URL query sync (`?page=X&limit=Y`).
- **UI/UX Pro Max Monthly Witness Designation Card**:
  - Added `MonthlyWitnessCard` with WCAG 2.2 AA contrast, responsive layout, unassigned amber callout, and locked witness badge (`Locked Witness for [Month] [Year]`) with touch targets $\ge 44\times 44\text{px}$.
- **Public Verification Portal & Fingerprint Normalization**:
  - Standardized public verification routes (`/verify/{token}` and `/verify/doc/{token}`) with English-only UI, dynamic `APP_NAME` branding (no hardcoded organization names), uppercase SHA-256 hash formatting, and timezone-aware timestamps (`formatLocalTimestamp`).
- **Domain Labeling Standardization**:
  - Formally labeled attendance incident documents as **"Berita Acara - Attendance Incident Report"** (distinguished from overtime/SPL) across all tables, cards, dialogs, and verification views.
- **Interactive Typed Digital Signature**: Added tabbed signature creation on `/profile` with a **"Ketik Nama" (Type Name)** mode supporting cursive web fonts (*Caveat*, *Dancing Script*, *Great Vibes*), rendered to a 2x Retina transparent HTML5 canvas and uploaded via `POST /api/v1/user/signature` alongside freehand drawing and image upload tabs.
- **Berita Acara Witness Signature Guard on Generation**: Integrated backend validation guard for monthly timesheet generation (`POST /api/v1/timesheet/generate`), surfacing status alerts when Berita Acara entries are unsubmitted, awaiting witness sign-off, or rejected with revision notes:
  - Added dynamic status banners and quick **"Ajukan ke Saksi"** action on the dashboard utilizing optional `witness_id` in `SubmitBeritaAcaraRequest`.
  - Added **"Batalkan Permintaan"** and **"Revoke Tanda Tangan"** actions on the dashboard for Berita Acara submissions (`POST /api/v1/berita-acara/:id/revoke`) and signed timesheets (`POST /api/v1/timesheets/revoke`), allowing employees to unlock daily activity mutations if revisions are required.
  - Added error response handling on "Generate" preventing timesheet creation if Berita Acara is not yet `signed`.
- **Witness Requests Navigation & Review**: Added dedicated review route `/berita-acara/witness-requests` and `WitnessReviewModal` with responsive badge notifications on the sidebar navigation and dashboard header, allowing designated witnesses to approve or reject submissions with revision notes.
- **API Contracts Integration (Swagger Sync)**: Synchronized frontend domain contracts and API client services with backend OpenAPI specification (`/swagger/doc.json`):
  - **Timesheet Sign-off Lifecycle**: Added `getTimesheetStatus`, `signTimesheet`, `revokeTimesheet`, and `getTimesheetDownloadUrl` in `timesheetService`.
  - **Berita Acara E-Sign & Witness Review Workflow**: Added `beritaAcaraService` supporting `getBeritaAcaraStatus`, `submitBeritaAcara` (with optional `witness_id`), `getPendingWitnessRequests`, `revokeBeritaAcara`, and `witnessAction`.
  - **User Digital Signature Management**: Added `signatureService` supporting `getUserSignature`, `uploadUserSignature` (Base64 PNG/JPEG), and `deleteUserSignature`.
  - **Public Document Verification**: Added `verifyService` and public verification route `/verify/doc/[token]` with Tabler UI layout for verifying document authenticity, signature timestamp, and cryptographic SHA-256 audit hash.
  - **Domain Model Relations**: Expanded `User`, `Company`, `Department`, `Division`, `Site`, `Project`, `Approver`, and `ProfileChangeRequest` with relational model links and audit timestamps.

### Changed
- **Quick Action Cards Visual Symmetrization**: Harmonized Card 3 (Daily Reminders) in `DashboardHeader.tsx` with a symmetrical 22px avatar box matching Cards 1, 2, and 4. Represented reminder status cleanly via dynamic bell icons (`IconBellRinging` with `bg-yellow-lt` when enabled, `IconBellCancel` with `bg-secondary-lt` when disabled) without redundant badges or clutter.
- **Backend API Load Optimization & TanStack Query Migration**:
  - Migrated data fetching across `Shell`, `DashboardView` (`useDashboardData`), `ActivityDetail` (`useActivityData`), and Witness Requests page to TanStack Query v5.
  - Implemented tiered caching with automatic deduplication across parallel components:
    - Master Data (`projects`, `activity-statuses`, `eligible-witnesses`, `holidays`): 5-minute `staleTime` (`300000ms`).
    - Transactional & Status Data (`activities`, `berita-acara-status`, `timesheet-status`, `witness-requests`): 1-minute `staleTime` (`60000ms`).
  - Eliminated repetitive `getPendingWitnessRequests()` API hits triggered on every client-side page navigation in `Shell.tsx`.
  - Resolved duplicate concurrent `fetchProjects()` calls on mount in `useActivityData.ts`.
  - Added targeted cache invalidations (`queryClient.invalidateQueries`) across Berita Acara submissions/revocations, Timesheet signing/revocations, activity creations/edits, and witness approvals/rejections.
- **Witness Action Controls & Card Button Proportion Tuning**:
  - Sized down action buttons in `MonthlyWitnessCard` (`Cancel Witness Request`, `Revoke BA Signature`, `Submit to Witness`, `Change Witness`) to compact `btn-sm`, removed unnecessary 44px min-height constraints, and harmonized `Witness Locked` badge padding for balanced alignment.
  - Simplified witness rejection action button label and notes prompt on `/berita-acara/witness-requests` to "Reject".
- **Dashboard Witness & Incident Report UX Streamlining**:
  - Removed duplicate monthly witness section embedded inside `MonthlyGrid`, eliminating redundant stacked witness cards.
  - Removed redundant "Saksi BA" button next to "Today's Activity" in `DashboardHeader` in favor of centralized monthly card interactions.
  - Re-anchored Card 1 in the quick action grid as a permanent, consistent **"Generate Timesheet"** card (showing `Locked: Butuh Saksi` indicator and tooltip when unsigned incident reports exist), maintaining symmetry across all 4 dashboard action cards.
  - Consolidated monthly witness identity, lock states, incident report count badges (`Laporan Menunggu Pengajuan`, `Menunggu Saksi`, `Ditolak Saksi`, `Telah Ditandatangani`), and the direct `[Ajukan ke Saksi]` action into a unified **`MonthlyWitnessCard`** as the single source of truth.
- **Dynamic Generate Metric Card & Berita Acara Integration**:
  - Replaced the top Berita Acara notification banners with a dynamic, context-aware "Generate" action card on the dashboard that transitions seamlessly through BA states: **"Ajukan ke Saksi"** (draft), **"Menunggu Saksi"** (pending approval), **"Ditolak Saksi"** (review revisions), and clean **"Generate"** once witness verification is completed.
  - Centralized Berita Acara signature revocation, pending cancellation, and rejection review into the **Monthly Witness Modal** via the header action.
  - Removed redundant top banner for inbound witness review requests in favor of the persistent header notification button.
- **Daily Activity Form Simplification**: Removed redundant per-activity "Saksi Berita Acara (Rekan Kerja)" select dropdown on `/activity` in favor of centralized monthly witness assignment and sign-off locking.
- **Previous Activity Copying (Attendance Time Reset)**: Updated `copyPreviousDay` on `/activity` to leave `start_time` and `end_time` empty for accurate daily attendance tracking while autofilling task description, project reference, status, and Berita Acara notes from `GET /api/v1/activities/previous`.

### Removed
- **Standalone Sign/Revoke Timesheet Button in Header**: Removed the standalone `Sign Timesheet` and `Revoke Timesheet Signature` action button from `DashboardHeader.tsx` to keep the header focused exclusively on `+ Today's Activity` and prevent duplicate controls alongside the Generate Timesheet quick action card.
- **Redundant Timesheet Status Banner & Duplicate Action Buttons**: Removed duplicate top "Timesheet Signed & Locked" alert banner in `DashboardView.tsx` in favor of Card 1 indicators. Hidden Berita Acara revocation buttons on `MonthlyWitnessCard` when timesheet is signed, and clearly labeled them as "Revoke BA Signature" when in draft to avoid action ambiguity.
- **Redundant Error Banner**: Removed `ErrorSummaryAlert` banner from the dashboard in favor of the interactive `UnsignedBeritaAcaraModal` modal and centralized witness card indicators.

## [0.9.0] - 2026-10-19

### Added
- **Tabler UI System Overhaul**: Completely overhauled the frontend design system using `@tabler/core` and `@tabler/icons-react` for a modern, highly accessible enterprise dashboard experience across all pages.
- **Feature-Based Architecture**: Refactored the entire application into self-contained feature modules under `src/features/` (`auth`, `setup`, `dashboard`, `activity`, `overtime`, `historical-data`, `account`, `admin-users`, `admin-master-data`, `admin-profile-changes`), turning App Router pages into thin route adapters.
- **Tabler Reusable UI Primitives**: Introduced `PageHeader` and pure React-controlled `Modal` in `src/components/tabler/` with smooth backdrop transitions, scrollable modal dialogs (`modal-dialog-scrollable`), and keyboard accessibility.
- **Full Sidebar Navigation Suite**: Restored and organized all application menus into structured sidebar sections (`Timesheet`, `Administration` including `/users`, `/profile-changes`, `/master-data`, and `Account`) with role-aware visibility and seamless mobile drawer toggling.

### Changed
- **Navigation & Layout Shell**: Migrated navigation to native Tabler vertical sidebar layout with strict role segregation: administrators see `Administration` and `Account` sections, while standard employees see `Timesheet` and `Account` sections.
- **Master Data Tab Navigation**: Resolved tab squashing/clipping on `/master-data` by switching to Tabler's `nav nav-bordered` navigation bar with smooth horizontal scrolling for departments, divisions, sites, companies, approvers, holidays, and authenticators.
- **Mobile Responsiveness & Viewport Hardening**: Fixed mobile navbar toggle closure by excluding toggle ref from click-outside listener, removed redundant avatar dropdown overlay from top bar, constrained viewport widths, and enabled smooth touch scrolling.
- **Passkey Aesthetic**: Cleaned up the Passkeys section by removing circular avatar badges in favor of crisp, direct authenticator branding and icon presentation.
- **Admin Profile Customization**: Hid employee-specific "Profile Details" (change request form) and "Change Requests History" for administrator accounts on `/profile`.
- **User Management Company Assignment**: Expanded the Company column width to display full company names without truncation (`min-width: 320px`), and locked the company selection dropdown for the administrator's own account.
- **User Actions & Modal Simplification**: Added dedicated reactivation action button in the table Actions column for deactivated accounts, and removed redundant "Account Active" switch from the Edit User modal.
- **Theme Engine**: Synchronized dark mode switching across both `data-bs-theme` and `data-theme` attributes on `document.documentElement` for seamless light/dark mode parity.

### Removed
- **Legacy Neobrutalist Components**: Pruned obsolete legacy files (`DailyModal.tsx`, `HotGrid.tsx`) and deprecated custom neobrutalist borders in favor of the Tabler design system.

---

## [0.8.0] - 2026-10-17

### Added
- **Berita Acara & Witness Assignment**: Added support for Berita Acara tracking on daily activity entries, including mandatory notes and witness selection from eligible coworkers (`GET /api/v1/users/witnesses`).
- **Monthly Witness Bulk Configuration**: Added `MonthlyWitnessModal` accessible directly from the dashboard header quick action, enabling users to view and update the designated witness for all Berita Acara entries in a given month (`PUT /api/v1/activities/witness`).
- **Copy Previous Day Activity**: Added quick autofill button ("Salin Kemarin") in both modal and detailed activity views to duplicate working hours, project, and status from the previous business day (`GET /api/v1/activities/previous`).
- **User Anonymization & UU PDP Compliance**: Added admin workflow to permanently anonymize user personal data in compliance with personal data protection laws (`POST /api/v1/admin/users/:id/anonymize`), complete with a typed confirmation safety modal.
- **Git Workflow SOP**: Added comprehensive standard operating procedure documentation in `docs/GIT_WORKFLOW.md` detailing the Dual-Branch GitFlow model, Conventional Commits, local quality gates, and release lifecycle.

### Changed
- **Adaptive Timesheet Archive Downloader**: Automatically detects whether generated export files include Berita Acara documents (downloaded as `.zip` containing both XLSX and DOCX) or standalone timesheet spreadsheets (`.xlsx`), preserving correct file types and clear button descriptions.
- **Explicit Anonymization API Contract**: Adopted the backend's explicit `is_anonymized` boolean attribute in `User` entities and client-side guards, retaining heuristic fallbacks for full backward compatibility.

### Fixed
- **Anonymized Account Restrictions**: Hardened administrative UI controls to prevent unauthorized modifications on anonymized accounts, disabling company reassignments, account reactivation, user profile editing, and passkey views.

---

## [0.7.1] - 2026-09-27

### Fixed
- **Dark Mode Theme Synchronization & Tailwind v4 Custom Variant**: Added an explicit `@custom-variant dark` definition to reliably trigger dark utilities on both `[data-theme="dark"]` and `.dark` class selectors without depending on OS-level color scheme preferences.
- **Neobrutalism Shadow & Border Decoupling**: Separated box shadow tokens from foreground ink/border colors, ensuring hard offset shadows remain black (`#000000`) in dark mode to preserve physical depth instead of melting into opaque white border blocks.
- **WCAG AA Contrast Parity**: Fixed text and icon contrast on accent colored surfaces (`mr-yellow`, `mr-cyan`, and `mr-purple`), ensuring dark text on bright surfaces and high-contrast text on purple elements across navigation tabs, status chips, and action buttons.
- **Adaptive Authenticator & Passkey Brand Icons**: Dynamically select `icon_dark` over `icon_light` when dark mode is enabled across passkey lists and authenticator directory tables.
- **Native Form Theming**: Added `color-scheme` properties for light and dark themes to ensure browser-native date pickers, dropdown lists, and inputs render in their appropriate color scheme.
- **Cleaned Component Styles**: Replaced undefined utility classes (`mr-coral`, `mr-black`, `shadow-mr-sm`) and hardcoded white backgrounds in tables and modals with consistent design tokens.

---

## [0.7.0] - 2026-09-26

### Added
- **Background Timesheet Processing & Job Tracking**: Added an asynchronous jobs tracking modal accessible from the dashboard header, enabling users to monitor timesheet generation and export tasks with real-time status indicators and error logging.
- **Enhanced Profile Change Requests**: Added support for additional employee information fields in profile change requests, including personal notes, contact email, division, and work site selection.
- **Enriched Holiday Classification**: Expanded the holiday directory to distinguish between civic and religious holidays for accurate holiday calendar management.

### Fixed
- **Form Accessibility**: Associated all profile form labels directly with their corresponding input controls using explicit identifiers, ensuring full compatibility with screen readers and assistive technology.
