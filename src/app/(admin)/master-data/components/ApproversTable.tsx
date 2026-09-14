"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Loader2, X, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { Approver } from "@/lib/types";
import { fetchApprovers, createApprover, updateApprover, deleteApprover } from "@/app/(admin)/master-data/services/masterData";
import { useClientPagination } from "../hooks/useClientPagination";

export function ApproversTable() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [approvers, setApprovers] = useState<Approver[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ id?: number; name: string; role_type: "team_leader" | "department_head"; title: string; is_active: boolean }>({
    name: "",
    role_type: "team_leader",
    title: "",
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApprovers();
      setApprovers(data || []);
    } catch (err: any) {
      notify(err.message || "Failed to load approvers", "error");
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
  } = useClientPagination<Approver>(
    approvers,
    (item, s) => item.name.toLowerCase().includes(s) || (item.title?.toLowerCase() || "").includes(s),
    "name"
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await updateApprover(form.id, {
          name: form.name,
          role_type: form.role_type,
          title: form.title,
          is_active: form.is_active,
        });
        notify("Approver updated", "success");
      } else {
        await createApprover({
          name: form.name,
          role_type: form.role_type,
          title: form.title,
          is_active: form.is_active,
        });
        notify("Approver created", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      notify(err.message || "Failed to save approver", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete approver "${name}"?`)) return;
    try {
      await deleteApprover(id);
      notify("Approver deleted", "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Delete failed", "error");
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">Approvers ({totalItems})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mr-muted" />
            <input
              type="text"
              placeholder="Search approvers..."
              className="input pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            data-testid="create-approvers-btn"
            onClick={() => {
              setForm({ name: "", role_type: "team_leader", title: "", is_active: true });
              setModalOpen(true);
            }}
            className="btn-primary text-sm whitespace-nowrap"
          >
            <Plus size={16} /> Add Approver
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
            <table className="w-full text-left text-sm" data-testid="approvers-table">
              <thead>
                <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Name {sortKey === "name" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("role_type")}>
                    <div className="flex items-center gap-1">
                      Role Type {sortKey === "role_type" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("title")}>
                    <div className="flex items-center gap-1">
                      Title {sortKey === "title" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("is_active")}>
                    <div className="flex items-center gap-1">
                      Status {sortKey === "is_active" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((a) => (
                  <tr key={a.id} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50">
                    <td className="py-3 font-semibold">{a.name}</td>
                    <td className="py-3">
                      <span className="chip bg-mr-surface2 text-xs font-bold">
                        {a.role_type === "team_leader" ? "Team Leader" : "Department Head"}
                      </span>
                    </td>
                    <td className="py-3 text-mr-muted">{a.title || "-"}</td>
                    <td className="py-3">
                      <span className={`chip text-xs ${a.is_active ? "bg-mr-cyan text-black" : "bg-mr-pink text-white"}`}>
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setForm({ id: a.id, name: a.name, role_type: a.role_type, title: a.title || "", is_active: a.is_active });
                            setModalOpen(true);
                          }}
                          className="border border-mr-ink p-1.5 hover:bg-mr-surface2"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.name)}
                          className="border border-mr-ink p-1.5 text-mr-muted hover:bg-mr-pink hover:text-white"
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
                    <td colSpan={5} className="py-6 text-center text-mr-muted">
                      No approvers found.
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
              <h2 className="text-lg font-bold">{form.id ? "Edit Approver" : "New Approver"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-mr-surface2"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Full Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Role Type</label>
                <select className="input" value={form.role_type} onChange={(e) => setForm({ ...form, role_type: e.target.value as any })}>
                  <option value="team_leader">Team Leader</option>
                  <option value="department_head">Department Head</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Title / Position</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Lead Engineer" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" />
                <label htmlFor="is_active" className="text-xs font-semibold">Active</label>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving && <Loader2 size={16} className="animate-spin" />} Save Approver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
