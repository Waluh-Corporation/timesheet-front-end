"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  UserRound,
  Clock,
  KeyRound,
  Plus,
  Trash2,
  Fingerprint,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { registerPasskey, passkeysSupported } from "@/lib/webauthn";
import type {
  ProfileChangeRequest,
  Passkey,
  Company,
  Department,
  ProfileChangeRequestDTO,
} from "@/lib/types";
import { fetchCompanies, fetchDepartments } from "@/services/masterData";
import { changePassword, submitProfileChange } from "@/services/profileChange";

// Account page for any authenticated user (user OR admin): profile details
// (edits require admin approval), self-service passkey management, and password update.
export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { notify } = useToast();

  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    bni_id: "",
    division: "",
    site: "",
    company_id: 0,
    department_id: 0,
    department: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [changes, setChanges] = useState<ProfileChangeRequest[]>([]);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [saving, setSaving] = useState(false);
  const [addingKey, setAddingKey] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quick Password Change modal / accordion state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const matchedCompany = companies.find(
        (c) =>
          (user.company_id && c.id === user.company_id) ||
          (user.company && c.name?.toLowerCase() === user.company.toLowerCase()) ||
          (user.company && c.code?.toLowerCase() === user.company.toLowerCase())
      );
      setForm({
        name: user.name || "",
        employee_id: user.employee_id || user.mii_id || "",
        bni_id: user.bni_id || "",
        division: user.division || "",
        site: user.site || "",
        company_id: matchedCompany ? matchedCompany.id : user.company_id || 0,
        department_id: user.department_id || 0,
        department: user.department || "",
      });
    }
  }, [user, companies]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ch, pk, comps] = await Promise.all([
        api<ProfileChangeRequest[]>("/api/v1/profile/changes").catch(() => []),
        api<Passkey[]>("/api/v1/passkeys").catch(() => []),
        fetchCompanies(),
      ]);
      setChanges(ch || []);
      setPasskeys(pk || []);
      setCompanies(comps || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Load departments when company changes
  useEffect(() => {
    if (form.company_id) {
      fetchDepartments(form.company_id).then((depts) => {
        setDepartments(depts || []);
      });
    } else {
      fetchDepartments().then((depts) => {
        setDepartments(depts || []);
      });
    }
  }, [form.company_id]);

  const set = (k: keyof typeof form, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: ProfileChangeRequestDTO = {
        name: form.name.trim() || undefined,
        employee_id: form.employee_id.trim() || undefined,
        bni_id: form.bni_id.trim() || undefined,
        division: form.division.trim() || undefined,
        site: form.site.trim() || undefined,
        company_id: form.company_id ? Number(form.company_id) : undefined,
        department_id: form.department_id ? Number(form.department_id) : undefined,
        department: form.department.trim() || undefined,
      };

      await submitProfileChange(payload);
      notify("Change requested — waiting for admin approval.", "success");
      load();
      refresh();
    } catch (err: any) {
      notify(err.message || "Request failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      notify("New password must be at least 8 characters", "error");
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

    setPwSaving(true);
    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      notify(res.message || "Password updated successfully", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err: any) {
      notify(err.message || "Password update failed", "error");
    } finally {
      setPwSaving(false);
    }
  };

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

  const statusChip = (s: ProfileChangeRequest["status"]) => {
    const map: Record<string, string> = {
      pending: "bg-mr-yellow text-black",
      approved: "bg-mr-cyan text-black",
      rejected: "bg-mr-pink text-white",
    };
    return `chip ${map[s] || "bg-mr-surface2 text-mr-muted"}`;
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

      {/* Account Overview (read-only) */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold">Account Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase text-mr-muted">Username</p>
            <p className="font-semibold">{user?.username}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-mr-muted">Email</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-mr-muted">Role</p>
            <span className="chip bg-mr-purple text-white uppercase text-xs">{user?.role}</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-mr-muted">Company</p>
            <p className="font-semibold">{user?.company || "Unassigned"}</p>
          </div>
        </div>
      </div>

      {/* Security & Password Section */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-mr-purple" />
            <h2 className="text-lg font-bold">Password & Authentication</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="btn-secondary text-xs"
            >
              {showPasswordSection ? "Hide Password Form" : "Change Password"}
            </button>
            <Link href="/change-password" className="btn-primary text-xs flex items-center gap-1">
              Dedicated Page <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {showPasswordSection && (
          <form
            onSubmit={handlePasswordChange}
            className="mt-6 border-t-2 border-mr-ink pt-6 flex flex-col gap-4 bg-mr-surface2 p-4"
          >
            <h3 className="font-bold text-sm">Update Password</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">Current Password</label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    className="input pr-10 text-sm"
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mr-muted hover:text-mr-ink"
                  >
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className="input pr-10 text-sm"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mr-muted hover:text-mr-ink"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="input pr-10 text-sm"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mr-muted hover:text-mr-ink"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-mr-muted">
                {newPassword.length >= 8 && newPassword === confirmPassword ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Password criteria satisfied
                  </span>
                ) : (
                  "Must be at least 8 characters long."
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwSaving || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="btn-primary text-xs"
                >
                  {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Save New Password
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Passkeys (self-service) */}
      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-mr-purple" />
            <h2 className="text-lg font-bold">Passkeys</h2>
            <span className="chip bg-mr-surface2 text-mr-muted">{passkeys.length}</span>
          </div>
          {passkeysSupported() && (
            <button onClick={addPasskey} disabled={addingKey} className="btn-primary text-sm">
              {addingKey ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add passkey
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-mr-purple" />
          </div>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-mr-muted">
            No passkeys yet. Add one to sign in without a password.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {passkeys.map((pk) => (
              <div
                key={pk.id}
                className="flex items-center justify-between gap-3 border-2 border-mr-ink bg-mr-surface2 px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <Fingerprint size={18} className="text-mr-purple" />
                  <div>
                    <p className="text-sm font-semibold">{pk.friendly_name || "Passkey"}</p>
                    <p className="text-xs text-mr-muted">
                      Added {new Date(pk.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removePasskey(pk)}
                  className="border-2 border-mr-ink p-2 text-mr-muted hover:bg-mr-pink hover:text-white"
                  title="Remove passkey"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editable profile → pending request */}
      <form onSubmit={submit} className="card flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Profile details</h2>
            <p className="text-xs text-mr-muted">
              Updates to core details require administrator approval before taking effect.
            </p>
          </div>
          {hasPending && (
            <span className="chip bg-mr-yellow text-black">
              <Clock size={12} /> Pending approval
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Full name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Employee ID / MII ID</label>
            <input
              className="input"
              value={form.employee_id}
              onChange={(e) => set("employee_id", e.target.value)}
              placeholder="e.g. EMP-001 or MII-12345"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">BNI ID</label>
            <input
              className="input"
              value={form.bni_id}
              onChange={(e) => set("bni_id", e.target.value)}
              placeholder="e.g. 12345678"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Division</label>
            <input
              className="input"
              value={form.division}
              onChange={(e) => set("division", e.target.value)}
              placeholder="e.g. Application Development Division"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Company</label>
            <select
              className="input font-medium"
              value={form.company_id}
              onChange={(e) => set("company_id", Number(e.target.value))}
            >
              <option value={0}>— Select Company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Department</label>
            {departments.length > 0 ? (
              <select
                className="input font-medium"
                value={form.department_id}
                onChange={(e) => {
                  const selId = Number(e.target.value);
                  const selDept = departments.find((d) => d.id === selId);
                  set("department_id", selId);
                  set("department", selDept ? selDept.name : "");
                }}
              >
                <option value={0}>— Select Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="e.g. Core Banking"
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase">Site / Location</label>
            <input
              className="input"
              value={form.site}
              onChange={(e) => set("site", e.target.value)}
              placeholder="e.g. Jakarta, Sentul, Slipi"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Request change
          </button>
        </div>
      </form>

      {/* Request history */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold">Change Requests History</h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-mr-purple" />
          </div>
        ) : changes.length === 0 ? (
          <p className="text-sm text-mr-muted">No change requests submitted yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {changes.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-2 border-2 border-mr-ink bg-mr-surface2 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mr-ink/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Request #{c.id}</span>
                    <span className="text-xs text-mr-muted">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <span className={statusChip(c.status)}>{c.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 pt-1">
                  {c.name && (
                    <div>
                      <span className="font-bold text-mr-muted">Name:</span> {c.name}
                    </div>
                  )}
                  {(c.employee_id || c.mii_id) && (
                    <div>
                      <span className="font-bold text-mr-muted">Employee ID:</span>{" "}
                      {c.employee_id || c.mii_id}
                    </div>
                  )}
                  {c.bni_id && (
                    <div>
                      <span className="font-bold text-mr-muted">BNI ID:</span> {c.bni_id}
                    </div>
                  )}
                  {c.division && (
                    <div>
                      <span className="font-bold text-mr-muted">Division:</span> {c.division}
                    </div>
                  )}
                  {c.department && (
                    <div>
                      <span className="font-bold text-mr-muted">Dept:</span> {c.department}
                    </div>
                  )}
                  {c.site && (
                    <div>
                      <span className="font-bold text-mr-muted">Site:</span> {c.site}
                    </div>
                  )}
                </div>

                {c.reviewed_at && (
                  <div className="mt-1 text-xs text-mr-muted bg-mr-surface p-2 border border-mr-ink/20">
                    Reviewed by <span className="font-semibold">{c.reviewer_name || `Admin #${c.reviewed_by}`}</span> on{" "}
                    {new Date(c.reviewed_at).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
