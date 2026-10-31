"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import {
  IconLayoutDashboard,
  IconUsers,
  IconLogout,
  IconCalendarCheck,
  IconUser,
  IconHistory,
  IconClock,
  IconDatabase,
  IconClipboardList,
  IconShieldCheck,
  IconX,
  type Icon as TablerIcon,
} from "@tabler/icons-react";
import { usePendingWitnessRequestsQuery } from "@/services/queries/useWitnessQueries";

interface NavItem {
  href: string;
  label: string;
  icon: TablerIcon;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const timesheetItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/activity", label: "Daily Activity", icon: IconCalendarCheck },
  { href: "/overtime", label: "Overtime", icon: IconClock },
  { href: "/historical-data", label: "Historical Data", icon: IconHistory },
];

const adminItems: NavItem[] = [
  { href: "/users", label: "Users", icon: IconUsers },
  { href: "/profile-changes", label: "Profile Changes", icon: IconClipboardList },
  { href: "/master-data", label: "Master Data", icon: IconDatabase },
];

export default function Shell({ children }: { readonly children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isWitnessEligible = Boolean(user && user.role !== "admin");
  const { data: pendingWitnessRequests } = usePendingWitnessRequestsQuery({
    enabled: isWitnessEligible,
  });
  const witnessCount = pendingWitnessRequests?.length || 0;

  const isAdmin =
    user?.role === "admin" ||
    user?.username === "admin" ||
    (user?.role !== "user" &&
      (pathname.startsWith("/users") ||
        pathname.startsWith("/profile-changes") ||
        pathname.startsWith("/master-data")));

  const userTimesheetItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
    { href: "/activity", label: "Daily Activity", icon: IconCalendarCheck },
    { href: "/overtime", label: "Overtime", icon: IconClock },
    { href: "/historical-data", label: "Historical Data", icon: IconHistory },
    {
      href: "/berita-acara/witness-requests",
      label: "Witness Requests",
      icon: IconShieldCheck,
      badge: witnessCount > 0 ? witnessCount : undefined,
    },
  ];

  const sections: NavSection[] = isAdmin
    ? [
        {
          title: "Administration",
          items: adminItems,
        },
        {
          title: "Account",
          items: [{ href: "/profile", label: "My Profile", icon: IconUser }],
        },
      ]
    : [
        {
          title: "Timesheet",
          items: userTimesheetItems,
        },
        {
          title: "Account",
          items: [{ href: "/profile", label: "My Profile", icon: IconUser }],
        },
      ];

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Close mobile drawer on click outside (excluding toggle button)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        (!mobileToggleRef.current || !mobileToggleRef.current.contains(target))
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const displayName = user?.name || user?.username || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="page min-vh-100 bg-body">
      {/* =========================================================================
          DESKTOP SIDEBAR: Always visible on screens >= 992px (lg)
          Fixed to the left with guaranteed visibility of all navigation items.
      ========================================================================= */}
      <aside
        className="d-none d-lg-flex flex-column position-fixed top-0 start-0 bottom-0 bg-body border-end shadow-sm"
        style={{ width: 250, zIndex: 1030 }}
      >
        {/* Brand Header */}
        <div className="p-3 border-bottom d-flex align-items-center">
          <Link
            href={isAdmin ? "/users" : "/dashboard"}
            className="d-flex align-items-center gap-2 text-decoration-none text-reset"
          >
            <span className="avatar bg-primary text-primary-fg rounded shadow-sm">
              <IconCalendarCheck size={22} />
            </span>
            <div className="d-flex flex-column text-start">
              <span className="fw-bold fs-3 leading-tight tracking-tight">Timesheet</span>
              <span className="text-secondary small fw-medium">Portal</span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-fill overflow-y-auto px-2 py-3">
          <ul className="navbar-nav w-100 list-unstyled mb-0">
            {sections.map((sec) => (
              <React.Fragment key={sec.title}>
                <li className="px-2 py-1 text-uppercase text-secondary fs-6 fw-bold mt-2 mb-1">
                  {sec.title}
                </li>
                {sec.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href} className="nav-item mb-1">
                      <Link
                        href={item.href}
                        className={`nav-link px-3 py-2 rounded d-flex align-items-center gap-2 text-decoration-none ${
                          active
                            ? "bg-primary-lt text-primary fw-bold"
                            : "text-body hover-bg-light"
                        }`}
                      >
                        <Icon size={18} className={active ? "text-primary" : "text-secondary"} />
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="badge bg-danger text-white rounded-pill ms-auto">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* Pinned Desktop Bottom Footer: User Details, Theme & Sign Out */}
        <div className="p-3 border-top mt-auto d-flex flex-column gap-2 bg-body">
          <div className="d-flex align-items-center justify-content-between p-2 rounded bg-body-tertiary">
            <Link
              href="/profile"
              className="d-flex align-items-center gap-2 min-w-0 text-decoration-none text-reset"
              title="View profile"
            >
              <span className="avatar avatar-sm bg-primary-subtle text-primary fw-bold rounded shadow-sm">
                {initial}
              </span>
              <div className="min-w-0">
                <div className="fw-semibold text-truncate small">{displayName}</div>
                <div className="text-secondary small text-capitalize fs-6">
                  {user?.role || "user"}
                </div>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <IconLogout size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE TOP NAVBAR: Visible ONLY on screens < 992px
          Includes toggler button, brand, theme toggle, and collapsible menu drawer.
      ========================================================================= */}
      <header className="navbar navbar-expand-lg d-lg-none sticky-top bg-body border-bottom shadow-sm">
        <div className="container-fluid px-3">
          <button
            ref={mobileToggleRef}
            className="navbar-toggler me-2 border-0 d-flex align-items-center justify-content-center p-1"
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <IconX size={20} /> : <span className="navbar-toggler-icon"></span>}
          </button>

          <Link
            href={isAdmin ? "/users" : "/dashboard"}
            className="navbar-brand d-flex align-items-center gap-2 text-decoration-none text-reset my-0 py-1 me-auto"
          >
            <span className="avatar avatar-sm bg-primary text-primary-fg rounded">
              <IconCalendarCheck size={18} />
            </span>
            <span className="fw-bold fs-3">Timesheet</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            <Link
              href="/profile"
              className="d-flex align-items-center text-decoration-none"
              title="My Profile"
              aria-label="My Profile"
            >
              <span className="avatar avatar-sm bg-primary-subtle text-primary fw-bold rounded">
                {initial}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            className="w-100 bg-body border-top shadow-lg px-3 py-3"
            style={{ maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}
          >
            <ul className="navbar-nav list-unstyled mb-0">
              {sections.map((sec) => (
                <React.Fragment key={sec.title}>
                  <li className="px-2 py-1 text-uppercase text-secondary fs-6 fw-bold mt-2 mb-1">
                    {sec.title}
                  </li>
                  {sec.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href} className="nav-item mb-1">
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`nav-link px-3 py-2 rounded d-flex align-items-center gap-2 text-decoration-none ${
                            active
                              ? "bg-primary-lt text-primary fw-bold"
                              : "text-body hover-bg-light"
                          }`}
                        >
                          <Icon size={18} className={active ? "text-primary" : "text-secondary"} />
                          <span>{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="badge bg-danger text-white rounded-pill ms-auto">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </React.Fragment>
              ))}

              <li className="nav-item border-top mt-3 pt-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                >
                  <IconLogout size={16} /> Sign out
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* =========================================================================
          MAIN PAGE CONTENT AREA:
          On desktop (lg+), offset by sidebar width (250px) using responsive style.
      ========================================================================= */}
      <div className="page-wrapper" style={{ minHeight: "100vh" }}>
        <main className="page-body">
          <div className="container-xl py-3 px-3 px-lg-4" style={{ maxWidth: 1200 }}>
            {children}
          </div>
        </main>
      </div>

      {/* Responsive layout styling: desktop offset for sidebar */}
      <style jsx global>{`
        @media (min-width: 992px) {
          .page-wrapper {
            margin-left: 250px !important;
          }
        }
        @media (max-width: 991.98px) {
          .page-wrapper {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
