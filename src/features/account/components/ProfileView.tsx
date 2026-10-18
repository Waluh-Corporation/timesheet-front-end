"use client";

import { useCallback, useEffect, useState } from "react";
import { IconUser } from "@tabler/icons-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { registerPasskey } from "@/lib/webauthn";
import type { ProfileChangeRequest, Passkey } from "@/lib/types";
import { PageHeader } from "@/components/tabler";

import { ProfileForm } from "./ProfileForm";
import { AccountOverview } from "./AccountOverview";
import { PasswordSection } from "./PasswordSection";
import { PasskeySection } from "./PasskeySection";
import { ChangeRequestsHistory } from "./ChangeRequestsHistory";

export function ProfileView() {
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

  const addPasskey = async (name?: string) => {
    setAddingKey(true);
    try {
      await registerPasskey(name);
      notify("Passkey added successfully", "success");
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

  const renamePasskey = async (pk: Passkey, newName: string) => {
    try {
      await api(`/api/v1/passkeys/${pk.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      });
      notify("Passkey renamed", "success");
      load();
    } catch (err: any) {
      notify(err.message || "Rename failed", "error");
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
    <div>
      <PageHeader
        pretitle="Account Settings"
        title="My Profile"
        description="Manage your account credentials, passkeys, and profile details."
      />

      <div className="d-flex flex-column gap-3">
        <AccountOverview />
        <PasswordSection />
        <PasskeySection
          passkeys={passkeys}
          loading={loading}
          addingKey={addingKey}
          addPasskey={addPasskey}
          renamePasskey={renamePasskey}
          removePasskey={removePasskey}
        />
        {user?.role !== "admin" && (
          <>
            <ProfileForm hasPending={hasPending} onSuccess={load} />
            <ChangeRequestsHistory changes={changes} loading={loading} />
          </>
        )}
      </div>
    </div>
  );
}
