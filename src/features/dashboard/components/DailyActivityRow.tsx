"use client";

import type { DailyActivity, BeritaAcaraStatusResponse } from "@/lib/types";
import Link from "next/link";
import {
  IconShieldCheck,
  IconChevronRight,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconFileText,
} from "@tabler/icons-react";

interface DailyActivityRowProps {
  day: number;
  dateStr: string;
  monthName: string;
  dow: string;
  isToday: boolean;
  isYesterday: boolean;
  holiday?: string;
  isWeekend: boolean;
  activity?: DailyActivity;
  beritaAcaraStatus?: BeritaAcaraStatusResponse | null;
}

export function DailyActivityRow({
  day,
  dateStr,
  monthName,
  dow,
  isToday,
  isYesterday,
  holiday,
  isWeekend,
  activity,
  beritaAcaraStatus,
}: Readonly<DailyActivityRowProps>) {
  const isNonWorking = isWeekend || !!holiday;

  const dayLabel = `${monthName} ${day} · ${dow}`;
  let dayBadge = null;
  if (isToday) {
    dayBadge = <span className="badge bg-primary text-primary-fg ms-2">Today</span>;
  } else if (isYesterday) {
    dayBadge = <span className="badge bg-primary-lt ms-2">Yesterday</span>;
  }

  // Attendance Incident / Berita Acara Status logic
  let incidentBadge = null;
  if (activity?.is_berita_acara) {
    const status = beritaAcaraStatus?.status;
    const isSigned = status === "signed" || status === "approved";
    const isPending = status === "pending_witness" || status === "submitted";
    const isRejected = status === "rejected";
    const witnessName = beritaAcaraStatus?.witness_name || activity.witness?.name || "witness";

    if (isSigned) {
      incidentBadge = (
        <span
          className="badge bg-success-lt text-success d-inline-flex align-items-center gap-1"
          title={`Berita Acara - Attendance Incident Report: Approved & signed by witness ${witnessName}`}
        >
          <IconCheck size={12} />
          <span>Signed</span>
        </span>
      );
    } else if (isPending) {
      incidentBadge = (
        <span
          className="badge bg-azure-lt text-azure d-inline-flex align-items-center gap-1"
          title={`Berita Acara - Attendance Incident Report: Awaiting signature from witness ${witnessName}`}
        >
          <IconClock size={12} />
          <span>Awaiting Signature</span>
        </span>
      );
    } else if (isRejected) {
      incidentBadge = (
        <span
          className="badge bg-danger-lt text-danger d-inline-flex align-items-center gap-1"
          title={
            beritaAcaraStatus?.witness_rejection_notes
              ? `Berita Acara - Attendance Incident Report: Rejected — "${beritaAcaraStatus.witness_rejection_notes}"`
              : "Berita Acara - Attendance Incident Report: Rejected by witness"
          }
        >
          <IconAlertTriangle size={12} />
          <span>Rejected</span>
        </span>
      );
    } else {
      incidentBadge = (
        <span
          className="badge bg-yellow-lt text-yellow d-inline-flex align-items-center gap-1"
          title="Berita Acara - Attendance Incident Report: Saved draft, pending submission"
        >
          <IconFileText size={12} />
          <span>Draft</span>
        </span>
      );
    }
  }

  const innerContent = (
    <div className="card-body py-2 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
      {/* Left: Date & Time logging */}
      <div className="d-flex align-items-center gap-2 min-w-0">
        <span
          className={`avatar avatar-sm rounded fw-bold ${
            isToday
              ? "bg-primary text-primary-fg"
              : isNonWorking
              ? "bg-secondary-subtle text-secondary"
              : "bg-primary-subtle text-primary"
          }`}
        >
          {day}
        </span>
        <div className="min-w-0">
          <div className="d-flex align-items-center flex-wrap">
            <span className={`fw-semibold ${isNonWorking ? "text-secondary" : "text-body"}`}>
              {dayLabel}
            </span>
            {dayBadge}
            {holiday && (
              <span className="badge bg-danger-lt ms-2" title={holiday}>
                Holiday: {holiday}
              </span>
            )}
            {isWeekend && !holiday && (
              <span className="badge bg-secondary-lt ms-2">Weekend</span>
            )}
          </div>
          {!isNonWorking && (
            <div className="text-secondary small">
              {activity?.start_time ? (
                <span>
                  {activity.start_time} - {activity.end_time || ""}
                  {activity.project_name && (
                    <span className="ms-2 text-muted">· {activity.project_name}</span>
                  )}
                </span>
              ) : (
                <span className="text-muted fst-italic">Click to log hours</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Attendance Incident / Berita Acara Column & Status */}
      <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
        {/* Incident column indicator */}
        <div className="d-flex align-items-center gap-1" title="Attendance Incident / Berita Acara">
          {activity?.is_berita_acara ? (
            <div className="d-flex align-items-center gap-1">
              <span
                className="badge bg-warning-lt text-uppercase d-none d-sm-inline-flex align-items-center gap-1"
                style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                title={activity.berita_acara_notes ? `Notes: ${activity.berita_acara_notes}` : "Attendance Incident"}
              >
                <IconShieldCheck size={11} />
                BA
              </span>
              {incidentBadge}
            </div>
          ) : !isNonWorking ? (
            <span className="text-secondary small d-none d-md-inline px-2" title="Normal attendance without incident">
              -
            </span>
          ) : null}
        </div>

        {/* Presence status badge (P, S, V, BT, etc.) */}
        {activity?.status && (
          <span className="badge bg-info-lt fw-bold" title={`Attendance Status: ${activity.status}`}>
            {activity.status}
          </span>
        )}

        {!isNonWorking && <IconChevronRight size={16} className="text-secondary ms-1" />}
      </div>
    </div>
  );

  const cardClasses = `card card-sm mb-2 shadow-none border ${
    isNonWorking
      ? "bg-body-tertiary opacity-75"
      : "hover-shadow-sm cursor-pointer text-decoration-none"
  }`;

  if (isNonWorking) {
    return <div className={cardClasses}>{innerContent}</div>;
  }

  const targetHref = activity?.id ? `/activity?id=${activity.id}` : `/activity?date=${dateStr}`;

  return (
    <Link href={targetHref} className={cardClasses}>
      {innerContent}
    </Link>
  );
}
