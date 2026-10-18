"use client";

import { useState, useEffect, useCallback } from "react";
import { IconRotateClockwise } from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import type { Holiday } from "@/lib/types";
import {
  fetchAllHolidays,
  syncHolidays,
} from "../services/masterDataService";
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
      notify(res.message || `Holidays for ${holidayYear} synced successfully!`, "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const { paginatedData } = useClientPagination<Holiday>(
    holidays,
    () => true,
    "date",
    "asc"
  );

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h3 className="card-title mb-0">National Holidays</h3>
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={holidayYear}
            onChange={(e) => setHolidayYear(Number(e.target.value))}
          >
            {[-1, 0, 1].map((offset) => {
              const y = currentYear + offset;
              return (
                <option key={y} value={y}>
                  Year {y}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
          >
            <IconRotateClockwise size={16} className={syncing ? "animate-spin" : ""} />
            Sync Holidays API
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((h, i) => (
                <tr key={`${h.date}-${i}`}>
                  <td className="font-monospace fw-semibold">{h.date}</td>
                  <td className="fw-bold">{h.description}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {h.is_joint_leave && (
                        <span className="badge bg-warning-lt text-uppercase">
                          Cuti Bersama
                        </span>
                      )}
                      {h.is_religious && (
                        <span className="badge bg-purple-lt text-uppercase">
                          Keagamaan
                        </span>
                      )}
                      {h.is_civic && (
                        <span className="badge bg-info-lt text-uppercase">
                          Nasional
                        </span>
                      )}
                      {!h.is_joint_leave && !h.is_religious && !h.is_civic && (
                        <span className="badge bg-secondary-lt text-uppercase">
                          Libur Nasional
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-secondary">
                    No holidays loaded for {holidayYear}. Click &quot;Sync Holidays API&quot; to fetch them.
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
