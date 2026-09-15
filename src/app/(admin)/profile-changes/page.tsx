"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  ClipboardList,
  Check,
  X,
  Loader2,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import type { AdminProfileChange } from "@/lib/types";
import { fetchAdminProfileChanges, reviewProfileChange } from "@/services/profileChange";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminProfileChangesPage() {
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
      // If "all", fetch without filter; else pass filter
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

  // Quick stats computed from current or all
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

  // Filtered by search query
  const filteredChanges = useMemo(() => {
    if (!searchQuery.trim()) return changes;
    const q = searchQuery.toLowerCase();
    return changes.filter((c) => {
      return (
        (c.user_name && c.user_name.toLowerCase().includes(q)) ||
        (c.user_email && c.user_email.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.employee_id && c.employee_id.toLowerCase().includes(q)) ||
        (c.bni_id && c.bni_id.toLowerCase().includes(q)) ||
        (c.division && c.division.toLowerCase().includes(q)) ||
        (c.department && c.department.toLowerCase().includes(q)) ||
        (c.site && c.site.toLowerCase().includes(q))
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
          <span className="chip bg-mr-yellow text-black font-bold flex items-center gap-1">
            <Clock size={12} /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="chip bg-mr-cyan text-black font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="chip bg-mr-pink text-white font-bold flex items-center gap-1">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return <span className="chip bg-mr-surface2 text-mr-muted">{s}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center border-2 border-mr-ink bg-mr-yellow text-black">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Profile Change Requests</h1>
            <p className="text-sm text-mr-muted">
              Review and manage self-service employee profile update requests.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <RotateCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-bold uppercase text-mr-muted">Total Shown</p>
          <p className="text-2xl font-black text-mr-ink">{stats.total}</p>
        </div>
        <div
          onClick={() => setStatusFilter("pending")}
          className={`card cursor-pointer p-4 transition ${
            statusFilter === "pending" ? "ring-2 ring-mr-yellow" : "hover:bg-mr-surface2"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-mr-muted">Pending Review</p>
            <Clock size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.pending}</p>
        </div>
        <div
          onClick={() => setStatusFilter("approved")}
          className={`card cursor-pointer p-4 transition ${
            statusFilter === "approved" ? "ring-2 ring-mr-cyan" : "hover:bg-mr-surface2"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-mr-muted">Approved</p>
            <CheckCircle2 size={16} className="text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-700">{stats.approved}</p>
        </div>
        <div
          onClick={() => setStatusFilter("rejected")}
          className={`card cursor-pointer p-4 transition ${
            statusFilter === "rejected" ? "ring-2 ring-mr-pink" : "hover:bg-mr-surface2"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-mr-muted">Rejected</p>
            <XCircle size={16} className="text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["pending", "all", "approved", "rejected"] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition border-2 border-mr-ink ${
                statusFilter === st
                  ? "bg-mr-purple text-white shadow-hard-sm"
                  : "bg-mr-surface text-mr-ink hover:bg-mr-surface2"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mr-muted" />
          <input
            type="text"
            className="input pl-9 text-xs py-1.5 w-full"
            placeholder="Search by user, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="card flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-mr-purple" />
        </div>
      ) : filteredChanges.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-12 text-center">
          <ClipboardList size={40} className="text-mr-muted mb-3 opacity-40" />
          <h3 className="font-bold text-lg">No Profile Requests Found</h3>
          <p className="text-sm text-mr-muted mt-1">
            {searchQuery
              ? "No requests matched your search query."
              : `There are currently no ${statusFilter !== "all" ? statusFilter : ""} profile change requests.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredChanges.map((c) => (
            <div
              key={c.id}
              className="card p-5 flex flex-col gap-4 border-2 border-mr-ink transition hover:shadow-hard-sm"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-mr-ink/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center bg-mr-surface2 text-mr-ink font-extrabold border-2 border-mr-ink">
                    {(c.user_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base">{c.user_name || `User #${c.user_id}`}</span>
                      <span className="text-xs text-mr-muted">({c.user_email || `ID: ${c.user_id}`})</span>
                    </div>
                    <p className="text-xs text-mr-muted flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      Submitted on {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {statusBadge(c.status)}
                  {c.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmModal({ change: c, action: "approve" })}
                        disabled={reviewingId === c.id}
                        className="btn border-2 border-mr-ink bg-mr-cyan text-mr-ink font-bold text-xs py-1.5 px-3 flex items-center gap-1 hover:brightness-105"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => setConfirmModal({ change: c, action: "reject" })}
                        disabled={reviewingId === c.id}
                        className="btn border-2 border-mr-ink bg-mr-pink text-white font-bold text-xs py-1.5 px-3 flex items-center gap-1 hover:brightness-105"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposed Fields Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 bg-mr-surface2 p-3 text-xs">
                {c.name && (
                  <div>
                    <span className="font-bold text-mr-muted uppercase block text-[10px]">Proposed Name</span>
                    <span className="font-semibold text-mr-ink">{c.name}</span>
                  </div>
                )}
                {c.employee_id && (
                  <div>
                    <span className="font-bold text-mr-muted uppercase block text-[10px]">Employee ID</span>
                    <span className="font-semibold text-mr-ink">{c.employee_id}</span>
                  </div>
                )}
                {c.bni_id && (
                  <div>
                    <span className="font-bold text-mr-muted uppercase block text-[10px]">BNI ID</span>
                    <span className="font-semibold text-mr-ink">{c.bni_id}</span>
                  </div>
                )}
                {c.division && (
                  <div>
                    <span className="font-bold text-mr-muted uppercase block text-[10px]">Division</span>
                    <span className="font-semibold text-mr-ink">{c.division}</span>
                  </div>
                )}
                {c.department && (
                  <div>
                    <span className="font-bold text-mr-muted uppercase block text-[10px]">Department</span>
                    <span className="font-semibold text-mr-ink">{c.department}</span>
                  </div>
                )}
                {c.site && (
                  <div>
                    <span className="font-bold text-mr-muted uppercase block text-[10px]">Site</span>
                    <span className="font-semibold text-mr-ink">{c.site}</span>
                  </div>
                )}
                {c.company_id && (
                  <div>
                    <span className="font-bold text-mr-muted uppercase block text-[10px]">Company ID</span>
                    <span className="font-semibold text-mr-ink">Company #{c.company_id}</span>
                  </div>
                )}
              </div>

              {/* Review History Footer if reviewed */}
              {c.reviewed_at && (
                <div className="text-xs text-mr-muted flex items-center justify-between border-t border-mr-ink/20 pt-2">
                  <span>
                    Reviewed by <strong className="text-mr-ink">{c.reviewer_name || `Admin #${c.reviewed_by}`}</strong>
                  </span>
                  <span>Reviewed at {new Date(c.reviewed_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card max-w-md w-full p-6 flex flex-col gap-4 border-2 border-mr-ink bg-mr-surface shadow-hard">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 place-items-center text-white ${
                  confirmModal.action === "approve" ? "bg-emerald-600" : "bg-rose-600"
                }`}
              >
                {confirmModal.action === "approve" ? <Check size={20} /> : <X size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {confirmModal.action === "approve" ? "Approve" : "Reject"} Profile Change?
                </h3>
                <p className="text-xs text-mr-muted">
                  Request #{confirmModal.change.id} for {confirmModal.change.user_name}
                </p>
              </div>
            </div>

            <div className="bg-mr-surface2 p-3 text-xs flex flex-col gap-1.5 border border-mr-ink/20">
              <p className="font-bold">Summary of changes to apply:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-mr-muted">
                {confirmModal.change.name && <li>Name: {confirmModal.change.name}</li>}
                {confirmModal.change.employee_id && (
                  <li>Employee ID: {confirmModal.change.employee_id}</li>
                )}
                {confirmModal.change.bni_id && <li>BNI ID: {confirmModal.change.bni_id}</li>}
                {confirmModal.change.division && <li>Division: {confirmModal.change.division}</li>}
                {confirmModal.change.department && <li>Dept: {confirmModal.change.department}</li>}
                {confirmModal.change.site && <li>Site: {confirmModal.change.site}</li>}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={reviewingId !== null}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(confirmModal.change.id, confirmModal.action)}
                disabled={reviewingId !== null}
                className={`btn font-bold text-xs py-2 px-4 border-2 border-mr-ink flex items-center gap-1 text-white ${
                  confirmModal.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {reviewingId === confirmModal.change.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Confirm {confirmModal.action === "approve" ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
