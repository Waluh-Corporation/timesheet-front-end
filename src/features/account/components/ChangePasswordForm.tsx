"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
  IconArrowLeft,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { changePassword } from "@/services/profileChange";
import { useToast } from "@/components/Toast";

export function ChangePasswordForm() {
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
    <div className="container-tight py-4">
      <div className="mb-4">
        <Link href="/profile" className="btn btn-outline-secondary d-inline-flex align-items-center gap-1 mb-3">
          <IconArrowLeft size={16} /> Back to Profile
        </Link>
        <h2 className="page-title">Change Password</h2>
        <div className="text-secondary small">Update your account password securely.</div>
      </div>

      <div className="card">
        <div className="card-header d-flex align-items-center gap-2">
          <span className="avatar avatar-sm bg-purple-lt text-purple">
            <IconLock size={18} />
          </span>
          <div>
            <h3 className="card-title mb-0">Password Security</h3>
            <div className="text-secondary small">Ensure your account uses a strong, unique password</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {/* Current Password */}
            <div className="mb-3">
              <label className="form-label required">Current Password</label>
              <div className="input-group input-group-flat">
                <input
                  type={showOld ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <span className="input-group-text">
                  <button
                    type="button"
                    className="link-secondary p-0 border-0 bg-transparent"
                    onClick={() => setShowOld(!showOld)}
                    title={showOld ? "Hide password" : "Show password"}
                  >
                    {showOld ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </span>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-3">
              <label className="form-label required">New Password</label>
              <div className="input-group input-group-flat">
                <input
                  type={showNew ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter new password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <span className="input-group-text">
                  <button
                    type="button"
                    className="link-secondary p-0 border-0 bg-transparent"
                    onClick={() => setShowNew(!showNew)}
                    title={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </span>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="mb-3">
              <label className="form-label required">Confirm New Password</label>
              <div className="input-group input-group-flat">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <span className="input-group-text">
                  <button
                    type="button"
                    className="link-secondary p-0 border-0 bg-transparent"
                    onClick={() => setShowConfirm(!showConfirm)}
                    title={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </span>
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="bg-light p-3 rounded small">
              <div className="fw-bold mb-2">Password Checklist:</div>
              <div className="d-flex align-items-center gap-2 mb-1">
                {hasMinLength ? (
                  <IconCircleCheck size={16} className="text-success" />
                ) : (
                  <IconAlertCircle size={16} className="text-secondary" />
                )}
                <span className={hasMinLength ? "text-success fw-medium" : "text-secondary"}>
                  Minimum 8 characters length
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-1">
                {passwordsMatch ? (
                  <IconCircleCheck size={16} className="text-success" />
                ) : (
                  <IconAlertCircle size={16} className="text-secondary" />
                )}
                <span className={passwordsMatch ? "text-success fw-medium" : "text-secondary"}>
                  New passwords match
                </span>
              </div>
              {oldPassword && newPassword && oldPassword === newPassword && (
                <div className="text-warning fw-medium mt-2">
                  ⚠️ New password cannot be identical to your current password.
                </div>
              )}
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end gap-2">
            <Link href="/profile" className="btn btn-link link-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="btn btn-primary d-inline-flex align-items-center gap-1"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Updating...
                </>
              ) : (
                <>
                  <IconShieldCheck size={16} />
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
