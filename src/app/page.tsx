"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { fetchSetupStatus } from "@/services/setup";

// Landing route: bounce the visitor to the right place based on session & setup state.
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    async function checkAndRoute() {
      try {
        const setup = await fetchSetupStatus();
        if (setup && (setup.requires_setup || !setup.is_initialized)) {
          router.replace("/setup");
          return;
        }
      } catch (err) {
        console.error("Setup check error", err);
      }

      if (!user) {
        router.replace("/login");
      } else {
        router.replace(user.role === "admin" ? "/users" : "/dashboard");
      }
    }

    checkAndRoute();
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-mr-surface2 border-t-mr-purple" />
    </div>
  );
}
