"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { VerifyResetTokenResponse } from "@/lib/types";

// Completes both the admin-invite setup flow and the forgot-password flow: both
// deliver a token in the query string that authorizes setting a new password.
function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { notify } = useToast();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<VerifyResetTokenResponse | null>(null);

  useEffect(() => {
    const rawToken = params.get("token") || "";
    setToken(rawToken);

    if (!rawToken) {
      setVerifying(false);
      setVerifyError("Missing reset token. Please use the complete link from your email.");
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const res = await api<VerifyResetTokenResponse>(
          `/api/v1/auth/reset-password/verify?token=${encodeURIComponent(rawToken)}`,
          { auth: false }
        );
        if (!isMounted) return;
        if (res && res.valid) {
          setTokenData(res);
          setVerifyError(null);
        } else {
          setVerifyError(res?.message || "This password reset token is invalid, expired, or has already been used.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setVerifyError(err.message || "This password reset token is invalid, expired, or has already been used.");
      } finally {
        if (isMounted) setVerifying(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      notify("Passwords do not match", "error");
      return;
    }
    setBusy(true);
    try {
      await api("/api/v1/auth/reset-password", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ token, password }),
      });
      notify("Password updated — please sign in.", "success");
      router.replace("/login");
    } catch (err: any) {
      notify(err.message || "Reset failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-16 w-16 place-items-center bg-mr-purple shadow-hard">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold">Set your password</h1>
          <p className="mt-1 text-sm text-mr-muted">Choose a strong new password.</p>
        </div>

        {verifying ? (
          <div className="card flex flex-col items-center justify-center gap-3 p-8 text-center">
            <Loader2 size={32} className="animate-spin text-mr-purple" />
            <p className="text-sm font-semibold">Verifying reset token...</p>
          </div>
        ) : verifyError ? (
          <div className="card flex flex-col gap-4 p-6">
            <div className="flex items-start gap-3 border-2 border-mr-ink bg-mr-dangerBg p-4 text-mr-dangerFg">
              <AlertTriangle className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold">Invalid or Expired Link</p>
                <p className="mt-1 text-xs opacity-90">{verifyError}</p>
              </div>
            </div>
            <p className="text-xs text-mr-muted">
              Password reset links can only be used once and expire after 1 hour. If your link has expired, you can request a new one.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/forgot-password" className="btn-primary flex-1 text-center text-sm">
                Request new link
              </Link>
              <Link href="/login" className="btn flex-1 border-2 border-mr-ink text-center text-sm">
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="card flex flex-col gap-4 p-6">
            {tokenData?.username && (
              <div className="flex items-center justify-between border-2 border-mr-ink bg-mr-surface2 px-4 py-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <UserCheck size={14} className="text-mr-purple" />
                  <span>Account: <strong className="text-mr-purple">{tokenData.username}</strong></span>
                </span>
                {tokenData.email && <span className="text-mr-muted">{tokenData.email}</span>}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold">New password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Confirm password</label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy || !token}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-mr-purple" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
