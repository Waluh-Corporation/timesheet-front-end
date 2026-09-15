"use client";

import { useCallback, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { registerPasskey } from "@/lib/webauthn";
import type { ProfileChangeRequest, Passkey } from "@/lib/types";

import { ProfileForm } from "./components/ProfileForm";
import { AccountOverview } from "./components/AccountOverview";
import { PasswordSection } from "./components/PasswordSection";
import { PasskeySection } from "./components/PasskeySection";
import { ChangeRequestsHistory } from "./components/ChangeRequestsHistory";

// Account page for any authenticated user (user OR admin): profile details
// (edits require admin approval), self-service passkey management, and password update.
export default function ProfilePage() {
  const { user } = useAuth();
  const { notify } = useToast();

  const [changes, setChanges] = useState<ProfileChangeRequest[]>([]);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [addingKey, setAddingKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ch, pk] = await Promise.all([
        api<ProfileChangeRequest[]>("/api/v1/profile/changes").catch(() => []),
        api<Passkey[]>("/api/v1/passkeys").catch(() => []),
      ]);
      setChanges(ch || []);
      setPasskeys(pk || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPasskey = async () => {
    setAddingKey(true);
    try {
      await registerPasskey(`${user?.username}'s device`);
      notify("Passkey added", "success");
      load();
    } catch (err: any) {
      notify(
        err?.name === "NotAllowedError"
          ? "Passkey setup was cancelled or timed out."
          : err.message || "Could not add passkey",
        "error"
      );
    } finally {
      setAddingKey(false);
    }
  };

  const removePasskey = async (pk: Passkey) => {
    if (!confirm(`Remove passkey "${pk.friendly_name || "Passkey"}"?`)) return;
    try {
      await api(`/api/v1/passkeys/${pk.id}`, { method: "DELETE" });
      notify("Passkey removed", "success");
      load();
    } catch (err: any) {
      notify(err.message || "Remove failed", "error");
    }
  };

  const hasPending = changes.some((c) => c.status === "pending");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center border-2 border-mr-ink bg-mr-yellow text-black">
          <UserRound size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">My Profile</h1>
          <p className="text-sm text-mr-muted">Manage your account credentials, passkeys, and profile details.</p>
        </div>
      </div>

      <AccountOverview />
      <PasswordSection />
      <PasskeySection 
        passkeys={passkeys} 
        loading={loading} 
        addingKey={addingKey} 
        addPasskey={addPasskey} 
        removePasskey={removePasskey} 
      />
      <ProfileForm hasPending={hasPending} onSuccess={load} />
      <ChangeRequestsHistory changes={changes} loading={loading} />
    </div>
  );
}
