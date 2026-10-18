"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconLoader2,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import type { VerifyResetTokenResponse } from "@/lib/types";
import { verifyResetToken, submitPasswordReset } from "../services/authService";

export default function ResetPasswordForm() {
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
        const res = await verifyResetToken(rawToken);
        if (!isMounted) return;
        if (res && res.valid) {
          setTokenData(res);
          setVerifyError(null);
        } else {
          setVerifyError(
            res?.message || "This password reset token is invalid, expired, or has already been used."
          );
        }
      } catch (err: any) {
        if (!isMounted) return;
        setVerifyError(
          err.message || "This password reset token is invalid, expired, or has already been used."
        );
      } finally {
        if (isMounted) setVerifying(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      notify("Passwords do not match", "error");
      return;
    }
    setBusy(true);
    try {
      await submitPasswordReset(token, password);
      notify("Password updated — please sign in.", "success");
      router.replace("/login");
    } catch (err: any) {
      notify(err.message || "Reset failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page page-center min-vh-100 d-flex flex-column justify-content-center py-4">
      <div className="container container-tight">
        <div className="text-center mb-4">
          <div className="avatar bg-primary text-primary-fg rounded mb-2" style={{ width: 48, height: 48 }}>
            <IconShieldCheck size={26} />
          </div>
          <h1 className="h2 mb-1 fw-bold">Set your password</h1>
          <p className="text-secondary small">Choose a strong new password</p>
        </div>

        {verifying ? (
          <div className="card card-md p-4 text-center">
            <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
              <IconLoader2 size={32} className="animate-spin text-primary mb-3" />
              <p className="text-secondary small mb-0">Verifying reset token...</p>
            </div>
          </div>
        ) : verifyError ? (
          <div className="card card-md shadow-sm">
            <div className="card-body">
              <div className="alert alert-danger d-flex align-items-start mb-3" role="alert">
                <IconAlertTriangle size={20} className="me-2 shrink-0 mt-1" />
                <div>
                  <h4 className="alert-title mb-1">Invalid or Expired Link</h4>
                  <div className="text-secondary small">{verifyError}</div>
                </div>
              </div>
              <p className="text-secondary small mb-3">
                Password reset links can only be used once and expire after 1 hour. If your link has expired, you can request a new one.
              </p>
              <div className="d-flex gap-2">
                <Link href="/login" className="btn btn-outline-secondary w-100">
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card card-md shadow-sm">
            <form onSubmit={handleSubmit} className="card-body">
              {tokenData?.username && (
                <div className="alert alert-info d-flex align-items-center justify-content-between p-2 mb-3">
                  <span className="d-flex align-items-center gap-1 small">
                    <IconUserCheck size={16} className="text-primary me-1" />
                    <span>Account: <strong>{tokenData.username}</strong></span>
                  </span>
                  {tokenData.email && <span className="small text-secondary">{tokenData.email}</span>}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label required">New password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label required">Confirm password</label>
                <input
                  className="form-control"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              <div className="form-footer mt-4">
                <button type="submit" className="btn btn-primary w-100" disabled={busy || !token}>
                  {busy && <IconLoader2 size={18} className="animate-spin me-2" />}
                  Update password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
