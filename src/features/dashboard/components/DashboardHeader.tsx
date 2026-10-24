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
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { WitnessResponse } from "@/lib/types";

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
  onOpenWitnessModal?: () => void;
  witnessRequestsCount?: number;
  onOpenWitnessReviewModal?: () => void;
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
  onOpenWitnessModal,
  witnessRequestsCount = 0,
  onOpenWitnessReviewModal,
}: Readonly<DashboardHeaderProps>) {
  const router = useRouter();

  let pushIcon = <IconBell size={20} />;
  if (pushBusy) {
    pushIcon = <IconLoader2 size={20} className="animate-spin" />;
  } else if (pushOn) {
    pushIcon = <IconBellOff size={20} />;
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
                  title="Tinjau permohonan Berita Acara rekan kerja yang menunggu tanda tangan Anda sebagai saksi"
                >
                  <IconShieldCheck size={18} />
                  <span>
                    Tanda Tangan Saksi ({witnessRequestsCount})
                  </span>
                </button>
              )}
              {onOpenWitnessModal && (
                <button
                  type="button"
                  onClick={onOpenWitnessModal}
                  className="btn btn-outline-primary d-flex align-items-center gap-1"
                  title="Atur saksi untuk seluruh entri Berita Acara bulan ini"
                >
                  <IconShieldCheck size={18} />
                  <span>
                    Saksi BA: {monthlyWitness ? monthlyWitness.name : "Atur Saksi"}
                    {beritaAcaraCount > 0 ? ` (${beritaAcaraCount} hari)` : ""}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/activity")}
                className="btn btn-primary d-flex align-items-center gap-1"
              >
                <IconPlus size={18} /> Today&apos;s Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Tabler Quick Action Metric Cards */}
      <div className="row row-cards mb-3">
        {/* Card 1: Generate */}
        <div className="col-sm-6 col-lg-3">
          <div
            className="card card-sm shadow-sm h-100 cursor-pointer hover-shadow"
            onClick={onGenerate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onGenerate();
            }}
          >
            <div className="card-body d-flex align-items-center">
              <span className="avatar bg-green-lt text-green me-3 rounded">
                {generating ? (
                  <IconLoader2 size={22} className="animate-spin" />
                ) : (
                  <IconDownload size={22} />
                )}
              </span>
              <div className="min-w-0">
                <div className="fw-bold">Generate</div>
                <div className="text-secondary small">Export monthly timesheet</div>
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
          <div className="card card-sm shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <button
                type="button"
                onClick={onTogglePush}
                disabled={pushBusy || !pushSupported}
                className="btn btn-icon btn-ghost me-3 p-0 border-0"
                aria-label={pushOn ? "Disable reminders" : "Enable reminders"}
              >
                <span className={`avatar ${pushOn ? "bg-yellow text-yellow-fg" : "bg-yellow-lt text-yellow"} rounded`}>
                  {pushIcon}
                </span>
              </button>
              <div className="min-w-0 flex-fill">
                <div
                  className="fw-bold text-truncate cursor-pointer"
                  onClick={onTogglePush}
                  role="button"
                  tabIndex={0}
                >
                  {pushOn ? "Disable Reminders" : "Enable Reminders"}
                </div>
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
                      Test
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
