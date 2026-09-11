"use client";

import type { DailyActivity } from "@/lib/types";
import Link from "next/link";

interface DailyActivityRowProps {
  day: number;
  dateStr: string;
  monthName: string;
  dow: string; // Day of week
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
}: DailyActivityRowProps) {
  const isNonWorking = isWeekend || !!holiday;

  const dayLabel = `${monthName} ${day} · ${dow}`;
  let dayStatus = "";
  if (isToday) dayStatus = "(Today)";
  else if (isYesterday) dayStatus = "(Yesterday)";

  const innerContent = (
    <div className="w-full flex items-center justify-between p-4 text-left">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className={`font-bold ${isNonWorking ? "text-mr-muted" : "text-mr-ink"}`}>
            {dayLabel} {dayStatus && <span className="text-mr-purple ml-1">{dayStatus}</span>}
          </span>
          {!isNonWorking && (
            <span className="text-xs text-mr-muted mt-0.5 max-h-0 opacity-0 group-hover:max-h-[20px] group-hover:opacity-100 group-focus-within:max-h-[20px] group-focus-within:opacity-100 overflow-hidden transition-all duration-200">
              {activity?.start_time || ""} - {activity?.end_time || ""}
            </span>
          )}
        </div>
        {holiday && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-mr-pink/20 text-mr-pink font-semibold">
            Holiday
          </span>
        )}
        {isWeekend && !holiday && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-mr-surface text-mr-muted font-semibold border border-mr-muted/30">
            Weekend
          </span>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {activity?.status ? (
          <span className="font-bold text-sm px-3 py-1 rounded bg-mr-surface2 text-mr-ink border border-mr-ink/10">
            {activity.status}
          </span>
        ) : isNonWorking ? (
          <span className="font-bold text-sm text-mr-muted px-3 py-1">X</span>
        ) : null}
      </div>
    </div>
  );

  const containerClasses = `group block flex-shrink-0 card overflow-hidden transition-all duration-200 relative ${
    isNonWorking
      ? "bg-mr-surface2"
      : "bg-mr-surface hover:scale-[1.02] hover:shadow-none hover:z-10 cursor-pointer"
  }`;

  if (isNonWorking) {
    return <div className={containerClasses}>{innerContent}</div>;
  }

  const targetHref = activity?.id ? `/activity?id=${activity.id}` : `/activity?date=${dateStr}`;

  return (
    <Link href={targetHref} className={containerClasses}>
      {innerContent}
    </Link>
  );
}
