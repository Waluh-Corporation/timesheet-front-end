"use client";

import type { DailyActivity } from "@/lib/types";
import Link from "next/link";
import { IconShieldCheck, IconChevronRight } from "@tabler/icons-react";

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
}: Readonly<DailyActivityRowProps>) {
  const isNonWorking = isWeekend || !!holiday;

  const dayLabel = `${monthName} ${day} · ${dow}`;
  let dayBadge = null;
  if (isToday) {
    dayBadge = <span className="badge bg-primary text-primary-fg ms-2">Today</span>;
  } else if (isYesterday) {
    dayBadge = <span className="badge bg-primary-lt ms-2">Yesterday</span>;
  }

  const innerContent = (
    <div className="card-body py-2 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
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
                <span>{activity.start_time} - {activity.end_time || ""}</span>
              ) : (
                <span className="text-muted fst-italic">Click to log hours</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {activity?.is_berita_acara && (
          <span
            className="badge bg-warning-lt d-inline-flex align-items-center gap-1"
            title={
              activity.berita_acara_notes
                ? `Berita Acara: ${activity.berita_acara_notes}${
                    activity.witness?.name ? ` (Saksi: ${activity.witness.name})` : ""
                  }`
                : "Berita Acara"
            }
          >
            <IconShieldCheck size={14} />
            BA
          </span>
        )}
        {activity?.status && (
          <span className="badge bg-info-lt fw-bold">
            {activity.status}
          </span>
        )}
        {!isNonWorking && <IconChevronRight size={16} className="text-secondary" />}
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
