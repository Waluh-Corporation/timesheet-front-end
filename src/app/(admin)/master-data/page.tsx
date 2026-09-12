"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Users2,
  CalendarCheck2,
  Plus,
  Trash2,
  Edit2,
  RotateCw,
  Loader2,
  CheckCircle,
  X,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import type { Company, Approver, Holiday, CompanyRequest, ApproverRequest } from "@/lib/types";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  fetchApprovers,
  createApprover,
  updateApprover,
  deleteApprover,
  syncHolidays,
  fetchAllHolidays,
} from "@/services/masterData";

type Tab = "companies" | "approvers" | "holidays";

export default function MasterDataPage() {
  const { notify } = useToast();
  const [currentTab, setCurrentTab] = useState<Tab>("companies");
  const [loading, setLoading] = useState(true);

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyModal, setCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState<{ id?: number; code: string; name: string }>({
    code: "",
    name: "",
  });
  const [companySaving, setCompanySaving] = useState(false);

  // Approvers state
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [approverModal, setApproverModal] = useState(false);
  const [approverForm, setApproverForm] = useState<{
    id?: number;
    name: string;
    role_type: "team_leader" | "department_head";
    title: string;
    is_active: boolean;
  }>({
    name: "",
    role_type: "team_leader",
    title: "",
    is_active: true,
  });
  const [approverSaving, setApproverSaving] = useState(false);

  // Holidays state
  const currentYear = new Date().getFullYear();
  const [holidayYear, setHolidayYear] = useState(currentYear);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (currentTab === "companies") {
        const comps = await fetchCompanies();
        setCompanies(comps || []);
      } else if (currentTab === "approvers") {
        const apps = await fetchApprovers();
        setApprovers(apps || []);
      } else if (currentTab === "holidays") {
        const hols = await fetchAllHolidays(holidayYear);
        setHolidays(hols || []);
      }
    } catch (err: any) {
      notify(err.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [currentTab, holidayYear, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Company handlers
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanySaving(true);
    try {
      if (companyForm.id) {
        await updateCompany(companyForm.id, {
          code: companyForm.code,
          name: companyForm.name,
        });
        notify("Company updated", "success");
      } else {
        await createCompany({
          code: companyForm.code,
          name: companyForm.name,
        });
        notify("Company created", "success");
      }
      setCompanyModal(false);
      loadData();
    } catch (err: any) {
      notify(err.message || "Failed to save company", "error");
    } finally {
      setCompanySaving(false);
    }
  };

  const handleDeleteCompany = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete company "${name}"?`)) return;
    try {
      await deleteCompany(id);
      notify("Company deleted", "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Delete failed", "error");
    }
  };

  // Approver handlers
  const handleSaveApprover = async (e: React.FormEvent) => {
    e.preventDefault();
    setApproverSaving(true);
    try {
      if (approverForm.id) {
        await updateApprover(approverForm.id, {
          name: approverForm.name,
          role_type: approverForm.role_type,
          title: approverForm.title,
          is_active: approverForm.is_active,
        });
        notify("Approver updated", "success");
      } else {
        await createApprover({
          name: approverForm.name,
          role_type: approverForm.role_type,
          title: approverForm.title,
          is_active: approverForm.is_active,
        });
        notify("Approver created", "success");
      }
      setApproverModal(false);
      loadData();
    } catch (err: any) {
      notify(err.message || "Failed to save approver", "error");
    } finally {
      setApproverSaving(false);
    }
  };

  const handleDeleteApprover = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete approver "${name}"?`)) return;
    try {
      await deleteApprover(id);
      notify("Approver deleted", "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Delete failed", "error");
    }
  };

  // Holiday sync
  const handleSyncHolidays = async () => {
    setSyncing(true);
    try {
      const res = await syncHolidays(holidayYear);
      notify(res.message || `Holidays for ${holidayYear} synced successfully!`, "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold">Master Data</h1>
        <p className="text-sm text-mr-muted">
          Manage companies, overtime approvers, and Indonesian public holidays.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex border-b-2 border-mr-ink gap-2">
        <button
          onClick={() => setCurrentTab("companies")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm transition border-b-2 -mb-[2px] ${
            currentTab === "companies"
              ? "border-mr-purple text-mr-purple bg-mr-surface"
              : "border-transparent text-mr-muted hover:text-mr-ink"
          }`}
        >
          <Building2 size={16} /> Companies
        </button>
        <button
          onClick={() => setCurrentTab("approvers")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm transition border-b-2 -mb-[2px] ${
            currentTab === "approvers"
              ? "border-mr-purple text-mr-purple bg-mr-surface"
              : "border-transparent text-mr-muted hover:text-mr-ink"
          }`}
        >
          <Users2 size={16} /> Approvers
        </button>
        <button
          onClick={() => setCurrentTab("holidays")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm transition border-b-2 -mb-[2px] ${
            currentTab === "holidays"
              ? "border-mr-purple text-mr-purple bg-mr-surface"
              : "border-transparent text-mr-muted hover:text-mr-ink"
          }`}
        >
          <CalendarCheck2 size={16} /> National Holidays
        </button>
      </div>

      {/* Companies Tab */}
      {currentTab === "companies" && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Companies ({companies.length})</h2>
            <button
              onClick={() => {
                setCompanyForm({ code: "", name: "" });
                setCompanyModal(true);
              }}
              className="btn-primary text-sm"
            >
              <Plus size={16} /> Add Company
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-mr-purple" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Company Name</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50">
                      <td className="py-3 font-mono font-bold uppercase">{c.code}</td>
                      <td className="py-3 font-semibold">{c.name}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setCompanyForm({ id: c.id, code: c.code, name: c.name });
                              setCompanyModal(true);
                            }}
                            className="border border-mr-ink p-1.5 hover:bg-mr-surface2"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(c.id, c.name)}
                            className="border border-mr-ink p-1.5 text-mr-muted hover:bg-mr-pink hover:text-white"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {companies.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-mr-muted">
                        No companies configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Approvers Tab */}
      {currentTab === "approvers" && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Approvers ({approvers.length})</h2>
            <button
              onClick={() => {
                setApproverForm({
                  name: "",
                  role_type: "team_leader",
                  title: "",
                  is_active: true,
                });
                setApproverModal(true);
              }}
              className="btn-primary text-sm"
            >
              <Plus size={16} /> Add Approver
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-mr-purple" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Role Type</th>
                    <th className="pb-2">Title / Position</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvers.map((a) => (
                    <tr key={a.id} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50">
                      <td className="py-3 font-semibold">{a.name}</td>
                      <td className="py-3">
                        <span className="chip bg-mr-surface2 text-xs font-bold">
                          {a.role_type === "team_leader" ? "Team Leader" : "Department Head"}
                        </span>
                      </td>
                      <td className="py-3 text-mr-muted">{a.title || "-"}</td>
                      <td className="py-3">
                        <span
                          className={`chip text-xs ${
                            a.is_active ? "bg-mr-cyan text-black" : "bg-mr-pink text-white"
                          }`}
                        >
                          {a.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setApproverForm({
                                id: a.id,
                                name: a.name,
                                role_type: a.role_type,
                                title: a.title || "",
                                is_active: a.is_active,
                              });
                              setApproverModal(true);
                            }}
                            className="border border-mr-ink p-1.5 hover:bg-mr-surface2"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteApprover(a.id, a.name)}
                            className="border border-mr-ink p-1.5 text-mr-muted hover:bg-mr-pink hover:text-white"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {approvers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-mr-muted">
                        No approvers configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Holidays Tab */}
      {currentTab === "holidays" && (
        <div className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">Indonesian National Holidays</h2>
              <select
                aria-label="Select holiday year"
                className="input py-1 px-2 text-xs font-bold"
                value={holidayYear}
                onChange={(e) => setHolidayYear(Number(e.target.value))}
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSyncHolidays}
              disabled={syncing}
              className="btn border-2 border-mr-ink bg-mr-cyan text-mr-ink text-sm font-bold flex items-center gap-2"
            >
              <RotateCw size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync from Kemendesa API"}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-mr-purple" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h, i) => (
                    <tr key={i} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50">
                      <td className="py-3 font-semibold whitespace-nowrap">{h.date}</td>
                      <td className="py-3">{h.description}</td>
                      <td className="py-3">
                        <span className="chip bg-mr-surface2 text-xs font-semibold">
                          {h.is_joint_leave ? "Cuti Bersama" : "Libur Nasional"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {holidays.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-mr-muted">
                        No holidays loaded for {holidayYear}. Click &quot;Sync from Kemendesa API&quot; above to fetch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Company Modal */}
      {companyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-hard">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {companyForm.id ? "Edit Company" : "New Company"}
              </h2>
              <button onClick={() => setCompanyModal(false)} className="p-1 hover:bg-mr-surface2">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCompany} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Code (e.g. MII, SDD, NTT)</label>
                <input
                  className="input"
                  value={companyForm.code}
                  onChange={(e) => setCompanyForm({ ...companyForm, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Company Name</label>
                <input
                  className="input"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setCompanyModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={companySaving}>
                  {companySaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approver Modal */}
      {approverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-hard">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {approverForm.id ? "Edit Approver" : "New Approver"}
              </h2>
              <button onClick={() => setApproverModal(false)} className="p-1 hover:bg-mr-surface2">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveApprover} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Full Name</label>
                <input
                  className="input"
                  value={approverForm.name}
                  onChange={(e) => setApproverForm({ ...approverForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Role Type</label>
                <select
                  className="input"
                  value={approverForm.role_type}
                  onChange={(e) =>
                    setApproverForm({
                      ...approverForm,
                      role_type: e.target.value as "team_leader" | "department_head",
                    })
                  }
                >
                  <option value="team_leader">Team Leader</option>
                  <option value="department_head">Department Head</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Title / Position</label>
                <input
                  className="input"
                  value={approverForm.title}
                  onChange={(e) => setApproverForm({ ...approverForm, title: e.target.value })}
                  placeholder="e.g. Lead Engineer / VP"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={approverForm.is_active}
                  onChange={(e) =>
                    setApproverForm({ ...approverForm, is_active: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-xs font-semibold">
                  Active (available for overtime approval)
                </label>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApproverModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={approverSaving}>
                  {approverSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Approver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
