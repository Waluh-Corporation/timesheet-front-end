"use client";

import { useState, useEffect } from "react";
import {
  IconLoader2,
  IconShieldCheck,
  IconUserCheck,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconArrowBackUp,
  IconSend,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/tabler";
import type { WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";
import {
  fetchEligibleWitnesses,
  updateMonthlyWitness,
} from "@/services/activityService";

interface MonthlyWitnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  currentWitness?: WitnessResponse;
  beritaAcaraCount: number;
  onWitnessUpdated: () => void;
  beritaAcaraStatus?: BeritaAcaraStatusResponse | null;
  onRevokeBeritaAcara?: () => Promise<void>;
  revokingBA?: boolean;
  onSubmitBeritaAcara?: () => Promise<void>;
  submittingBA?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MonthlyWitnessModal({
  isOpen,
  onClose,
  year,
  month,
  currentWitness,
  beritaAcaraCount,
  onWitnessUpdated,
  beritaAcaraStatus,
  onRevokeBeritaAcara,
  revokingBA,
  onSubmitBeritaAcara,
  submittingBA,
}: Readonly<MonthlyWitnessModalProps>) {
  const { notify } = useToast();
  const [witnesses, setWitnesses] = useState<WitnessResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedWitnessId, setSelectedWitnessId] = useState<number | undefined>(
    currentWitness?.id
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedWitnessId(currentWitness?.id);
    setLoading(true);
    fetchEligibleWitnesses()
      .then((data) => setWitnesses(data || []))
      .catch((err) => notify(err.message || "Failed to load witnesses list", "error"))
      .finally(() => setLoading(false));
  }, [isOpen, currentWitness, notify]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWitnessId) {
      notify("Please select a witness first", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await updateMonthlyWitness({
        year,
        month,
        witness_id: selectedWitnessId,
      });
      notify(res.message || "Monthly witness updated successfully!", "success");
      onWitnessUpdated();
      onClose();
    } catch (err: any) {
      notify(err.message || "Failed to update monthly witness", "error");
    } finally {
      setSaving(false);
    }
  };

  const monthLabel = MONTH_NAMES[month - 1] || `Month ${month}`;

  const isBaSigned =
    beritaAcaraStatus?.status === "signed" || beritaAcaraStatus?.status === "approved";
  const isBaPending =
    beritaAcaraStatus?.status === "pending_witness" || beritaAcaraStatus?.status === "submitted";
  const isBaRejected = beritaAcaraStatus?.status === "rejected";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <span className="avatar avatar-sm bg-primary-lt text-primary rounded">
            <IconShieldCheck size={18} />
          </span>
          <div>
            <div className="fw-bold">Monthly Witness Settings</div>
            <div className="text-secondary small fw-normal">{monthLabel} {year}</div>
          </div>
        </div>
      }
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" onClick={onClose} className="btn btn-outline-secondary">
            Close
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loading || !selectedWitnessId || isBaPending || isBaSigned}
            className="btn btn-primary d-inline-flex align-items-center gap-1"
          >
            {saving && <IconLoader2 size={16} className="animate-spin me-1" />}
            Save Monthly Witness
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Status Lifecycle Alerts */}
        {isBaSigned && (
          <div className="alert alert-success border-success d-flex flex-column gap-2 mb-3" role="alert">
            <div className="d-flex align-items-center gap-2">
              <IconCheck size={20} className="text-success shrink-0" />
              <div>
                <div className="fw-bold">Incident Reports Signed by Witness</div>
                <div className="small text-secondary">
                  Verified by witness <strong>{beritaAcaraStatus?.witness_name || currentWitness?.name}</strong>. All incident reports for this period are locked.
                </div>
              </div>
            </div>
            {onRevokeBeritaAcara && (
              <div className="d-flex justify-content-end mt-1">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Revoke digital signature for these incident reports? Status will revert to draft and daily activities can be edited."
                      )
                    ) {
                      await onRevokeBeritaAcara();
                      onClose();
                    }
                  }}
                  disabled={revokingBA}
                >
                  {revokingBA ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconArrowBackUp size={14} />
                  )}
                  <span>Revoke Incident Report Signature</span>
                </button>
              </div>
            )}
          </div>
        )}

        {isBaPending && (
          <div className="alert alert-info border-info d-flex flex-column gap-2 mb-3" role="alert">
            <div className="d-flex align-items-center gap-2">
              <IconClock size={20} className="text-info shrink-0" />
              <div>
                <div className="fw-bold">Awaiting Witness Signature</div>
                <div className="small text-secondary">
                  Incident reports are awaiting review and approval from witness <strong>{beritaAcaraStatus?.witness_name || currentWitness?.name}</strong>.
                </div>
              </div>
            </div>
            {onRevokeBeritaAcara && (
              <div className="d-flex justify-content-end mt-1">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
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
                >
                  {revokingBA ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconArrowBackUp size={14} />
                  )}
                  <span>Cancel Signature Request</span>
                </button>
              </div>
            )}
          </div>
        )}

        {isBaRejected && (
          <div className="alert alert-danger border-danger d-flex flex-column gap-2 mb-3" role="alert">
            <div className="d-flex align-items-center gap-2">
              <IconAlertTriangle size={20} className="text-danger shrink-0" />
              <div>
                <div className="fw-bold">Incident Reports Rejected by Witness</div>
                <div className="small text-secondary">
                  Revision notes: <em>&ldquo;{beritaAcaraStatus?.witness_rejection_notes || beritaAcaraStatus?.notes || "Please check daily activity notes"}&rdquo;</em>
                </div>
              </div>
            </div>
            {onSubmitBeritaAcara && (
              <div className="d-flex justify-content-end mt-1">
                <button
                  type="button"
                  className="btn btn-danger btn-sm d-inline-flex align-items-center gap-1"
                  onClick={async () => {
                    await onSubmitBeritaAcara();
                    onClose();
                  }}
                  disabled={submittingBA}
                >
                  {submittingBA ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconSend size={14} />
                  )}
                  <span>Resubmit to Witness</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="card card-sm bg-body-tertiary mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-secondary">Incident Report Status:</span>
              <span className="badge bg-warning-lt">
                {beritaAcaraCount} Incident Days
              </span>
            </div>
            {currentWitness ? (
              <div className="small text-success d-flex align-items-center gap-1">
                <IconUserCheck size={16} />
                <span>Current witness: <strong>{currentWitness.name}</strong></span>
              </div>
            ) : (
              <div className="small text-warning d-flex align-items-center gap-1">
                <IconAlertCircle size={16} />
                <span>No monthly witness has been designated yet.</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label required">
            Select Coworker as Monthly Witness
          </label>
          {loading ? (
            <div className="d-flex align-items-center justify-content-center py-3">
              <IconLoader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : (
            <select
              className="form-select"
              value={selectedWitnessId || ""}
              onChange={(e) => setSelectedWitnessId(Number(e.target.value))}
              required
              disabled={isBaPending || isBaSigned}
            >
              <option value="">— Select Witness —</option>
              {witnesses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          )}
          <div className="form-text text-secondary small">
            {isBaPending || isBaSigned
              ? "Witness is locked while submission is awaiting review or signed. Revoke signature first to change witness."
              : `Designating a witness here will automatically assign this witness to all incident reports in ${monthLabel} ${year}.`}
          </div>
        </div>
      </form>
    </Modal>
  );
}
