import { useState } from "react";
import { Loader2, CalendarRange } from "lucide-react";
import { DailyActivityRow } from "./DailyActivityRow";
import type { DailyActivity } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthlyGridProps {
  loading: boolean;
  year: number;
  month: number;
  totalDays: number;
  now: Date;
  byDay: Map<number, DailyActivity>;
  holidays: Record<number, string>;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  ITEMS_PER_PAGE: number;
}

export function MonthlyGrid({
  loading,
  year,
  month,
  totalDays,
  now,
  byDay,
  holidays,
  page,
  setPage,
  ITEMS_PER_PAGE,
}: Readonly<MonthlyGridProps>) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarRange size={18} className="text-mr-purple" />
            <h2 className="text-lg font-bold">Monthly timesheet</h2>
            
            {/* Status Definition Tooltip */}
            <div className="relative flex items-center ml-1">
              <button 
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="chip bg-mr-surface2 text-mr-ink hover:bg-mr-yellow transition-colors cursor-pointer py-0.5 px-2"
                aria-label="Toggle status definitions"
              >
                ?
              </button>
              
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-3 bg-mr-surface text-mr-ink border-2 border-mr-ink shadow-[4px_4px_0_0_var(--ink)] text-xs z-50 cursor-default">
                  <div className="font-bold mb-2 uppercase border-b border-mr-ink/20 pb-1 flex justify-between items-center">
                    <span>Definitions</span>
                    <button onClick={() => setShowTooltip(false)} className="text-mr-muted hover:text-mr-ink font-normal px-1 -mr-1">✕</button>
                  </div>
                  <ul className="space-y-1 text-left font-normal">
                    <li><strong>P</strong> = Present</li>
                    <li><strong>S</strong> = Sick</li>
                    <li><strong>V</strong> = Vacation</li>
                    <li><strong>BT</strong> = Business Trip</li>
                    <li><strong>PM</strong> = Permit</li>
                    <li><strong>X</strong> = Not Working Anymore</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-mr-purple" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 min-h-[400px]">
              {(() => {
                let maxDay = totalDays;
                if (year === now.getFullYear() && month === now.getMonth() + 1) {
                  maxDay = Math.min(totalDays, now.getDate());
                } else if (
                  year > now.getFullYear() ||
                  (year === now.getFullYear() && month > now.getMonth() + 1)
                ) {
                  maxDay = 0;
                }

                const allDaysReversed = Array.from({ length: maxDay }, (_, i) => i + 1).reverse();
                const totalPages = Math.ceil(maxDay / ITEMS_PER_PAGE);
                
                const currentPage = Math.min(page, totalPages || 1);

                return (
                  <>
                    {allDaysReversed
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((day) => {
                        const dateObj = new Date(year, month - 1, day);
                        const dow = dateObj.getDay();
                        const isWeekend = dow === 0 || dow === 6;
                        const holiday = holidays[day];
                        const act = byDay.get(day);

                        const isToday =
                          now.getDate() === day &&
                          now.getMonth() + 1 === month &&
                          now.getFullYear() === year;
                        const isYesterday =
                          now.getDate() - 1 === day &&
                          now.getMonth() + 1 === month &&
                          now.getFullYear() === year;

                        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                        return (
                          <DailyActivityRow
                            key={day}
                            day={day}
                            dateStr={dateStr}
                            monthName={MONTHS[month - 1].slice(0, 3)}
                            dow={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow]}
                            isToday={isToday}
                            isYesterday={isYesterday}
                            holiday={holiday}
                            isWeekend={isWeekend}
                            activity={act}
                          />
                        );
                      })}
                  </>
                );
              })()}
            </div>

            {(() => {
              let maxDay = totalDays;
              if (year === now.getFullYear() && month === now.getMonth() + 1) {
                maxDay = Math.min(totalDays, now.getDate());
              } else if (
                year > now.getFullYear() ||
                (year === now.getFullYear() && month > now.getMonth() + 1)
              ) {
                maxDay = 0;
              }
              const totalPages = Math.max(1, Math.ceil(maxDay / ITEMS_PER_PAGE));
              const currentPage = Math.min(page, totalPages);

              if (maxDay === 0) {
                return <div className="text-center text-sm text-mr-muted py-4">No days to show for this month.</div>;
              }

              return (
                <div className="flex items-center justify-between mt-2 pt-4 border-t-2 border-mr-ink">
                  <span className="text-sm text-mr-muted font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
  );
}
