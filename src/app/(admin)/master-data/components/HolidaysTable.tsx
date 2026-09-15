"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { Holiday } from "@/lib/types";
import { fetchAllHolidays, syncHolidays } from "@/app/(admin)/master-data/services/masterData";
import { useClientPagination } from "../hooks/useClientPagination";

export function HolidaysTable() {
  const { notify } = useToast();
  const currentYear = new Date().getFullYear();
  const [holidayYear, setHolidayYear] = useState(currentYear);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllHolidays(holidayYear);
      setHolidays(data || []);
    } catch (err: any) {
      notify(err.message || "Failed to load holidays", "error");
    } finally {
      setLoading(false);
    }
  }, [holidayYear, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncHolidays(holidayYear);
      notify(res.message || `Holidays for ${holidayYear} synced!`, "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const {
    paginatedData,
  } = useClientPagination<Holiday>(
    holidays,
    () => true,
    "date",
    "asc"
  );

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">National Holidays</h2>
          <select
            className="input py-1 px-2 text-xs font-bold"
            value={holidayYear}
            onChange={(e) => setHolidayYear(Number(e.target.value))}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn border-2 border-mr-ink bg-mr-cyan text-mr-ink text-sm font-bold flex items-center gap-2"
        >
          <RotateCw size={16} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync from Kemendesa API"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-mr-purple" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                <th className="pb-2">Date</th>
                <th className="pb-2">Description</th>
                <th className="pb-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((h, i) => (
                <tr key={i} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50">
                  <td className="py-3 font-semibold whitespace-nowrap">{h.date}</td>
                  <td className="py-3">{h.description}</td>
                  <td className="py-3">
                    <span className="chip bg-mr-surface2 text-xs font-semibold">
                      {h.is_joint_leave ? "Cuti Bersama" : "Libur Nasional"}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-mr-muted">
                    No holidays loaded for {holidayYear}. Click &quot;Sync&quot; above to fetch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
