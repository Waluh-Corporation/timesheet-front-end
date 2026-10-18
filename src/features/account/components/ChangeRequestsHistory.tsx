"use client";

import type { ProfileChangeRequest } from "@/lib/types";

interface ChangeRequestsHistoryProps {
  changes: ProfileChangeRequest[];
  loading: boolean;
}

export function ChangeRequestsHistory({ changes, loading }: ChangeRequestsHistoryProps) {
  const getStatusBadge = (s: ProfileChangeRequest["status"]) => {
    switch (s) {
      case "approved":
        return <span className="badge bg-success-lt text-uppercase">Approved</span>;
      case "rejected":
        return <span className="badge bg-danger-lt text-uppercase">Rejected</span>;
      case "pending":
      default:
        return <span className="badge bg-warning-lt text-uppercase">Pending</span>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">Change Requests History</h3>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : changes.length === 0 ? (
          <div className="text-secondary small">No profile change requests submitted yet.</div>
        ) : (
          <div className="d-flex flex-col gap-3">
            {changes.map((c) => (
              <div key={c.id} className="card card-stacked">
                <div className="card-body">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">Request #{c.id}</span>
                      <span className="text-secondary small">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  <div className="row g-2 pt-2 small">
                    {c.name && (
                      <div className="col-6 col-md-3">
                        <span className="text-secondary fw-semibold">Name:</span> {c.name}
                      </div>
                    )}
                    {c.email && (
                      <div className="col-6 col-md-3">
                        <span className="text-secondary fw-semibold">Email:</span> {c.email}
                      </div>
                    )}
                    {(c.employee_id || c.mii_id) && (
                      <div className="col-6 col-md-3">
                        <span className="text-secondary fw-semibold">Employee ID:</span>{" "}
                        {c.employee_id || c.mii_id}
                      </div>
                    )}
                    {c.bni_id && (
                      <div className="col-6 col-md-3">
                        <span className="text-secondary fw-semibold">BNI ID:</span> {c.bni_id}
                      </div>
                    )}
                    {c.division && (
                      <div className="col-6 col-md-3">
                        <span className="text-secondary fw-semibold">Division:</span> {c.division}
                      </div>
                    )}
                    {c.department && (
                      <div className="col-6 col-md-3">
                        <span className="text-secondary fw-semibold">Department:</span> {c.department}
                      </div>
                    )}
                    {c.site && (
                      <div className="col-6 col-md-3">
                        <span className="text-secondary fw-semibold">Site:</span> {c.site}
                      </div>
                    )}
                  </div>

                  {c.notes && (
                    <div className="alert alert-info py-2 px-3 mt-3 mb-1 small">
                      <div className="fw-bold text-uppercase fs-6 mb-1">Reason / Notes:</div>
                      <div className="fst-italic">{c.notes}</div>
                    </div>
                  )}

                  {c.reviewed_at && (
                    <div className="text-secondary small mt-2">
                      Reviewed by{" "}
                      <span className="fw-semibold">{c.reviewer_name || `Admin #${c.reviewed_by}`}</span> on{" "}
                      {new Date(c.reviewed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
