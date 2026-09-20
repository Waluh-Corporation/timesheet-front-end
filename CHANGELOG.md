# Changelog

All notable changes to the Timesheet Portal frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Password Reset Link Validation**: When opening a password reset link, the system immediately checks if the link is still valid. If it has expired or was already used, users receive a clear notification and a direct option to request a new link instead of filling out an invalid form.
- **Passkey Directory & Sync (Admin)**: Added an Authenticator Directory in Master Data. Administrators can search registered passkey providers (such as Bitwarden, Apple iCloud Keychain, Windows Hello, and YubiKey) and synchronize the list with the latest community registry at any time.
- **Passkey Renaming & Device Icons**: Users can now give custom nicknames to their registered passkeys from their profile page, view the official brand logo of the device or password manager used, or leave the name blank to automatically name it based on their device.

### Changed
- **Passkey Privacy & Security**: Passkeys are recognized strictly as private credentials managed only by the individual employee. Administrators can view registered credentials and device types, while credential modification and removal remain exclusively in the hands of the user.

---

## [0.5.1] - 2026-09-19

### Fixed
- **Responsive Sign Out**: Fixed an issue where signing out could occasionally freeze or become unresponsive in certain browsers and network setups. Signing out now completes instantly and reliably.

---

## [0.5.0] - 2026-09-19

### Added
- **Uninterrupted Sessions**: Improved session handling so users stay signed in seamlessly without unexpected logouts or interruptions while working.
- **Secure Sign Out**: Signing out now immediately ends the session across the entire system.
- **Comprehensive Employee Profile Management**: Administrators can easily view and update all employee details—such as company, division, department, work location, role, and active status—from an edit window.
- **Faster Activity History**: Filtering and browsing through past daily activities by year, month, or status is now significantly faster and more responsive.

### Changed
- **Accurate Department Filtering**: Filtering by division in master data now immediately shows only the relevant departments.
- **Performance & Platform Updates**: Updated underlying software libraries to deliver faster page loads and improved platform stability.

### Fixed
- **Code & Test Reliability**: Improved automated quality checks and eliminated redundant code for better app stability and fewer unexpected errors.

### Security
- **Enhanced Connection Security**: Enforced stricter security standards that protect data in transit against eavesdropping and unauthorized tampering.
- **Notification Protection**: Hardened reminder notifications to guarantee they only open safe, verified destinations within the portal.

---

## [0.4.0] - 2026-09-17

### Added
- **Fast Employee Onboarding**: Dedicated screen for administrators to easily register new employees with their organization, division, department, and account details.
- **Automatic Notification Clean-up**: Reminders are automatically cleaned up when logging out, ensuring notifications do not appear on shared computers.
- **Dynamic Organization Setup**: Creating or updating departments now automatically lists available company divisions.

### Changed
- **Lighter & Faster Timesheet Views**: Redesigned activity tables into a modern, responsive layout that loads quickly on both desktop and mobile devices.
- **Streamlined Dropdowns**: Improved company and approver selection lists across administrative menus.

### Fixed
- **Employee ID Formatting**: Enforced proper formatting rules for employee identifier numbers during profile updates.
- **Profile Update Accuracy**: Fixed profile synchronization issues when updating user details or changing passwords.

### Security
- **Strict Web Safety Standards**: Added protective browser security policies to shield users from cross-site scripts and data leakage.
- **Isolated Database Access**: Ensured database storage cannot be directly accessed from public networks.

---

## [0.3.0] - 2026-09-15

### Added
- **Optimized Production Packaging**: Packaged the application into a lightweight, high-performance container for fast loading and low resource usage.
- **Seamless Service Communication**: Integrated an internal connection router that allows the frontend and backend to communicate smoothly without cross-origin issues.
- **Automated Quality Testing**: Established automated security, code quality, and performance scans for every release.

---

## [0.2.0] - 2026-09-15

### Added
- **Master Data Management**: Centralized management for companies, departments, divisions, projects, and overtime approvers.
- **Employee Administration**: Searchable employee directory allowing administrators to manage roles and account access.
- **User Profile & Security Hub**: Dedicated profile page where employees can view their account status, track profile change requests, and manage passkeys.
- **Profile Change Approval Workflow**: Management screen for administrators to review, approve, or reject employee profile updates.
- **Self-Service Password Change**: Direct, guided password update screen with instant security requirements feedback.

### Changed
- **Smart Login Redirection**: Users who are already signed in are automatically redirected to their dashboard when visiting the login screen.

### Fixed
- **Reliable Session Storage**: Standardized how login sessions are securely remembered across browser refreshes.

---

## [0.1.0] - 2026-09-12

### Added
- **Passwordless Passkey Sign-In**: Sign in effortlessly using device biometrics (fingerprint, face recognition, or hardware key) alongside standard password login.
- **Employee Activity Dashboard**: Interactive dashboard displaying timesheet summaries, daily activity logs, and reminder settings.
- **Timesheet & Overtime Logging**: Easy-to-use forms for recording daily working activities, project tasks, and overtime requests.
- **Historical Timesheet Records**: Browse and inspect past timesheet records with flexible date filtering.
- **Role-Based Navigation**: Responsive, intuitive navigation tailored specifically for employees and administrators.

### Security
- **Protected Session Cookies**: Secured login credentials using browser-protected cookies to prevent unauthorized credential access.
