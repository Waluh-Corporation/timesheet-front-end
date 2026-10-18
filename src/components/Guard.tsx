"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

// Guard gates a page behind authentication and (optionally) a required role.
// It renders a friendly loading state while the session resolves and redirects
// unauthenticated or unauthorized users away.
export default function Guard({
  role,
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (role && user.role !== role) {
      router.replace(user.role === "admin" ? "/users" : "/dashboard");
    }
  }, [user, loading, role, router]);

  if (loading || !user || (role && user.role !== role)) {
    return (
      <div className="page page-center min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container container-tight py-4 text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary small mb-0">Loading your portal…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
