"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconShieldCheck,
  IconCheck,
  IconX,
  IconCalendar,
  IconUser,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/tabler";
import { useToast } from "@/components/Toast";
import { witnessAction } from "@/services/beritaAcaraService";
import {
  usePendingWitnessRequestsQuery,
  WITNESS_REQUESTS_KEY,
} from "@/services/queries/useWitnessQueries";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function WitnessRequestsPage() {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const {
    data: requests = [],
    isLoading: loading,
    refetch,
    isFetching,
  } = usePendingWitnessRequestsQuery();

  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string | number, string>>({});

  const loadRequests = async () => {
    await refetch();
  };

  const handleApprove = async (id: string | number) => {
    setProcessingId(id);
    try {
      await witnessAction(id, "approve");
      notify("Attendance Incident Report approved & signed as witness! ✍️", "success");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WITNESS_REQUESTS_KEY }),
        queryClient.invalidateQueries({ queryKey: ["berita-acara-status"] }),
      ]);
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : "Failed to sign Attendance Incident Report",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string | number) => {
    const notes = rejectNotes[id]?.trim();
    if (!notes) {
      notify("Please provide revision notes explaining the rejection reason", "error");
      return;
    }

    setProcessingId(id);
    try {
      await witnessAction(id, "reject", notes);
      notify("Attendance Incident Report has been rejected with revision notes", "info");
      setRejectingId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WITNESS_REQUESTS_KEY }),
        queryClient.invalidateQueries({ queryKey: ["berita-acara-status"] }),
      ]);
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : "Failed to process rejection",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        pretitle="Attendance Incident Report"
        title="Witness Signature Requests"
        description="List of Attendance Incident Reports from colleagues designating you as their monthly witness."
        actions={
          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            title="Refresh list"
          >
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        }
      />

      <div className="card shadow-sm">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="avatar avatar-xs bg-primary-lt rounded text-primary">
              <IconShieldCheck size={18} />
            </span>
            <h3 className="card-title m-0">Witness Verification Queue</h3>
          </div>
          <span className="badge bg-blue-lt">
            {requests.length} Pending Requests
          </span>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-5 text-secondary">
              <div className="spinner-border spinner-border-sm me-2" role="status" />
              Checking witness signature requests queue...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5">
              <div className="avatar avatar-lg bg-success-lt rounded-circle mb-3">
                <IconCheck size={36} className="text-success" />
              </div>
              <h3 className="fw-bold mb-1">No Pending Witness Requests</h3>
              <p className="text-secondary small mb-0">
                All Attendance Incident Reports designating you as witness have been reviewed and signed.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                <IconAlertCircle size={20} className="text-info flex-shrink-0" />
                <span>
                  Below are Attendance Incident Reports requiring your signature as witness before your colleagues can generate their monthly timesheet.
                </span>
              </div>

              <div className="list-group list-group-flush border rounded">
                {requests.map((req) => {
                  const isProcessing = processingId === req.id;
                  const isRejecting = rejectingId === req.id;
                  const monthName = MONTH_NAMES[(req.month || 1) - 1] || req.month;
                  const employeeName = req.user_name || req.user?.name || `Employee #${req.user_id}`;

                  return (
                    <div key={req.id} className="list-group-item p-3">
                      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-2">
                            <span className="avatar avatar-sm bg-primary-lt text-primary fw-bold rounded">
                              <IconUser size={18} />
                            </span>
                            <div>
                              <div className="fw-bold fs-3 text-body">{employeeName}</div>
                              <div className="text-secondary small d-flex align-items-center gap-2 flex-wrap">
                                <span className="d-inline-flex align-items-center gap-1">
                                  <IconCalendar size={14} />
                                  Period: <strong>{monthName} {req.year}</strong>
                                </span>
                                {req.submitted_at && (
                                  <span>
                                    • Submitted: {new Date(req.submitted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {req.notes && (
                            <div className="mt-2 p-2 bg-body-tertiary rounded small text-secondary">
                              <strong>Requester Notes:</strong> {req.notes}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="d-flex align-items-center gap-2 align-self-start align-self-md-center">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleApprove(req.id)}
                            disabled={isProcessing}
                          >
                            <IconCheck size={16} />
                            <span>
                              {isProcessing ? "Signing..." : "Sign & Approve"}
                            </span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                            onClick={() => setRejectingId(isRejecting ? null : req.id)}
                            disabled={isProcessing}
                          >
                            <IconX size={16} />
                            <span>{isRejecting ? "Cancel" : "Reject"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Rejection input form */}
                      {isRejecting && (
                        <div className="mt-3 p-3 border border-danger-subtle rounded bg-danger-subtle bg-opacity-10">
                          <label htmlFor={`reject-notes-${req.id}`} className="form-label text-danger fw-bold small mb-1">
                            Rejection Reason Notes for {employeeName}:
                          </label>
                          <textarea
                            id={`reject-notes-${req.id}`}
                            className="form-control mb-2"
                            rows={2}
                            placeholder="e.g. Please clarify the activity description on the 15th..."
                            value={rejectNotes[req.id] || ""}
                            onChange={(e) =>
                              setRejectNotes((prev) => ({
                                ...prev,
                                [req.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setRejectingId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                              onClick={() => handleReject(req.id)}
                              disabled={isProcessing}
                            >
                              <IconX size={14} />
                              <span>Send Rejection</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
