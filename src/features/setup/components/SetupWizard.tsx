"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconShieldCheck,
  IconBuilding,
  IconUsers,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconCalendarCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { setToken } from "@/lib/api";
import { fetchSetupStatus, initializeSystem } from "../services/setupService";
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

export default function SetupWizard() {
  const router = useRouter();
  const { notify } = useToast();
  const { refresh } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      <div className="page page-center min-vh-100 d-flex align-items-center justify-content-center">
        <IconLoader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="page page-center min-vh-100 d-flex flex-column justify-content-center py-4">
      <div className="position-absolute top-0 end-0 p-3">
        <ThemeToggle />
      </div>

      <div className="container" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="avatar bg-primary text-primary-fg rounded mb-2" style={{ width: 48, height: 48 }}>
            <IconCalendarCheck size={26} />
          </div>
          <h1 className="h2 mb-1 fw-bold">System Onboarding & Setup</h1>
          <p className="text-secondary small">
            Initialize your Timesheet Portal with super administrator credentials and organization data.
          </p>
        </div>

        {/* Steps */}
        <div className="card mb-3">
          <div className="card-body py-3">
            <ul className="steps steps-counter steps-primary">
              <li className={`step-item ${step === 1 ? "active" : step > 1 ? "active" : ""}`}>
                Admin Account
              </li>
              <li className={`step-item ${step === 2 ? "active" : step > 2 ? "active" : ""}`}>
                Organizations
              </li>
              <li className={`step-item ${step === 3 ? "active" : ""}`}>
                Review & Finalize
              </li>
            </ul>
          </div>
        </div>

        {/* STEP 1: Admin Account */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="card shadow-sm">
            <div className="card-header">
              <div>
                <h3 className="card-title">Step 1: Super Administrator Account</h3>
                <div className="card-subtitle">
                  This root administrator account will have full access to manage users, companies, and settings.
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label required">Full Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. John Administrator"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-sm-6">
                  <label className="form-label required">Username</label>
                  <input
                    className="form-control"
                    placeholder="admin"
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    minLength={3}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Email Address</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="admin@company.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-sm-6">
                  <label className="form-label required">Password (min. 8 chars)</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    minLength={8}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Confirm Password</label>
                  <input
                    className="form-control"
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
            </div>
            <div className="card-footer d-flex justify-content-end">
              <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                Continue to Organizations <IconArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Companies & Departments */}
        {step === 2 && (
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h3 className="card-title">Step 2: Organizations & Departments</h3>
                <div className="card-subtitle">
                  Pre-populate vendor companies and departments, or skip to configure later.
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyTemplates}
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              >
                <IconSparkles size={14} /> Use Standard Template
              </button>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="form-label mb-0">Companies ({companies.length})</span>
                <button
                  type="button"
                  onClick={() => setCompanies([...companies, { code: "", name: "" }])}
                  className="btn btn-link btn-sm p-0 d-flex align-items-center gap-1"
                >
                  <IconPlus size={14} /> Add Row
                </button>
              </div>

              <div className="d-flex flex-column gap-2 mb-3">
                {companies.map((c, i) => (
                  <div key={i} className="row g-2 align-items-center">
                    <div className="col-3">
                      <input
                        className="form-control text-uppercase font-monospace"
                        placeholder="CODE"
                        value={c.code}
                        onChange={(e) => {
                          const next = [...companies];
                          next[i].code = e.target.value;
                          setCompanies(next);
                        }}
                      />
                    </div>
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Company Full Name"
                        value={c.name}
                        onChange={(e) => {
                          const next = [...companies];
                          next[i].name = e.target.value;
                          setCompanies(next);
                        }}
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        onClick={() => setCompanies(companies.filter((_, idx) => idx !== i))}
                        className="btn btn-icon btn-outline-danger"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {companies.length === 0 && (
                  <div className="text-secondary small text-center py-3 bg-body-tertiary border border-dashed rounded">
                    No companies configured. Click &quot;Use Standard Template&quot; or add rows.
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer d-flex justify-content-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
              >
                <IconArrowLeft size={16} /> Back
              </button>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-link text-secondary"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  Continue to Review <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Finalize */}
        {step === 3 && (
          <div className="card shadow-sm">
            <div className="card-header">
              <div>
                <h3 className="card-title">Step 3: Review & Finalize Onboarding</h3>
                <div className="card-subtitle">
                  Review your configuration before executing system initialization.
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Approvers */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="form-label mb-0">Initial Approvers (Optional)</span>
                <button
                  type="button"
                  onClick={() =>
                    setApprovers([
                      ...approvers,
                      { name: "", role_type: "team_leader", title: "Technical Lead", company_code: "" },
                    ])
                  }
                  className="btn btn-link btn-sm p-0 d-flex align-items-center gap-1"
                >
                  <IconPlus size={14} /> Add Approver
                </button>
              </div>

              <div className="d-flex flex-column gap-2 mb-4">
                {approvers.map((a, i) => (
                  <div key={i} className="row g-2 align-items-center">
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Approver Full Name"
                        value={a.name}
                        onChange={(e) => {
                          const next = [...approvers];
                          next[i].name = e.target.value;
                          setApprovers(next);
                        }}
                      />
                    </div>
                    <div className="col-auto">
                      <select
                        className="form-select"
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
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        onClick={() => setApprovers(approvers.filter((_, idx) => idx !== i))}
                        className="btn btn-icon btn-outline-danger"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="card card-sm bg-body-tertiary mb-3">
                <div className="card-body">
                  <h4 className="card-title text-primary mb-2">Configuration Summary</h4>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-secondary small">Super Admin:</span>
                    <span className="fw-semibold small">{adminForm.username} ({adminForm.email})</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-secondary small">Companies Configured:</span>
                    <span className="fw-semibold small">{companies.length}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-secondary small">Initial Approvers:</span>
                    <span className="fw-semibold small">{approvers.length}</span>
                  </div>
                </div>
              </div>

              {/* Warning alert */}
              <div className="alert alert-warning d-flex align-items-start mb-0" role="alert">
                <IconAlertTriangle size={20} className="me-2 shrink-0 mt-1" />
                <div className="small">
                  After initialization, the onboarding route is permanently locked. Future configuration will be managed via the Admin console.
                </div>
              </div>
            </div>

            <div className="card-footer d-flex justify-content-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                disabled={submitting}
              >
                <IconArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleFinishSetup}
                disabled={submitting}
                className="btn btn-success d-flex align-items-center gap-2"
              >
                {submitting ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCheck size={16} />
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
