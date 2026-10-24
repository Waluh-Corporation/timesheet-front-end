"use client";

import { Modal } from "@/components/tabler";
import {
  IconAlertTriangle,
  IconClock,
  IconSend,
  IconLoader2,
  IconUser,
  IconShieldCheck,
  IconArrowBackUp,
} from "@tabler/icons-react";
import type { DailyActivity, WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";
import { formatLocalDate } from "@/lib/date";

interface UnsignedBeritaAcaraModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  monthlyWitness?: WitnessResponse;
  unsignedActivities: DailyActivity[];
  beritaAcaraStatus?: BeritaAcaraStatusResponse | null;
  onSubmitBeritaAcara?: () => Promise<void>;
  submittingBA?: boolean;
  onRevokeBeritaAcara?: () => Promise<void> | void;
  revokingBA?: boolean;
  onOpenWitnessModal?: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function UnsignedBeritaAcaraModal({
  isOpen,
  onClose,
  month,
  year,
  monthlyWitness,
  unsignedActivities,
  beritaAcaraStatus,
  onSubmitBeritaAcara,
  submittingBA,
  onRevokeBeritaAcara,
  revokingBA = false,
  onOpenWitnessModal,
}: Readonly<UnsignedBeritaAcaraModalProps>) {
  const monthLabel = MONTH_NAMES[month - 1] || `Month ${month}`;
  const witnessName =
    beritaAcaraStatus?.witness_name ||
    monthlyWitness?.name ||
    "Designated Witness";

  const isBaPending =
    beritaAcaraStatus?.status === "pending_witness" || beritaAcaraStatus?.status === "submitted";
  const isBaRejected = beritaAcaraStatus?.status === "rejected";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2 text-danger">
          <IconAlertTriangle size={22} className="shrink-0" />
          <span>Cannot Generate Timesheet</span>
        </div>
      }
      size="lg"
      footer={
        <div className="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline-secondary">
            Close
          </button>
          <div className="d-flex gap-2">
            {onOpenWitnessModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWitnessModal();
                }}
                className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <IconShieldCheck size={16} />
                <span>Witness Settings</span>
              </button>
            )}
            {!isBaPending && onSubmitBeritaAcara && (
              <button
                type="button"
                onClick={async () => {
                  await onSubmitBeritaAcara();
                  onClose();
                }}
                disabled={submittingBA || !monthlyWitness}
                className="btn btn-primary d-inline-flex align-items-center gap-1"
              >
                {submittingBA ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconSend size={16} />
                )}
                <span>Submit to Witness ({witnessName})</span>
              </button>
            )}
            {isBaPending && onRevokeBeritaAcara && (
              <button
                type="button"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Cancel witness signature request for this period's incident reports?"
                    )
                  ) {
                    await onRevokeBeritaAcara();
                    onClose();
                  }
                }}
                disabled={revokingBA}
                className="btn btn-outline-danger d-inline-flex align-items-center gap-1"
              >
                {revokingBA ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconArrowBackUp size={16} />
                )}
                <span>Cancel Witness Request</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="d-flex flex-column gap-3">
        {/* Banner Alert explaining the guard */}
        <div className="alert alert-warning border-warning d-flex align-items-start gap-3 mb-0" role="alert">
          <IconAlertTriangle size={24} className="text-warning shrink-0 mt-0.5" />
          <div className="small">
            <div className="fw-bold fs-4 mb-1">Witness Signature Guard Active</div>
            <p className="mb-1 text-secondary">
              The backend requires all <strong>Attendance Incident Reports (Berita Acara)</strong> for{" "}
              <strong>{monthLabel} {year}</strong> to be digitally signed and approved by the designated witness (
              <strong>{witnessName}</strong>) before the monthly timesheet can be generated.
            </p>
            {isBaPending ? (
              <div className="text-info fw-semibold d-flex align-items-center gap-1 mt-2">
                <IconClock size={16} />
                <span>Status: Currently awaiting signature from {witnessName}.</span>
              </div>
            ) : isBaRejected ? (
              <div className="text-danger fw-semibold mt-2">
                Status: Rejected by {witnessName} with revision note: &ldquo;
                {beritaAcaraStatus?.witness_rejection_notes || "Please review activity records"}
                &rdquo;.
              </div>
            ) : (
              <div className="text-warning-emphasis fw-semibold mt-2">
                Status: Berita Acara is in Draft status and has not yet been submitted to the witness.
              </div>
            )}
          </div>
        </div>

        {/* List of affected attendance incident dates */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold small text-uppercase text-secondary">
              Pending Attendance Incident {unsignedActivities.length === 1 ? "Report" : "Reports"} ({unsignedActivities.length})
            </span>
            <span className="small text-secondary">
              <IconUser size={14} className="me-1 inline" />
              Witness: <strong>{witnessName}</strong>
            </span>
          </div>

          <div className="table-responsive border rounded">
            <table className="table table-vcenter table-sm card-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Date</th>
                  <th>Attendance Incident Reason</th>
                  <th style={{ width: "20%" }}>Report Status</th>
                </tr>
              </thead>
              <tbody>
                {unsignedActivities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-3">
                      No attendance incidents logged for this month.
                    </td>
                  </tr>
                ) : (
                  unsignedActivities.map((act) => (
                    <tr key={act.id || act.date}>
                      <td className="fw-semibold text-nowrap">
                        {formatLocalDate(act.date)}
                      </td>
                      <td className="small">
                        {act.berita_acara_notes || "Attendance discrepancy / missed clock-in"}
                      </td>
                      <td>
                        {isBaPending ? (
                          <span className="badge bg-azure-lt text-azure">
                            Awaiting Signature
                          </span>
                        ) : isBaRejected ? (
                          <span className="badge bg-danger-lt text-danger">
                            Rejected
                          </span>
                        ) : (
                          <span className="badge bg-yellow-lt text-yellow">
                            Draft (Unsubmitted)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
