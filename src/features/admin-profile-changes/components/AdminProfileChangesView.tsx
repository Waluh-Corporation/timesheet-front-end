"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  IconCheck,
  IconX,
  IconSearch,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconRotateClockwise,
  IconCalendar,
  IconClipboardList,
} from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import type { AdminProfileChange } from "@/lib/types";
import { PageHeader, Modal } from "@/components/tabler";
import {
  fetchAdminProfileChanges,
  reviewProfileChange,
} from "../services/adminProfileChangesService";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export function AdminProfileChangesView() {
  const { notify } = useToast();
  const [changes, setChanges] = useState<AdminProfileChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  // Modal review confirmation state
  const [confirmModal, setConfirmModal] = useState<{
    change: AdminProfileChange;
    action: "approve" | "reject";
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filterParam = statusFilter === "all" ? undefined : statusFilter;
      const data = await fetchAdminProfileChanges(filterParam);
      setChanges(data || []);
    } catch (err: any) {
      notify(err.message || "Failed to load profile changes", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const pending = changes.filter((c) => c.status === "pending").length;
    const approved = changes.filter((c) => c.status === "approved").length;
    const rejected = changes.filter((c) => c.status === "rejected").length;
    return {
      total: changes.length,
      pending,
      approved,
      rejected,
    };
  }, [changes]);

  const filteredChanges = useMemo(() => {
    if (!searchQuery.trim()) return changes;
    const q = searchQuery.toLowerCase();
    return changes.filter((c) => {
      return (
        (c.user_name && c.user_name.toLowerCase().includes(q)) ||
        (c.user_email && c.user_email.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.employee_id && c.employee_id.toLowerCase().includes(q)) ||
        (c.bni_id && c.bni_id.toLowerCase().includes(q)) ||
        (c.division && c.division.toLowerCase().includes(q)) ||
        (c.department && c.department.toLowerCase().includes(q)) ||
        (c.site && c.site.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    });
  }, [changes, searchQuery]);

  const handleReview = async (id: number, action: "approve" | "reject") => {
    setReviewingId(id);
    try {
      await reviewProfileChange(id, action);
      notify(`Profile change #${id} has been ${action}d successfully.`, "success");
      setConfirmModal(null);
      loadData();
    } catch (err: any) {
      notify(err.message || `Failed to ${action} request`, "error");
    } finally {
      setReviewingId(null);
    }
  };

  const statusBadge = (s: AdminProfileChange["status"]) => {
    switch (s) {
      case "pending":
        return (
          <span className="badge bg-warning-lt d-inline-flex align-items-center gap-1 text-uppercase">
            <IconClock size={12} /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="badge bg-success-lt d-inline-flex align-items-center gap-1 text-uppercase">
            <IconCircleCheck size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="badge bg-danger-lt d-inline-flex align-items-center gap-1 text-uppercase">
            <IconCircleX size={12} /> Rejected
          </span>
        );
      default:
        return <span className="badge bg-secondary-lt text-uppercase">{s}</span>;
    }
  };

  return (
    <div>
      <PageHeader
        pretitle="Admin Review"
        title="Profile Change Requests"
        description="Review and approve self-service employee profile update requests."
        actions={
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
          >
            <IconRotateClockwise size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="row row-cards mb-4">
        <div className="col-6 col-sm-3">
          <div className="card">
            <div className="card-body">
              <div className="text-secondary text-uppercase fw-bold small">Total Shown</div>
              <div className="h1 mb-0 mt-1">{stats.total}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-3">
          <div
            className={`card cursor-pointer ${
              statusFilter === "pending" ? "border-warning shadow-sm" : ""
            }`}
            onClick={() => setStatusFilter("pending")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="text-secondary text-uppercase fw-bold small">Pending</div>
                <IconClock size={18} className="text-warning" />
              </div>
              <div className="h1 text-warning mb-0 mt-1">{stats.pending}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-3">
          <div
            className={`card cursor-pointer ${
              statusFilter === "approved" ? "border-success shadow-sm" : ""
            }`}
            onClick={() => setStatusFilter("approved")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="text-secondary text-uppercase fw-bold small">Approved</div>
                <IconCircleCheck size={18} className="text-success" />
              </div>
              <div className="h1 text-success mb-0 mt-1">{stats.approved}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-3">
          <div
            className={`card cursor-pointer ${
              statusFilter === "rejected" ? "border-danger shadow-sm" : ""
            }`}
            onClick={() => setStatusFilter("rejected")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="text-secondary text-uppercase fw-bold small">Rejected</div>
                <IconCircleX size={18} className="text-danger" />
              </div>
              <div className="h1 text-danger mb-0 mt-1">{stats.rejected}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center justify-content-between">
            <div className="col-auto">
              <div className="btn-group" role="group">
                {(["pending", "all", "approved", "rejected"] as StatusFilter[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`btn btn-sm text-uppercase ${
                      statusFilter === st ? "btn-primary" : "btn-outline-secondary"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-12 col-sm-auto">
              <div className="input-icon">
                <span className="input-icon-addon">
                  <IconSearch size={16} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search user, email, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      ) : filteredChanges.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="text-secondary mb-2">
              <IconClipboardList size={40} className="opacity-50" />
            </div>
            <h3 className="card-title">No Profile Requests Found</h3>
            <div className="text-secondary small">
              {searchQuery
                ? "No requests matched your search query."
                : `There are currently no ${
                    statusFilter !== "all" ? statusFilter : ""
                  } profile change requests.`}
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredChanges.map((c) => (
            <div key={c.id} className="card">
              <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <span className="avatar avatar-md bg-primary-lt text-primary fw-bold">
                    {(c.user_name || "U").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">{c.user_name || `User #${c.user_id}`}</span>
                      <span className="text-secondary small">
                        ({c.user_email || `ID: ${c.user_id}`})
                      </span>
                    </div>
                    <div className="text-secondary small d-flex align-items-center gap-1 mt-1">
                      <IconCalendar size={14} />
                      Submitted {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {statusBadge(c.status)}
                  {c.status === "pending" && (
                    <div className="btn-group">
                      <button
                        type="button"
                        onClick={() => setConfirmModal({ change: c, action: "approve" })}
                        disabled={reviewingId === c.id}
                        className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                      >
                        <IconCheck size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmModal({ change: c, action: "reject" })}
                        disabled={reviewingId === c.id}
                        className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                      >
                        <IconX size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-body">
                {/* Proposed Fields Grid */}
                <div className="bg-light p-3 rounded mb-3">
                  <div className="row g-2 small">
                    {c.name && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">Proposed Name</div>
                        <div className="fw-semibold">{c.name}</div>
                      </div>
                    )}
                    {c.email && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">Proposed Email</div>
                        <div className="fw-semibold">{c.email}</div>
                      </div>
                    )}
                    {c.employee_id && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">Employee ID</div>
                        <div className="fw-semibold">{c.employee_id}</div>
                      </div>
                    )}
                    {c.bni_id && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">BNI ID</div>
                        <div className="fw-semibold">{c.bni_id}</div>
                      </div>
                    )}
                    {c.division && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">Division</div>
                        <div className="fw-semibold">{c.division}</div>
                      </div>
                    )}
                    {c.department && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">Department</div>
                        <div className="fw-semibold">{c.department}</div>
                      </div>
                    )}
                    {c.site && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">Site</div>
                        <div className="fw-semibold">{c.site}</div>
                      </div>
                    )}
                    {c.company_id && (
                      <div className="col-6 col-md-3">
                        <div className="text-secondary text-uppercase fw-bold fs-6">Company ID</div>
                        <div className="fw-semibold">Company #{c.company_id}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes / Reason */}
                {c.notes && (
                  <div className="alert alert-info py-2 px-3 mb-0 small">
                    <div className="fw-bold text-uppercase fs-6 mb-1">Reason / Notes:</div>
                    <div className="fst-italic">{c.notes}</div>
                  </div>
                )}
              </div>

              {/* Review History Footer if reviewed */}
              {c.reviewed_at && (
                <div className="card-footer small text-secondary d-flex justify-content-between">
                  <span>
                    Reviewed by <strong className="text-dark">{c.reviewer_name || `Admin #${c.reviewed_by}`}</strong>
                  </span>
                  <span>{new Date(c.reviewed_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmModal(null)}
          title={`${confirmModal.action === "approve" ? "Approve" : "Reject"} Profile Change?`}
          footer={
            <>
              <button
                type="button"
                className="btn btn-link link-secondary"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewingId === confirmModal.change.id}
                onClick={() => handleReview(confirmModal.change.id, confirmModal.action)}
                className={`btn ${
                  confirmModal.action === "approve" ? "btn-success" : "btn-danger"
                } d-inline-flex align-items-center gap-1`}
              >
                {reviewingId === confirmModal.change.id && (
                  <span className="spinner-border spinner-border-sm" role="status" />
                )}
                Confirm {confirmModal.action === "approve" ? "Approval" : "Rejection"}
              </button>
            </>
          }
        >
          <div>
            <p className="mb-2">
              Are you sure you want to <strong>{confirmModal.action}</strong> request #
              {confirmModal.change.id} submitted by <strong>{confirmModal.change.user_name}</strong>?
            </p>
            <div className="bg-light p-3 rounded small">
              <div className="fw-bold mb-1">Summary of changes:</div>
              <ul className="mb-0 ps-3">
                {confirmModal.change.name && <li>Name: {confirmModal.change.name}</li>}
                {confirmModal.change.email && <li>Email: {confirmModal.change.email}</li>}
                {confirmModal.change.employee_id && (
                  <li>Employee ID: {confirmModal.change.employee_id}</li>
                )}
                {confirmModal.change.bni_id && <li>BNI ID: {confirmModal.change.bni_id}</li>}
                {confirmModal.change.division && <li>Division: {confirmModal.change.division}</li>}
                {confirmModal.change.department && (
                  <li>Department: {confirmModal.change.department}</li>
                )}
                {confirmModal.change.site && <li>Site: {confirmModal.change.site}</li>}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
