"use client";

import { useState } from "react";
import {
  IconShieldCheck,
  IconCheck,
  IconX,
  IconLoader2,
  IconCalendar,
  IconUser,
  IconFileCertificate,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Modal } from "@/components/tabler";
import { useToast } from "@/components/Toast";
import { witnessAction } from "@/services/beritaAcaraService";
import type { WitnessRequestItem } from "@/lib/types";

interface WitnessReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: WitnessRequestItem[];
  onActionCompleted: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function WitnessReviewModal({
  isOpen,
  onClose,
  requests,
  onActionCompleted,
}: Readonly<WitnessReviewModalProps>) {
  const { notify } = useToast();
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string | number, string>>({});

  const handleApprove = async (id: string | number) => {
    setProcessingId(id);
    try {
      await witnessAction(id, "approve");
      notify("Incident Report signed and approved as witness! ✍️", "success");
      onActionCompleted();
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : "Failed to sign Incident Report",
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
      notify("Incident Report has been rejected with revision notes", "info");
      setRejectingId(null);
      onActionCompleted();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <div className="avatar avatar-xs bg-primary-lt rounded">
            <IconShieldCheck size={18} className="text-primary" />
          </div>
          <span className="fw-bold">Witness Review - Attendance Incident Reports</span>
        </div>
      }
      size="lg"
      footer={
        <button type="button" className="btn btn-outline-secondary ms-auto" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="d-flex flex-column gap-3">
        {requests.length === 0 ? (
          <div className="text-center py-4">
            <div className="avatar avatar-md bg-success-lt rounded-circle mb-3">
              <IconCheck size={28} className="text-success" />
            </div>
            <h4 className="fw-bold mb-1">No Pending Requests</h4>
            <p className="text-secondary small mb-0">
              All attendance incident reports requesting your witness signature have been reviewed.
            </p>
          </div>
        ) : (
          <>
            <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-1">
              <IconAlertCircle size={18} className="text-info flex-shrink-0" />
              <span>
                You have been designated as witness for <strong>{requests.length}</strong> monthly incident report(s). Please review and provide your approval signature.
              </span>
            </div>

            <div className="list-group list-group-flush border rounded">
              {requests.map((item) => {
                const monthName = MONTH_NAMES[(item.month ?? 1) - 1] || `Month ${item.month}`;
                const isProcessing = processingId === item.id;
                const isRejecting = rejectingId === item.id;

                return (
                  <div key={item.id} className="list-group-item p-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <IconUser size={16} className="text-primary" />
                          <span className="fw-bold fs-3 text-body">{item.user_name || "Employee"}</span>
                        </div>
                        <div className="text-secondary small d-flex align-items-center gap-2 mt-1">
                          <IconCalendar size={14} />
                          <span>
                            Period: <strong>{monthName} {item.year}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Submitted: {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString("en-US", { dateStyle: "medium" }) : "-"}
                          </span>
                        </div>
                      </div>
                      <span className="badge bg-warning-lt text-capitalize px-2 py-1">
                        Awaiting Witness Signature
                      </span>
                    </div>

                    {item.notes && (
                      <div className="bg-light p-2 rounded small text-secondary mb-3">
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}

                    {isRejecting ? (
                      <div className="bg-danger-subtle p-3 rounded border border-danger-subtle mt-2">
                        <label className="form-label small fw-bold text-danger mb-1" htmlFor={`reject-notes-${item.id}`}>
                          Reason / Revision Notes for {item.user_name || "Requester"}:
                        </label>
                        <textarea
                          id={`reject-notes-${item.id}`}
                          className="form-control form-control-sm mb-2"
                          rows={2}
                          placeholder="e.g.: Please correct the entries on the 15th because activity description is incomplete"
                          value={rejectNotes[item.id] || ""}
                          onChange={(e) =>
                            setRejectNotes((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          disabled={isProcessing}
                        ></textarea>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setRejectingId(null)}
                            disabled={isProcessing}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                            onClick={() => handleReject(item.id)}
                            disabled={isProcessing || !rejectNotes[item.id]?.trim()}
                          >
                            {isProcessing ? (
                              <IconLoader2 size={14} className="animate-spin" />
                            ) : (
                              <IconX size={14} />
                            )}
                            Send Rejection
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-end gap-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => setRejectingId(item.id)}
                          disabled={isProcessing}
                        >
                          <IconX size={14} /> Reject / Request Revision
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-success d-flex align-items-center gap-1"
                          onClick={() => handleApprove(item.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <IconLoader2 size={14} className="animate-spin" />
                          ) : (
                            <IconCheck size={14} />
                          )}
                          Sign & Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
