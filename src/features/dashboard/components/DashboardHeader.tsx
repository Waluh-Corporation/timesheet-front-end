"use client";

import {
  IconPlus,
  IconDownload,
  IconBell,
  IconBellOff,
  IconFingerprint,
  IconLoader2,
  IconFileSpreadsheet,
  IconSend,
  IconShieldCheck,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { WitnessResponse, BeritaAcaraStatusResponse, TimesheetStatusResponse } from "@/lib/types";

interface DashboardHeaderProps {
  user: any;
  filledCount: number;
  generating: boolean;
  onGenerate: () => void;
  pushBusy: boolean;
  pushOn: boolean;
  onTogglePush: () => void;
  pushSupported: boolean;
  sendingTestPush?: boolean;
  onSendTestPush?: () => void;
  onOpenJobsModal?: () => void;
  onAddPasskey: () => void;
  passkeysSupported: boolean;
  monthlyWitness?: WitnessResponse;
  beritaAcaraCount?: number;
  beritaAcaraStatus?: BeritaAcaraStatusResponse | null;
  submittingBA?: boolean;
  onSubmitBeritaAcara?: () => void;
  onOpenWitnessModal?: () => void;
  witnessRequestsCount?: number;
  onOpenWitnessReviewModal?: () => void;
  timesheetStatus?: TimesheetStatusResponse | null;
}

export function DashboardHeader({
  user,
  filledCount,
  generating,
  onGenerate,
  pushBusy,
  pushOn,
  onTogglePush,
  pushSupported,
  sendingTestPush,
  onSendTestPush,
  onOpenJobsModal,
  onAddPasskey,
  passkeysSupported,
  monthlyWitness,
  beritaAcaraCount = 0,
  beritaAcaraStatus,
  submittingBA = false,
  onSubmitBeritaAcara,
  onOpenWitnessModal,
  witnessRequestsCount = 0,
  onOpenWitnessReviewModal,
  timesheetStatus,
}: Readonly<DashboardHeaderProps>) {
  const router = useRouter();

  const isTimesheetSigned = Boolean(
    timesheetStatus?.is_signed || timesheetStatus?.status === "signed"
  );

  const isBaSigned =
    beritaAcaraStatus?.status === "signed" || beritaAcaraStatus?.status === "approved";
  const isBaPending =
    beritaAcaraStatus?.status === "pending_witness" || beritaAcaraStatus?.status === "submitted";
  const isBaRejected = beritaAcaraStatus?.status === "rejected";
  const isBaRevoked = beritaAcaraStatus?.status === "revoked";
  const isBaUnsubmitted = !beritaAcaraStatus || beritaAcaraStatus.status === "draft";
  const witnessName =
    beritaAcaraStatus?.witness_name ||
    monthlyWitness?.name ||
    (beritaAcaraStatus?.witness_id ? `Witness #${beritaAcaraStatus.witness_id}` : "Witness");

  let pushIcon = <IconBellOff size={22} />;
  if (pushBusy) {
    pushIcon = <IconLoader2 size={22} className="animate-spin" />;
  } else if (pushOn) {
    pushIcon = <IconBell size={22} />;
  }

  return (
    <>
      {/* Tabler Page Header Banner */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col">
              <div className="text-secondary small fw-medium mb-1">Welcome back,</div>
              <h2 className="card-title h1 mb-1 fw-bold">
                {user?.name || user?.username} 👋
              </h2>
              <div className="text-secondary small">
                <strong>{filledCount}</strong> day{filledCount === 1 ? "" : "s"} logged for this period.
              </div>
            </div>
            <div className="col-auto ms-auto d-flex flex-wrap gap-2 mt-2 mt-sm-0">
              {witnessRequestsCount > 0 && onOpenWitnessReviewModal && (
                <button
                  type="button"
                  onClick={onOpenWitnessReviewModal}
                  className="btn btn-outline-danger d-flex align-items-center gap-1"
                  title="Review coworker attendance incident reports awaiting your witness signature"
                  style={{ minHeight: 44 }}
                >
                  <IconShieldCheck size={18} />
                  <span>
                    Witness Signatures ({witnessRequestsCount})
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/activity")}
                className="btn btn-primary d-inline-flex align-items-center gap-1.5"
                style={{ minHeight: 44 }}
              >
                <IconPlus size={18} />
                <span>Today&apos;s Activity</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Tabler Quick Action Metric Cards */}
      <div className="row row-cards mb-3">
        {/* Card 1: Generate Timesheet (Consistent Card) */}
        <div className="col-sm-6 col-lg-3">
          <div
            className={`card card-sm shadow-sm h-100 cursor-pointer hover-shadow ${
              beritaAcaraCount > 0 && !isBaSigned ? "border-warning-subtle" : ""
            }`}
            onClick={onGenerate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onGenerate();
            }}
            title={
              beritaAcaraCount > 0 && !isBaSigned
                ? `Timesheet locked: ${beritaAcaraCount} attendance incident ${
                    beritaAcaraCount === 1 ? "report requires" : "reports require"
                  } witness signature`
                : "Generate and export monthly timesheet"
            }
          >
            <div className="card-body d-flex align-items-center">
              <span
                className={`avatar ${
                  beritaAcaraCount > 0 && !isBaSigned
                    ? "bg-warning-lt text-warning"
                    : "bg-green-lt text-green"
                } me-3 rounded`}
              >
                {generating ? (
                  <IconLoader2 size={22} className="animate-spin" />
                ) : (
                  <IconDownload size={22} />
                )}
              </span>
              <div className="min-w-0">
                <div className="fw-bold d-flex align-items-center gap-1.5">
                  <span>Generate</span>
                  {beritaAcaraCount > 0 && !isBaSigned && (
                    <span className="badge bg-warning-lt text-warning small px-1.5 py-0.5">
                      Locked
                    </span>
                  )}
                  {isTimesheetSigned && (
                    <span className="badge bg-info-lt text-info small px-1.5 py-0.5">
                      Signed
                    </span>
                  )}
                </div>
                <div className="text-secondary small text-truncate">
                  {beritaAcaraCount > 0 && !isBaSigned
                    ? `${beritaAcaraCount} ${
                        beritaAcaraCount === 1 ? "report needs" : "reports need"
                      } witness signature`
                    : isTimesheetSigned
                    ? "Timesheet signed & locked"
                    : "Export monthly timesheet"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Timesheet Jobs */}
        <div className="col-sm-6 col-lg-3">
          <div
            className="card card-sm shadow-sm h-100 cursor-pointer hover-shadow"
            onClick={onOpenJobsModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpenJobsModal?.();
            }}
          >
            <div className="card-body d-flex align-items-center">
              <span className="avatar bg-blue-lt text-blue me-3 rounded">
                <IconFileSpreadsheet size={22} />
              </span>
              <div className="min-w-0">
                <div className="fw-bold">Timesheet Jobs</div>
                <div className="text-secondary small">History & S3 downloads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Push Notification */}
        <div className="col-sm-6 col-lg-3">
          <div
            className={`card card-sm shadow-sm h-100 ${
              pushSupported && !pushBusy ? "cursor-pointer hover-shadow" : "opacity-60"
            }`}
            onClick={pushSupported && !pushBusy ? onTogglePush : undefined}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (pushSupported && !pushBusy && (e.key === "Enter" || e.key === " ")) {
                onTogglePush();
              }
            }}
            title={
              !pushSupported
                ? "Push notifications not supported on this browser"
                : pushOn
                ? "Click to disable daily reminders"
                : "Click to enable daily reminders at 17:00"
            }
          >
            <div className="card-body d-flex align-items-center">
              <span
                className={`avatar ${
                  pushOn ? "bg-yellow-lt text-yellow" : "bg-secondary-lt text-secondary"
                } me-3 rounded`}
              >
                {pushIcon}
              </span>
              <div className="min-w-0 flex-fill">
                <div className="fw-bold text-truncate">Daily Reminders</div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-secondary small">Daily push at 17:00</span>
                  {pushOn && onSendTestPush && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendTestPush();
                      }}
                      disabled={sendingTestPush}
                      className="btn btn-link btn-sm p-0 text-primary small d-flex align-items-center gap-1"
                      title="Send test push notification"
                    >
                      {sendingTestPush ? (
                        <IconLoader2 size={12} className="animate-spin" />
                      ) : (
                        <IconSend size={12} />
                      )}
                      <span>Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Passkey */}
        <div className="col-sm-6 col-lg-3">
          <div
            className={`card card-sm shadow-sm h-100 ${
              passkeysSupported ? "cursor-pointer hover-shadow" : "opacity-60"
            }`}
            onClick={passkeysSupported ? onAddPasskey : undefined}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (passkeysSupported && (e.key === "Enter" || e.key === " ")) onAddPasskey();
            }}
          >
            <div className="card-body d-flex align-items-center">
              <span className="avatar bg-purple-lt text-purple me-3 rounded">
                <IconFingerprint size={22} />
              </span>
              <div className="min-w-0">
                <div className="fw-bold">Add Passkey</div>
                <div className="text-secondary small">Passwordless sign-in</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
