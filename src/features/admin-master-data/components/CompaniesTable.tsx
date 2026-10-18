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
import type { Company, CompanyRequest } from "@/lib/types";
import {
  fetchAdminCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../services/masterDataService";
import { useClientPagination } from "../hooks/useClientPagination";
import { Modal } from "@/components/tabler";

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
      const data = await fetchAdminCompanies();
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
    <div className="card">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h3 className="card-title mb-0">Companies ({totalItems})</h3>
        <div className="d-flex align-items-center gap-2">
          <div className="input-icon">
            <span className="input-icon-addon">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search companies..."
              className="form-control form-control-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            data-testid="create-companies-btn"
            onClick={() => {
              setForm({ code: "", name: "" });
              setModalOpen(true);
            }}
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 text-nowrap"
          >
            <IconPlus size={16} /> Add Company
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
            <table className="table table-vcenter card-table table-hover" data-testid="companies-table">
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
                      Company Name{" "}
                      {sortKey === "name" &&
                        (sortDir === "asc" ? (
                          <IconChevronUp size={14} />
                        ) : (
                          <IconChevronDown size={14} />
                        ))}
                    </div>
                  </th>
                  <th className="w-1 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((c) => (
                  <tr key={c.id}>
                    <td className="font-monospace fw-bold text-uppercase">{c.code}</td>
                    <td className="fw-semibold">{c.name}</td>
                    <td>
                      <div className="btn-list justify-content-end flex-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ id: c.id, code: c.code, name: c.name });
                            setModalOpen(true);
                          }}
                          className="btn btn-sm btn-icon btn-outline-secondary"
                          title="Edit"
                        >
                          <IconPencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.name)}
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
                    <td colSpan={3} className="text-center py-4 text-secondary">
                      No companies found.
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
        title={form.id ? "Edit Company" : "Add Company"}
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
              Save Company
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label required">Company Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. BNI, MII"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label required">Company Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. PT Bank Negara Indonesia"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
