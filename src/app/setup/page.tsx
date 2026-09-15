"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Users2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { setToken } from "@/lib/api";
import { fetchSetupStatus, initializeSystem } from "@/services/setup";
import type { InitSetupRequest } from "@/lib/types";

const DEFAULT_COMPANIES = [
  { code: "MII", name: "PT Mitra Integrasi Informatika" },
  { code: "SDD", name: "Shared Delivery Division" },
  { code: "NTT", name: "PT NTT Data Indonesia" },
  { code: "Adidata", name: "PT Adidata Informatika" },
];

const DEFAULT_DEPARTMENTS = [
  {
    code: "WCSD",
    name: "Wholesale Channel and Service Delivery",
    division: "Wholesale Digital Delivery",
    company_code: "MII",
  },
  {
    code: "CBD",
    name: "Core Banking Delivery",
    division: "Application Development Division",
    company_code: "MII",
  },
];

export default function SetupPage() {
  const router = useRouter();
  const { notify } = useToast();
  const { refresh } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [adminForm, setAdminForm] = useState({
    name: "",
    username: "admin",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [companies, setCompanies] = useState<{ code: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { code: string; name: string; division: string; company_code: string }[]
  >([]);

  const [approvers, setApprovers] = useState<
    { name: string; role_type: "team_leader" | "department_head"; title: string; company_code: string }[]
  >([]);

  // Check setup status on load
  useEffect(() => {
    async function check() {
      try {
        const res = await fetchSetupStatus();
        if (res && res.is_initialized && !res.requires_setup) {
          notify("System is already initialized. Please sign in.", "info");
          router.replace("/login");
          return;
        }
      } catch (err: any) {
        console.error("Failed to check setup status", err);
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [notify, router]);

  const handleApplyTemplates = () => {
    setCompanies(DEFAULT_COMPANIES);
    setDepartments(DEFAULT_DEPARTMENTS);
    notify("Applied standard vendor & department templates", "success");
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    const name = adminForm.name.trim();
    const username = adminForm.username.trim();
    const email = adminForm.email.trim();

    if (!name) {
      notify("Please provide the administrator's full name", "error");
      return;
    }
    if (!username || username.length < 3) {
      notify("Username must be at least 3 characters", "error");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("Please enter a valid administrator email address", "error");
      return;
    }
    if (adminForm.password.length < 8) {
      notify("Password must be at least 8 characters long", "error");
      return;
    }
    if (adminForm.password !== adminForm.confirmPassword) {
      notify("Passwords do not match", "error");
      return;
    }
    setStep(2);
  };

  const handleFinishSetup = async () => {
    setSubmitting(true);
    try {
      const payload: InitSetupRequest = {
        admin: {
          name: adminForm.name.trim(),
          username: adminForm.username.trim(),
          email: adminForm.email.trim(),
          password: adminForm.password,
        },
        companies: companies.length > 0 ? companies : undefined,
        departments: departments.length > 0 ? departments : undefined,
        approvers: approvers.length > 0 ? approvers : undefined,
      };

      const res = await initializeSystem(payload);
      notify("System initialized successfully! Welcome 🎉", "success");

      // Check if backend returned JWT token directly
      const token = res?.token || res?.data?.token;
      if (token) {
        setToken(token);
        await refresh();
        router.replace("/users");
      } else {
        router.replace("/login");
      }
    } catch (err: any) {
      notify(err.message || "Failed to initialize setup", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-mr-purple" size={36} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 md:p-8 flex flex-col justify-center items-center">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header Branding */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center bg-mr-yellow text-black shadow-hard border-2 border-mr-ink">
            <CalendarCheck size={28} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Onboarding & Setup</h1>
          <p className="mt-1 text-sm text-mr-muted font-medium">
            Initialize your Timesheet Portal with super administrator credentials and organization data.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="card mb-6 p-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold uppercase">
            <div
              className={`flex items-center justify-center gap-1.5 py-2 border-2 border-mr-ink transition ${
                step === 1
                  ? "bg-mr-yellow text-black"
                  : step > 1
                  ? "bg-mr-cyan text-black"
                  : "bg-mr-surface2 text-mr-muted"
              }`}
            >
              <ShieldCheck size={16} /> 1. Admin
            </div>
            <div
              className={`flex items-center justify-center gap-1.5 py-2 border-2 border-mr-ink transition ${
                step === 2
                  ? "bg-mr-yellow text-black"
                  : step > 2
                  ? "bg-mr-cyan text-black"
                  : "bg-mr-surface2 text-mr-muted"
              }`}
            >
              <Building2 size={16} /> 2. Companies
            </div>
            <div
              className={`flex items-center justify-center gap-1.5 py-2 border-2 border-mr-ink transition ${
                step === 3 ? "bg-mr-yellow text-black" : "bg-mr-surface2 text-mr-muted"
              }`}
            >
              <Users2 size={16} /> 3. Review
            </div>
          </div>
        </div>

        {/* STEP 1: Admin Account */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="card p-6 flex flex-col gap-4 shadow-hard">
            <div className="border-b-2 border-mr-ink pb-3">
              <h2 className="text-lg font-extrabold">Step 1: Super Administrator Account</h2>
              <p className="text-xs text-mr-muted">
                This root administrator account will have full access to manage users, companies, and settings.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase">Full Name</label>
              <input
                className="input"
                placeholder="e.g. John Administrator"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">Username</label>
                <input
                  className="input"
                  placeholder="admin"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  minLength={3}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="admin@company.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">Password (min. 8 chars)</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={adminForm.confirmPassword}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, confirmPassword: e.target.value })
                  }
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button type="submit" className="btn-primary flex items-center gap-2">
                Continue to Companies <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Companies & Departments */}
        {step === 2 && (
          <div className="card p-6 flex flex-col gap-5 shadow-hard">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-mr-ink pb-3">
              <div>
                <h2 className="text-lg font-extrabold">Step 2: Organizations & Departments</h2>
                <p className="text-xs text-mr-muted">
                  Pre-populate vendor companies and departments, or skip to configure later.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyTemplates}
                className="btn border-2 border-mr-ink bg-mr-yellow text-black text-xs font-extrabold flex items-center gap-1.5"
              >
                <Sparkles size={14} /> Use Standard Template
              </button>
            </div>

            {/* Companies List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-mr-muted">
                  Companies ({companies.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCompanies([...companies, { code: "", name: "" }])
                  }
                  className="text-xs font-bold text-mr-purple flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Row
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {companies.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="input w-28 uppercase font-mono font-bold text-xs"
                      placeholder="CODE"
                      value={c.code}
                      onChange={(e) => {
                        const next = [...companies];
                        next[i].code = e.target.value;
                        setCompanies(next);
                      }}
                    />
                    <input
                      className="input flex-1 text-xs"
                      placeholder="Company Full Name"
                      value={c.name}
                      onChange={(e) => {
                        const next = [...companies];
                        next[i].name = e.target.value;
                        setCompanies(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setCompanies(companies.filter((_, idx) => idx !== i))}
                      className="border border-mr-ink p-2 text-mr-muted hover:bg-mr-pink hover:text-white transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {companies.length === 0 && (
                  <p className="text-xs text-mr-muted text-center py-3 bg-mr-surface2 border border-dashed border-mr-ink/20">
                    No companies configured. Click &quot;Use Standard Template&quot; or add rows.
                  </p>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="mt-2 flex items-center justify-between border-t-2 border-mr-ink pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-ghost flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-ghost text-xs font-bold"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex items-center gap-2"
                >
                  Continue to Review <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Finalize */}
        {step === 3 && (
          <div className="card p-6 flex flex-col gap-5 shadow-hard">
            <div className="border-b-2 border-mr-ink pb-3">
              <h2 className="text-lg font-extrabold">Step 3: Review & Finalize Onboarding</h2>
              <p className="text-xs text-mr-muted">
                Review your configuration before executing system initialization.
              </p>
            </div>

            {/* Approvers (optional) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-mr-muted">
                  Initial Approvers (Optional)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setApprovers([
                      ...approvers,
                      { name: "", role_type: "team_leader", title: "Technical Lead", company_code: "" },
                    ])
                  }
                  className="text-xs font-bold text-mr-purple flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Approver
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {approvers.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="input flex-1 text-xs"
                      placeholder="Approver Full Name"
                      value={a.name}
                      onChange={(e) => {
                        const next = [...approvers];
                        next[i].name = e.target.value;
                        setApprovers(next);
                      }}
                    />
                    <select
                      className="input w-36 text-xs font-bold"
                      value={a.role_type}
                      onChange={(e) => {
                        const next = [...approvers];
                        next[i].role_type = e.target.value as "team_leader" | "department_head";
                        setApprovers(next);
                      }}
                    >
                      <option value="team_leader">Team Leader</option>
                      <option value="department_head">Dept Head</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setApprovers(approvers.filter((_, idx) => idx !== i))}
                      className="border border-mr-ink p-2 text-mr-muted hover:bg-mr-pink hover:text-white transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-mr-surface2 border-2 border-mr-ink p-4 text-xs flex flex-col gap-1.5">
              <p className="font-extrabold uppercase text-mr-purple mb-1">Configuration Summary</p>
              <div className="flex justify-between border-b border-mr-ink/10 pb-1">
                <span className="text-mr-muted">Super Admin:</span>
                <span className="font-bold">{adminForm.username} ({adminForm.email})</span>
              </div>
              <div className="flex justify-between border-b border-mr-ink/10 pb-1">
                <span className="text-mr-muted">Companies Configured:</span>
                <span className="font-bold">{companies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mr-muted">Initial Approvers:</span>
                <span className="font-bold">{approvers.length}</span>
              </div>
            </div>

            {/* Warning Note */}
            <div className="flex items-start gap-2 bg-mr-yellow/20 border-2 border-mr-ink p-3 text-xs text-mr-ink">
              <AlertTriangle size={18} className="shrink-0 text-mr-pink mt-0.5" />
              <p>
                After initialization, the onboarding route is permanently locked. Future configuration will be managed via the Admin console.
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="mt-2 flex items-center justify-between border-t-2 border-mr-ink pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-ghost flex items-center gap-2"
                disabled={submitting}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleFinishSetup}
                disabled={submitting}
                className="btn-primary flex items-center gap-2 bg-mr-cyan text-mr-ink"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Initialize System & Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
