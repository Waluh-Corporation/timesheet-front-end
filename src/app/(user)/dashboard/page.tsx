"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Plus,
  Download,
  Bell,
  BellOff,
  Fingerprint,
  Loader2,
  CalendarRange,
} from "lucide-react";
import { api, downloadFile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import {
  enablePush,
  disablePush,
  pushSupported,
  registerServiceWorker,
} from "@/lib/push";
import { registerPasskey, passkeysSupported } from "@/lib/webauthn";
import type { DailyActivity } from "@/lib/types";
import { DailyActivityRow } from "@/components/DailyActivityRow";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Columns shown in the monthly grid. `fillableFields` (from the default
// template mapping) decides which of these the user may actually edit.
const GRID_COLUMNS: { key: keyof DailyActivity; label: string; field: string }[] = [
  { key: "start_time", label: "Time In", field: "time_in" },
  { key: "end_time", label: "Time Out", field: "time_out" },
  { key: "status", label: "Status", field: "status" },
  { key: "activity", label: "Activity", field: "activity" },
  { key: "app_impacted", label: "App Impacted", field: "app_impacted" },
];
// Allowed values for the "Aplikasi Terdampak" (app impacted) column.
const APP_IMPACTED_OPTIONS = ["Bisnis", "Cash", "Overseas"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

// TODO: Migrate to these columns in the monthly Handsontable grid.
/*
const HOT_COLUMNS = [
  { field: "day", title: "Day", readOnly: true, width: 55 },
  { field: "date", title: "Date", readOnly: true, width: 95 },
  { field: "day_name", title: "Day Name", readOnly: true, width: 85 },
  { field: "start_time", title: "Start", readOnly: false, width: 70 },
  { field: "end_time", title: "End", readOnly: false, width: 70 },
  { field: "status", title: "Status", readOnly: false, width: 65 },
  { field: "activity", title: "Activity", readOnly: false, width: 220 },
  { field: "project_name", title: "Project", readOnly: false, width: 140 },
  { field: "project_id", title: "Project ID", readOnly: false, width: 100 },
  { field: "app_impacted", title: "App Impacted", readOnly: false, width: 120 },
] as const;
*/

export default function DashboardPage() {
  const { user } = useAuth();
  const { notify } = useToast();

  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [holidays, setHolidays] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [page, setPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const ITEMS_PER_PAGE = 7;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acts, hols] = await Promise.all([
        api<DailyActivity[]>(`/api/v1/activities?year=${year}&month=${month}`),
        api<{ date: string; description: string }[]>(
          `/api/v1/holidays?year=${year}&month=${month}`
        ).catch(() => []),
      ]);
      setActivities(acts || []);
      const hmap: Record<number, string> = {};
      (hols || []).forEach((h) => {
        const d = parseInt(h.date.split("-")[2], 10);
        if (!Number.isNaN(d)) hmap[d] = h.description;
      });
      setHolidays(hmap);
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [year, month, notify]);

  useEffect(() => {
    load();
    setPage(1);
  }, [load]);

  // Register the service worker on mount and reflect current permission state.
  useEffect(() => {
    if (pushSupported()) {
      registerServiceWorker().catch(() => {});
      setPushOn(Notification.permission === "granted");
    }
  }, []);

  // Build a day-indexed grid: one row per calendar day.
  const totalDays = daysInMonth(year, month);
  const byDay = useMemo(() => {
    const map = new Map<number, DailyActivity>();
    activities.forEach((a) => {
      const d = new Date(a.date).getDate();
      map.set(d, a);
    });
    return map;
  }, [activities]);



  const generate = async () => {
    setGenerating(true);
    try {
      await downloadFile(
        "/api/v1/timesheet/generate",
        { month, year },
        `Timesheet_${month}_${year}.xlsx`
      );
      notify("Timesheet downloaded & emailed to you 📧", "success");
    } catch (err: any) {
      notify(err.message || "Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleTogglePush = async () => {
    setPushBusy(true);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
        notify("Daily reminders turned off", "info");
      } else {
        await enablePush();
        setPushOn(true);
        notify("Daily reminders enabled at 17:00 WIB", "success");
      }
    } catch (err: any) {
      notify(err.message || "Could not update reminders", "error");
    } finally {
      setPushBusy(false);
    }
  };

  const handleAddPasskey = async () => {
    try {
      await registerPasskey(`${user?.username}'s device`);
      notify("Passkey registered — you can now sign in without a password.", "success");
    } catch (err: any) {
      notify(err.message || "Passkey registration failed", "error");
    }
  };

  const filledCount = activities.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting hero */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-mr-yellow p-6 text-black">
          <div>
            <p className="text-sm font-bold opacity-70">Halo,</p>
            <h1 className="text-2xl font-extrabold">{user?.name || user?.username} 👋</h1>
            <p className="mt-1 text-sm font-semibold opacity-70">
              {filledCount} day{filledCount === 1 ? "" : "s"} filled this month.
            </p>
          </div>
          <button onClick={() => router.push("/activity")} className="btn-primary">
            <Plus size={18} /> Today&apos;s Activity
          </button>
        </div>
      </div>

      {/* Action row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        <button
          onClick={generate}
          disabled={generating}
          className="card flex items-center gap-3 p-4 text-left transition hover:shadow-hard"
        >
          <div className="grid h-10 w-10 place-items-center  bg-mr-cyan text-mr-ink">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </div>
          <div>
            <p className="text-sm font-bold">Generate</p>
            <p className="text-xs text-mr-muted">Download & email .xlsx</p>
          </div>
        </button>

        <button
          onClick={handleTogglePush}
          disabled={pushBusy || !pushSupported()}
          className="card flex items-center gap-3 p-4 text-left transition hover:shadow-hard disabled:opacity-60"
        >
          <div className="grid h-10 w-10 place-items-center bg-mr-purple text-white">
            {pushBusy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : pushOn ? (
              <BellOff size={18} />
            ) : (
              <Bell size={18} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold">{pushOn ? "Disable reminders" : "Enable reminders"}</p>
            <p className="text-xs text-mr-muted">Daily push at 17:00 WIB</p>
          </div>
        </button>

        <button
          onClick={handleAddPasskey}
          disabled={!passkeysSupported()}
          className="card flex items-center gap-3 p-4 text-left transition hover:shadow-hard disabled:opacity-60"
        >
          <div className="grid h-10 w-10 place-items-center  bg-mr-pink text-white">
            <Fingerprint size={18} />
          </div>
          <div>
            <p className="text-sm font-bold">Add passkey</p>
            <p className="text-xs text-mr-muted">Passwordless sign-in</p>
          </div>
        </button>
      </div>

      {/* Month selector + grid */}
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
                className="text-mr-muted hover:text-mr-ink hover:bg-mr-surface2 transition-colors cursor-pointer rounded-full border border-mr-muted/30 w-5 h-5 flex items-center justify-center text-xs font-bold"
                aria-label="Toggle status definitions"
              >
                ?
              </button>
              
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-3 bg-mr-surface text-mr-ink border-2 border-mr-ink shadow-[4px_4px_0_0_var(--ink)] text-xs z-50 cursor-default">
                  <div className="font-bold mb-2 uppercase border-b border-mr-ink/20 pb-1 flex justify-between items-center">
                    Definitions
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
                // Determine the highest day to show
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
                
                // If the user navigates months, page might be temporarily higher than totalPages
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
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-mr-black/10">
                  <span className="text-sm text-mr-muted font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn bg-mr-black/5 hover:bg-mr-black/10 text-black px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn bg-mr-black/5 hover:bg-mr-black/10 text-black px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50"
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
    </div>
  );
}
