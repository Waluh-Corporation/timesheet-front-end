"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import type { Division, DivisionRequest } from "@/lib/types";
import {
  fetchDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
} from "../services/masterDataService";
import { useClientPagination } from "../hooks/useClientPagination";
import { Modal } from "@/components/tabler";

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
    <div className="card">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h3 className="card-title mb-0">Divisions ({totalItems})</h3>
        <div className="d-flex align-items-center gap-2">
          <div className="input-icon">
            <span className="input-icon-addon">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search divisions..."
              className="form-control form-control-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            data-testid="create-divisions-btn"
            onClick={() => {
              setForm({ code: "", name: "", is_active: true });
              setModalOpen(true);
            }}
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 text-nowrap"
          >
            <IconPlus size={16} /> Add Division
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-vcenter card-table table-hover" data-testid="divisions-table">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer user-select-none"
                    onClick={() => handleSort("code")}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Code{" "}
                      {sortKey === "code" &&
                        (sortDir === "asc" ? (
                          <IconChevronUp size={14} />
                        ) : (
                          <IconChevronDown size={14} />
                        ))}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer user-select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Division Name{" "}
                      {sortKey === "name" &&
                        (sortDir === "asc" ? (
                          <IconChevronUp size={14} />
                        ) : (
                          <IconChevronDown size={14} />
                        ))}
                    </div>
                  </th>
                  <th>Status</th>
                  <th className="w-1 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((d) => (
                  <tr key={d.id}>
                    <td className="font-monospace fw-bold text-uppercase">{d.code || "—"}</td>
                    <td className="fw-semibold">{d.name}</td>
                    <td>
                      <span
                        className={`badge ${
                          d.is_active ? "bg-success-lt" : "bg-danger-lt"
                        } text-uppercase`}
                      >
                        {d.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="btn-list justify-content-end flex-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              id: d.id,
                              code: d.code || "",
                              name: d.name,
                              is_active: d.is_active ?? true,
                            });
                            setModalOpen(true);
                          }}
                          className="btn btn-sm btn-icon btn-outline-secondary"
                          title="Edit"
                        >
                          <IconPencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id, d.name)}
                          className="btn btn-sm btn-icon btn-outline-danger"
                          title="Delete"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-secondary">
                      No divisions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="card-footer d-flex align-items-center justify-content-between">
              <div className="text-secondary small">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
              </div>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <div className="btn-group">
                  <button
                    type="button"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    <IconChevronLeft size={16} />
                  </button>
                  <span className="btn btn-sm btn-outline-secondary disabled fw-bold">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    <IconChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? "Edit Division" : "Add Division"}
        footer={
          <>
            <button
              type="button"
              className="btn btn-link link-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary d-inline-flex align-items-center gap-1"
            >
              {saving && <span className="spinner-border spinner-border-sm" role="status" />}
              Save Division
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label">Division Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. IT, FIN"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label required">Division Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Information Technology"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <span className="form-check-label fw-semibold">Active</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
