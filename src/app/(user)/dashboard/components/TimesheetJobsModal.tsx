"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  Loader2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import type { TimesheetJobResponse } from "@/lib/types";
import {
  getTimesheetJobs,
  requestTimesheetGeneration,
} from "@/services/timesheetService";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface TimesheetJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentYear?: number;
  currentMonth?: number;
}

export function TimesheetJobsModal({
  isOpen,
  onClose,
  currentYear = new Date().getFullYear(),
  currentMonth = new Date().getMonth() + 1,
}: Readonly<TimesheetJobsModalProps>) {
  const { notify } = useToast();
  const [jobs, setJobs] = useState<TimesheetJobResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await getTimesheetJobs({ page: 1, limit: 15 });
      const jobList = Array.isArray(res?.data) ? res.data : [];
      setJobs(jobList);
      return jobList;
    } catch (err: any) {
      notify(err?.message || "Failed to load timesheet jobs", "error");
      return [];
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [notify]);

  // Initial fetch on modal open
  useEffect(() => {
    if (!isOpen) return;
    fetchJobs(true);
  }, [isOpen, fetchJobs]);

  // Auto-polling when active jobs are queued or processing
  useEffect(() => {
    if (!isOpen) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    const hasPendingJobs = jobs.some(
      (j) => j.status === "queued" || j.status === "processing"
    );

    if (hasPendingJobs) {
      pollTimerRef.current = setInterval(() => {
        fetchJobs(false);
      }, 3500);
    } else if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, jobs, fetchJobs]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const job = await requestTimesheetGeneration(selectedYear, selectedMonth);
      notify(
        `Timesheet generation job queued for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} ⏳`,
        "success"
      );
      // Immediately refresh jobs list
      fetchJobs(false);
    } catch (err: any) {
      notify(err?.message || "Failed to enqueue timesheet generation", "error");
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: TimesheetJobResponse["status"]) => {
    switch (status) {
      case "queued":
        return (
          <span className="inline-flex items-center gap-1.5 border border-mr-ink/30 bg-mr-yellow/30 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
            <Clock size={13} className="animate-pulse" />
            Queued
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 border border-mr-ink/30 bg-mr-cyan/30 px-2.5 py-1 text-xs font-bold text-cyan-800 dark:text-cyan-300">
            <Loader2 size={13} className="animate-spin" />
            Processing
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 border border-mr-ink/30 bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={13} />
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 border border-mr-ink/30 bg-mr-coral/30 px-2.5 py-1 text-xs font-bold text-rose-800 dark:text-rose-300">
            <AlertCircle size={13} />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center border border-mr-ink/30 bg-mr-surface2 px-2.5 py-1 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card flex max-h-[90vh] w-full max-w-2xl flex-col p-6 shadow-hard">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-mr-ink pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-mr-purple text-white shadow-mr-sm">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Timesheet Generation Jobs
              </h2>
              <p className="text-xs text-mr-muted">
                Track asynchronous spreadsheet exports and download files.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchJobs(true)}
              disabled={loading}
              title="Refresh list"
              className="p-2 border border-mr-ink bg-mr-surface hover:bg-mr-surface2 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-mr-purple" : ""}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 border border-mr-ink hover:bg-mr-surface2 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Generator Panel */}
        <div className="mb-4 border-2 border-mr-ink bg-mr-surface2/60 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-mr-purple" />
              <span className="text-xs font-bold">Queue New Export:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="input py-1 px-2 text-xs font-semibold"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="input py-1 px-2 text-xs font-semibold"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="btn-purple py-1 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                {generating ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={13} />
                )}
                Queue Export
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading && jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="animate-spin text-mr-purple mb-2" size={24} />
              <p className="text-sm font-semibold text-mr-muted">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-mr-ink/30 p-6">
              <FileSpreadsheet size={32} className="text-mr-muted mb-2" />
              <p className="text-sm font-bold">No timesheet jobs found</p>
              <p className="text-xs text-mr-muted mt-1 max-w-sm">
                Queue your first timesheet generation above or from the dashboard Export button.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {jobs.map((job) => {
                const monthLabel = MONTH_NAMES[(job.month || 1) - 1] || `Month ${job.month}`;
                const createdDate = job.created_at
                  ? new Date(job.created_at).toLocaleString()
                  : "N/A";

                return (
                  <div
                    key={job.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-mr-ink bg-mr-surface p-3.5 shadow-mr-sm hover:translate-x-0.5 transition-transform"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm">
                          {monthLabel} {job.year}
                        </span>
                        {getStatusBadge(job.status)}
                      </div>
                      <span className="text-[11px] text-mr-muted">
                        Requested: {createdDate}
                      </span>
                      {job.error_message && (
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle size={13} className="shrink-0" />
                          {job.error_message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {job.status === "completed" && job.download_url ? (
                        <a
                          href={job.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`Timesheet_${job.month}_${job.year}.xlsx`}
                          className="btn-purple py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Download size={13} />
                          Download XLSX
                        </a>
                      ) : job.status === "queued" || job.status === "processing" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-mr-muted font-medium py-1 px-2 border border-mr-ink/20 bg-mr-surface2">
                          <Loader2 size={12} className="animate-spin text-mr-purple" />
                          Processing in worker...
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-mr-ink/20 flex items-center justify-between text-xs text-mr-muted">
          <span>Files are securely saved on S3 with 7-day presigned URLs.</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost py-1 px-3 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
