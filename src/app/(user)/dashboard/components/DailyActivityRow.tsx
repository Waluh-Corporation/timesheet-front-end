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
            {dayLabel} {dayStatus && <span className="text-mr-purple ml-1 font-bold">{dayStatus}</span>}
          </span>
          {!isNonWorking && (
            <span className="text-xs text-mr-muted font-mono mt-0.5 max-h-0 opacity-0 group-hover:max-h-[20px] group-hover:opacity-100 group-focus-within:max-h-[20px] group-focus-within:opacity-100 overflow-hidden transition-all duration-200">
              {activity?.start_time ? `${activity.start_time} - ${activity.end_time || ""}` : "Click to log hours"}
            </span>
          )}
        </div>
        {holiday && (
          <span className="chip bg-mr-pink text-white border-mr-ink" title={holiday}>
            Holiday: {holiday}
          </span>
        )}
        {isWeekend && !holiday && (
          <span className="chip bg-mr-surface2 text-mr-muted border-mr-ink">
            Weekend
          </span>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {activity?.status && (
          <span className="chip bg-mr-yellow text-black border-mr-ink font-bold">
            {activity.status}
          </span>
        )}
      </div>
    </div>
  );

  const containerClasses = `group block flex-shrink-0 card overflow-hidden transition-all duration-150 relative ${
    isNonWorking
      ? "bg-mr-surface2 opacity-80"
      : "bg-mr-surface hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-hard-md cursor-pointer"
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
