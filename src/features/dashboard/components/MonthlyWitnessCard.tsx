"use client";

import {
  IconAlertTriangle,
  IconShieldCheck,
  IconLock,
  IconPencil,
  IconUserPlus,
  IconCheck,
  IconClock,
  IconSend,
  IconLoader2,
  IconArrowBackUp,
} from "@tabler/icons-react";
import type { WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";

interface MonthlyWitnessCardProps {
  month: number;
  year: number;
  monthlyWitness?: WitnessResponse;
  beritaAcaraStatus?: BeritaAcaraStatusResponse | null;
  beritaAcaraCount?: number;
  submittingBA?: boolean;
  onSubmitBeritaAcara?: () => void;
  onRevokeBeritaAcara?: () => Promise<void> | void;
  revokingBA?: boolean;
  onOpenUnsignedModal?: () => void;
  onOpenWitnessModal?: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MonthlyWitnessCard({
  month,
  year,
  monthlyWitness,
  beritaAcaraStatus,
  beritaAcaraCount = 0,
  submittingBA = false,
  onSubmitBeritaAcara,
  onRevokeBeritaAcara,
  revokingBA = false,
  onOpenUnsignedModal,
  onOpenWitnessModal,
}: Readonly<MonthlyWitnessCardProps>) {
  const monthName = MONTH_NAMES[month - 1] || `Month ${month}`;

  const isBaSigned =
    beritaAcaraStatus?.status === "signed" || beritaAcaraStatus?.status === "approved";
  const isBaPending =
    beritaAcaraStatus?.status === "pending_witness" || beritaAcaraStatus?.status === "submitted";
  const isBaRejected = beritaAcaraStatus?.status === "rejected";
  const isLocked = isBaSigned || isBaPending;

  if (!monthlyWitness) {
    return (
      <div className="card border-warning-subtle shadow-sm mb-3">
        <div className="card-body p-3 p-sm-4 bg-warning-subtle rounded d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span
              className="avatar bg-warning text-white rounded-circle shrink-0"
              style={{ minWidth: 44, minHeight: 44 }}
              aria-hidden="true"
            >
              <IconAlertTriangle size={22} aria-hidden="true" />
            </span>
            <div>
              <h4 className="fw-bold text-dark mb-1">
                No Witness Assigned for {monthName} {year}
              </h4>
              <p className="text-secondary small mb-0">
                A designated witness is required to review and sign off on all Attendance Incident Reports (Berita Acara).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenWitnessModal}
            className="btn btn-warning text-dark fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm shrink-0"
            style={{ minHeight: 44 }}
          >
            <IconUserPlus size={18} aria-hidden="true" />
            <span>Select Monthly Witness</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-slate-200 mb-3">
      <div className="card-body p-3 p-sm-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <span
            className="avatar bg-green-lt text-green rounded-circle shrink-0"
            style={{ minWidth: 44, minHeight: 44 }}
            aria-hidden="true"
          >
            <IconShieldCheck size={24} aria-hidden="true" />
          </span>
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
              <span className="small text-secondary fw-bold text-uppercase">
                Designated Monthly Witness
              </span>
              <span className="badge bg-green-lt text-green d-inline-flex align-items-center gap-1 font-weight-medium">
                <IconLock size={12} aria-hidden="true" />
                <span>Locked Witness for {monthName} {year}</span>
              </span>

              {/* Berita Acara Status Pill (Single Source of Truth) */}
              {beritaAcaraCount > 0 && (
                <>
                  {isBaSigned && (
                    <span className="badge bg-green-lt text-green d-inline-flex align-items-center gap-1 font-weight-medium">
                      <IconCheck size={12} aria-hidden="true" />
                      <span>
                        {beritaAcaraCount} {beritaAcaraCount === 1 ? "Report" : "Reports"} Signed
                      </span>
                    </span>
                  )}
                  {isBaPending && (
                    <span className="badge bg-azure-lt text-azure d-inline-flex align-items-center gap-1 font-weight-medium">
                      <IconClock size={12} aria-hidden="true" />
                      <span>
                        {beritaAcaraCount} {beritaAcaraCount === 1 ? "Report" : "Reports"} Awaiting Witness
                      </span>
                    </span>
                  )}
                  {isBaRejected && (
                    <span className="badge bg-danger-lt text-danger d-inline-flex align-items-center gap-1 font-weight-medium">
                      <IconAlertTriangle size={12} aria-hidden="true" />
                      <span>
                        {beritaAcaraCount} {beritaAcaraCount === 1 ? "Report" : "Reports"} Rejected
                      </span>
                    </span>
                  )}
                  {!isBaSigned && !isBaPending && !isBaRejected && (
                    <span className="badge bg-warning-lt text-warning d-inline-flex align-items-center gap-1 font-weight-medium">
                      <IconAlertTriangle size={12} aria-hidden="true" />
                      <span>
                        {beritaAcaraCount} {beritaAcaraCount === 1 ? "Report" : "Reports"} Pending Submission
                      </span>
                    </span>
                  )}
                </>
              )}
            </div>

            <h3 className="card-title h2 mb-1 fw-bold text-slate-900 d-flex align-items-center flex-wrap gap-2">
              <span>{monthlyWitness.name}</span>
              {(monthlyWitness.division || monthlyWitness.employee_id) && (
                <span className="small text-muted fw-normal">
                  ({monthlyWitness.division || monthlyWitness.employee_id})
                </span>
              )}
            </h3>
            <p className="text-secondary small mb-0">
              All daily Attendance Incident Reports (Berita Acara) for {monthName} {year} automatically inherit this witness.
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center flex-wrap gap-2 shrink-0">
          {/* Action button if Berita Acara needs submission */}
          {beritaAcaraCount > 0 && !isBaSigned && !isBaPending && !isBaRejected && (
            <button
              type="button"
              onClick={() => {
                if (onSubmitBeritaAcara) onSubmitBeritaAcara();
                else if (onOpenUnsignedModal) onOpenUnsignedModal();
              }}
              disabled={submittingBA}
              className="btn btn-warning btn-sm text-dark fw-bold d-inline-flex align-items-center justify-content-center gap-1.5"
            >
              {submittingBA ? (
                <IconLoader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <IconSend size={14} aria-hidden="true" />
              )}
              <span>
                Submit to Witness ({beritaAcaraCount} {beritaAcaraCount === 1 ? "day" : "days"})
              </span>
            </button>
          )}

          {/* Action button if Berita Acara is pending witness signature (pembatalan pengajuan tanda tangan) */}
          {beritaAcaraCount > 0 && isBaPending && onRevokeBeritaAcara && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Cancel witness signature request for this period's incident reports?"
                  )
                ) {
                  onRevokeBeritaAcara();
                }
              }}
              disabled={revokingBA}
              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
              title="Cancel witness signature request and revert incident reports to draft"
            >
              {revokingBA ? (
                <IconLoader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <IconArrowBackUp size={14} aria-hidden="true" />
              )}
              <span>Cancel Witness Request</span>
            </button>
          )}

          {/* Action button if Berita Acara is signed (pembatalan tanda tangan Berita Acara) */}
          {beritaAcaraCount > 0 && isBaSigned && onRevokeBeritaAcara && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Revoke digital signature for these incident reports? Status will revert to draft."
                  )
                ) {
                  onRevokeBeritaAcara();
                }
              }}
              disabled={revokingBA}
              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
              title="Revoke incident report signature and unlock editing"
            >
              {revokingBA ? (
                <IconLoader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <IconArrowBackUp size={14} aria-hidden="true" />
              )}
              <span>Revoke BA Signature</span>
            </button>
          )}

          {/* Action button if Berita Acara is rejected */}
          {beritaAcaraCount > 0 && isBaRejected && onOpenWitnessModal && (
            <button
              type="button"
              onClick={onOpenWitnessModal}
              className="btn btn-danger btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
            >
              <IconAlertTriangle size={14} aria-hidden="true" />
              <span>View Revision Notes</span>
            </button>
          )}

          {/* Change Witness Button */}
          {isLocked ? (
            <span
              className="badge bg-secondary-lt text-secondary py-1.5 px-2.5 d-inline-flex align-items-center gap-1.5"
              title="Witness is locked while attendance incident reports are under review or signed."
            >
              <IconLock size={14} aria-hidden="true" />
              <span>Witness Locked</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenWitnessModal}
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
              title="Change the designated witness for this month"
            >
              <IconPencil size={14} aria-hidden="true" />
              <span>Change Witness</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
