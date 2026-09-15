"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Loader2, X, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { Company, CompanyRequest } from "@/lib/types";
import { fetchCompanies, createCompany, updateCompany, deleteCompany } from "@/app/(admin)/master-data/services/masterData";
import { useClientPagination } from "../hooks/useClientPagination";

export function CompaniesTable() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyRequest & { id?: number }>({
    code: "",
    name: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCompanies();
      setCompanies(data || []);
    } catch (err: any) {
      notify(err.message || "Failed to load companies", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    sortKey,
    sortDir,
    handleSort,
    paginatedData,
    totalItems,
    totalPages,
  } = useClientPagination<Company>(
    companies,
    (item, s) => item.name.toLowerCase().includes(s) || item.code.toLowerCase().includes(s),
    "name"
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await updateCompany(form.id, {
          code: form.code,
          name: form.name,
        });
        notify("Company updated", "success");
      } else {
        await createCompany({
          code: form.code,
          name: form.name,
        });
        notify("Company created", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      notify(err.message || "Failed to save company", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete company "${name}"?`)) return;
    try {
      await deleteCompany(id);
      notify("Company deleted", "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Delete failed", "error");
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">Companies ({totalItems})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mr-muted" />
            <input
              type="text"
              placeholder="Search companies..."
              className="input pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            data-testid="create-companies-btn"
            onClick={() => {
              setForm({ code: "", name: "" });
              setModalOpen(true);
            }}
            className="btn-primary text-sm whitespace-nowrap"
          >
            <Plus size={16} /> Add Company
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-mr-purple" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="companies-table">
              <thead>
                <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("code")}>
                    <div className="flex items-center gap-1">
                      Code {sortKey === "code" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Company Name {sortKey === "name" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((c) => (
                  <tr key={c.id} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50">
                    <td className="py-3 font-mono font-bold uppercase">{c.code}</td>
                    <td className="py-3 font-semibold">{c.name}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setForm({ id: c.id, code: c.code, name: c.name });
                            setModalOpen(true);
                          }}
                          className="btn-icon bg-mr-surface2"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="btn-icon hover:bg-mr-pink hover:text-white"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-mr-muted">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="text-mr-muted">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
              </div>
              <div className="flex items-center gap-2">
                <select className="input py-1 px-2 text-xs" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-1 hover:bg-mr-surface2 disabled:opacity-50"><ChevronLeft size={16} /></button>
                  <span className="font-bold px-2">{page} / {totalPages}</span>
                  <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1 hover:bg-mr-surface2 disabled:opacity-50"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-hard">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? "Edit Company" : "New Company"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-mr-surface2"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Code (e.g. MII, SDD)</label>
                <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Company Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving && <Loader2 size={16} className="animate-spin" />} Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
