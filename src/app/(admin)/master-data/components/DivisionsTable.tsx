"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Loader2, X, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { Division, DivisionRequest } from "@/lib/types";
import { fetchDivisions, createDivision, updateDivision, deleteDivision } from "@/app/(admin)/master-data/services/masterData";
import { useClientPagination } from "../hooks/useClientPagination";

export function DivisionsTable() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<Division[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DivisionRequest & { id?: number }>({
    code: "",
    name: "",
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDivisions();
      setDivisions(data || []);
    } catch (err: any) {
      notify(err.message || "Failed to load divisions", "error");
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
  } = useClientPagination<Division>(
    divisions,
    (item, s) => item.name.toLowerCase().includes(s) || (item.code?.toLowerCase() || "").includes(s),
    "name"
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await updateDivision(form.id, {
          code: form.code,
          name: form.name,
          is_active: form.is_active,
        });
        notify("Division updated", "success");
      } else {
        await createDivision({
          code: form.code,
          name: form.name,
          is_active: form.is_active,
        });
        notify("Division created", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      notify(err.message || "Failed to save division", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete division "${name}"?`)) return;
    try {
      await deleteDivision(id);
      notify("Division deleted", "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Delete failed", "error");
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">Divisions ({totalItems})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mr-muted" />
            <input
              type="text"
              placeholder="Search divisions..."
              className="input pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            data-testid="create-divisions-btn"
            onClick={() => {
              setForm({ code: "", name: "", is_active: true });
              setModalOpen(true);
            }}
            className="btn-primary text-sm whitespace-nowrap"
          >
            <Plus size={16} /> Add Division
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
            <table className="w-full text-left text-sm" data-testid="divisions-table">
              <thead>
                <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("code")}>
                    <div className="flex items-center gap-1">
                      Code {sortKey === "code" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="pb-2 cursor-pointer hover:text-mr-ink" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Name {sortKey === "name" && (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
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
                {paginatedData.map((d) => (
                  <tr key={d.id} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50">
                    <td className="py-3 font-mono font-bold uppercase">{d.code || "-"}</td>
                    <td className="py-3 font-semibold">{d.name}</td>
                    <td className="py-3">
                      <span className={`chip text-xs ${d.is_active ? "bg-mr-cyan text-black" : "bg-mr-pink text-white"}`}>
                        {d.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setForm({ id: d.id, code: d.code || "", name: d.name, is_active: d.is_active });
                            setModalOpen(true);
                          }}
                          className="btn-icon bg-mr-surface2"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id, d.name)}
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
                    <td colSpan={4} className="py-6 text-center text-mr-muted">
                      No divisions found.
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
              <h2 className="text-lg font-bold">{form.id ? "Edit Division" : "New Division"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-mr-surface2"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Code</label>
                <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 cursor-pointer accent-mr-purple focus-visible:ring-2 focus-visible:ring-mr-purple outline-none" />
                <label htmlFor="is_active" className="text-xs font-semibold">Active</label>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving && <Loader2 size={16} className="animate-spin" />} Save Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
