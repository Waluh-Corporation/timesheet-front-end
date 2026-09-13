"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { changePassword } from "@/services/profileChange";
import { useToast } from "@/components/Toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { notify } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isDifferent = oldPassword.length > 0 && newPassword.length > 0 && oldPassword !== newPassword;
  const isValid = hasMinLength && passwordsMatch && oldPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength) {
      notify("New password must be at least 8 characters long", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("New passwords do not match", "error");
      return;
    }
    if (oldPassword === newPassword) {
      notify("New password must be different from current password", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      notify(res.message || "Password changed successfully", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch (err: any) {
      notify(err.message || "Failed to change password", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="grid h-10 w-10 place-items-center border-2 border-mr-ink bg-mr-surface text-mr-ink hover:bg-mr-surface2 transition"
          title="Back to Profile"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">Change Password</h1>
          <p className="text-sm text-mr-muted">Update your account password securely.</p>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-mr-ink pb-4">
          <div className="grid h-10 w-10 place-items-center bg-mr-purple text-white shadow-hard-sm">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="font-bold text-base">Password Security</h2>
            <p className="text-xs text-mr-muted">Ensure your account uses a strong, unique password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Current Password */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mr-ink">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                className="input pr-10"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mr-muted hover:text-mr-ink"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mr-ink">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="input pr-10"
                placeholder="Enter new password (min. 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mr-muted hover:text-mr-ink"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-mr-ink">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="input pr-10"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mr-muted hover:text-mr-ink"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="rounded border-2 border-mr-ink bg-mr-surface2 p-3 text-xs flex flex-col gap-1.5">
            <p className="font-bold text-mr-ink">Password Checklist:</p>
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-mr-muted shrink-0" />
              )}
              <span className={hasMinLength ? "text-emerald-700 font-medium" : "text-mr-muted"}>
                Minimum 8 characters length
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordsMatch ? (
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-mr-muted shrink-0" />
              )}
              <span className={passwordsMatch ? "text-emerald-700 font-medium" : "text-mr-muted"}>
                New passwords match
              </span>
            </div>
            {oldPassword && newPassword && oldPassword === newPassword && (
              <p className="text-amber-700 font-medium mt-1">
                ⚠️ New password cannot be the same as your current password.
              </p>
            )}
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Link href="/profile" className="btn-ghost text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
