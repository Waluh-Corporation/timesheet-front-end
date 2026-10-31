"use client";

import { useState } from "react";
import {
  IconLoader2,
  IconCalendarEvent,
  IconHelp,
} from "@tabler/icons-react";
import { DailyActivityRow } from "./DailyActivityRow";
import type { DailyActivity, WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";

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
  monthlyWitness?: WitnessResponse;
  beritaAcaraStatus?: BeritaAcaraStatusResponse | null;
  onOpenWitnessModal?: () => void;
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
  beritaAcaraStatus,
}: Readonly<MonthlyGridProps>) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <IconCalendarEvent size={20} className="text-primary" />
          <h3 className="card-title mb-0">Monthly Timesheet</h3>

          {/* Status Definition Tooltip */}
          <div className="position-relative d-inline-block ms-1">
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="btn btn-icon btn-sm btn-ghost rounded-circle text-secondary"
              aria-label="Toggle status definitions"
            >
              <IconHelp size={16} />
            </button>

            {showTooltip && (
              <div
                className="position-absolute start-0 top-100 mt-1 card card-sm shadow border p-2 z-3"
                style={{ width: 220 }}
              >
                <div className="d-flex justify-content-between align-items-center pb-1 mb-1 border-bottom">
                  <span className="fw-bold small text-uppercase">Status Codes</span>
                  <button
                    type="button"
                    onClick={() => setShowTooltip(false)}
                    className="btn-close btn-sm p-0"
                    aria-label="Close"
                  ></button>
                </div>
                <ul className="list-unstyled mb-0 small">
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

        <div className="text-secondary small fw-medium">
          {MONTHS[month - 1]} {year}
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <IconLoader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div>
            <div className="d-flex flex-column" style={{ minHeight: 360 }}>
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
                            beritaAcaraStatus={beritaAcaraStatus}
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
                return (
                  <div className="text-center text-secondary small py-4">
                    No days to display for this month.
                  </div>
                );
              }

              return (
                <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top flex-wrap gap-2">
                  <span className="text-secondary small">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <div className="btn-group">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="btn btn-sm btn-outline-secondary"
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
    </div>
  );
}
