# Changelog

All notable changes to the Timesheet Portal frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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

---

## [0.6.2] - 2026-09-20

### Fixed
- **Seamless Passkey Device Recognition**: When adding a new passkey, your browser now automatically shares whether you are using device biometrics (such as Touch ID or Windows Hello) or an external key, ensuring hassle-free sign-in prompts when you log back in.

---

## [0.6.1] - 2026-09-20

### Changed
- **Unified Authenticator Brand Icons**: Streamlined authenticator and passkey icon rendering to support the latest unified brand icon format, ensuring device and password manager logos (such as Bitwarden, Apple iCloud Keychain, and Windows Hello) display seamlessly across dark and light themes.
