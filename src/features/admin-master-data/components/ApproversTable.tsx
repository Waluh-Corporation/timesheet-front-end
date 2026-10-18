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
import type { Approver } from "@/lib/types";
import {
  fetchAdminApprovers,
  createApprover,
  updateApprover,
  deleteApprover,
} from "../services/masterDataService";
import { useClientPagination } from "../hooks/useClientPagination";
import { Modal } from "@/components/tabler";

export function ApproversTable() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [approvers, setApprovers] = useState<Approver[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminApprovers();
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
    (item, s) =>
      item.name.toLowerCase().includes(s) || (item.title?.toLowerCase() || "").includes(s),
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
    <div className="card">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h3 className="card-title mb-0">Approvers ({totalItems})</h3>
        <div className="d-flex align-items-center gap-2">
          <div className="input-icon">
            <span className="input-icon-addon">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search approvers..."
              className="form-control form-control-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            data-testid="create-approvers-btn"
            onClick={() => {
              setForm({ name: "", role_type: "team_leader", title: "", is_active: true });
              setModalOpen(true);
            }}
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 text-nowrap"
          >
            <IconPlus size={16} /> Add Approver
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
            <table className="table table-vcenter card-table table-hover" data-testid="approvers-table">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer user-select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="d-flex align-items-center gap-1">
                      Approver Name{" "}
                      {sortKey === "name" &&
                        (sortDir === "asc" ? (
                          <IconChevronUp size={14} />
                        ) : (
                          <IconChevronDown size={14} />
                        ))}
                    </div>
                  </th>
                  <th>Role Type</th>
                  <th>Title / Position</th>
                  <th>Status</th>
                  <th className="w-1 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-semibold">{a.name}</td>
                    <td>
                      <span className="badge bg-blue-lt text-uppercase">
                        {a.role_type === "team_leader" ? "Team Leader" : "Department Head"}
                      </span>
                    </td>
                    <td className="text-secondary">{a.title || "—"}</td>
                    <td>
                      <span
                        className={`badge ${
                          a.is_active ? "bg-success-lt" : "bg-danger-lt"
                        } text-uppercase`}
                      >
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="btn-list justify-content-end flex-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              id: a.id,
                              name: a.name,
                              role_type: a.role_type,
                              title: a.title || "",
                              is_active: a.is_active ?? true,
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
                          onClick={() => handleDelete(a.id, a.name)}
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
                    <td colSpan={5} className="text-center py-4 text-secondary">
                      No approvers found.
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
        title={form.id ? "Edit Approver" : "Add Approver"}
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
              Save Approver
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label required">Approver Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Budi Santoso"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label required">Role Type</label>
            <select
              className="form-select"
              value={form.role_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  role_type: e.target.value as "team_leader" | "department_head",
                })
              }
            >
              <option value="team_leader">Team Leader</option>
              <option value="department_head">Department Head</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Title / Position</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. AVP Core Banking"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
