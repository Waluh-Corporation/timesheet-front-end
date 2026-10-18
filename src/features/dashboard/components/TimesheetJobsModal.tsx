"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  IconLoader2,
  IconFileSpreadsheet,
  IconDownload,
  IconAlertCircle,
  IconRefresh,
  IconClock,
  IconCircleCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/tabler";
import type { TimesheetJobResponse } from "@/lib/types";
import {
  getTimesheetJobs,
  requestTimesheetGeneration,
} from "@/services/timesheetService";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

  useEffect(() => {
    if (!isOpen) return;
    fetchJobs(true);
  }, [isOpen, fetchJobs]);

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
      await requestTimesheetGeneration(selectedYear, selectedMonth);
      notify(
        `Timesheet generation job queued for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} ⏳`,
        "success"
      );
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
          <span className="badge bg-warning-lt d-inline-flex align-items-center gap-1">
            <IconClock size={12} className="animate-pulse" />
            Queued
          </span>
        );
      case "processing":
        return (
          <span className="badge bg-info-lt d-inline-flex align-items-center gap-1">
            <IconLoader2 size={12} className="animate-spin" />
            Processing
          </span>
        );
      case "completed":
        return (
          <span className="badge bg-success-lt d-inline-flex align-items-center gap-1">
            <IconCircleCheck size={12} />
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="badge bg-danger-lt d-inline-flex align-items-center gap-1">
            <IconAlertCircle size={12} />
            Failed
          </span>
        );
      default:
        return <span className="badge bg-secondary-lt">{status}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="d-flex align-items-center justify-content-between w-100 pe-3">
          <div className="d-flex align-items-center gap-2">
            <span className="avatar avatar-sm bg-primary-lt text-primary rounded">
              <IconFileSpreadsheet size={18} />
            </span>
            <div>
              <div className="fw-bold">Timesheet Generation Jobs</div>
              <div className="text-secondary small fw-normal">Track asynchronous spreadsheet exports</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchJobs(true)}
            disabled={loading}
            title="Refresh list"
            className="btn btn-icon btn-sm btn-ghost"
          >
            <IconRefresh size={16} className={loading ? "animate-spin text-primary" : ""} />
          </button>
        </div>
      }
      footer={
        <div className="d-flex align-items-center justify-content-between w-100 text-secondary small">
          <span>Files are securely saved with 7-day presigned URLs.</span>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      }
    >
      <div>
        {/* Quick Generator Bar */}
        <div className="card card-sm bg-body-tertiary mb-3">
          <div className="card-body">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-sm-auto d-flex align-items-center gap-1 text-secondary small fw-medium">
                <IconSparkles size={16} className="text-primary" />
                <span>Queue Export:</span>
              </div>
              <div className="col-6 col-sm-auto">
                <select
                  className="form-select form-select-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-sm-auto">
                <select
                  className="form-select form-select-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-auto ms-sm-auto">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn btn-sm btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-1"
                >
                  {generating ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconFileSpreadsheet size={14} />
                  )}
                  Queue Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
          {loading && jobs.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <IconLoader2 className="animate-spin text-primary mb-2" size={28} />
              <div className="text-secondary small">Loading jobs...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-5 border border-dashed rounded text-secondary">
              <IconFileSpreadsheet size={32} className="mb-2 opacity-50" />
              <div className="fw-semibold">No timesheet jobs found</div>
              <div className="small">Queue your first timesheet generation above.</div>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {jobs.map((job) => {
                const monthLabel = MONTH_NAMES[(job.month || 1) - 1] || `Month ${job.month}`;
                const createdDate = job.created_at
                  ? new Date(job.created_at).toLocaleString()
                  : "N/A";

                const isZip = Boolean(
                  job.download_url?.toLowerCase().includes(".zip") ||
                  job.download_url?.toLowerCase().includes("berita_acara")
                );
                const downloadFileName = isZip
                  ? `Timesheet_${job.month}_${job.year}_and_Berita_Acara.zip`
                  : `Timesheet_${job.month}_${job.year}.xlsx`;

                return (
                  <div
                    key={job.id}
                    className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 py-3"
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold">
                          {monthLabel} {job.year}
                        </span>
                        {getStatusBadge(job.status)}
                        {isZip && (
                          <span className="badge bg-purple-lt">
                            XLSX + Berita Acara DOCX
                          </span>
                        )}
                      </div>
                      <div className="text-secondary small">Requested: {createdDate}</div>
                      {job.error_message && (
                        <div className="text-danger small mt-1 d-flex align-items-center gap-1">
                          <IconAlertCircle size={14} />
                          <span>{job.error_message}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {job.status === "completed" && job.download_url ? (
                        <a
                          href={job.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={downloadFileName}
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                        >
                          <IconDownload size={14} />
                          {isZip ? "Unduh ZIP" : "Download XLSX"}
                        </a>
                      ) : job.status === "queued" || job.status === "processing" ? (
                        <span className="badge bg-secondary-lt d-inline-flex align-items-center gap-1">
                          <IconLoader2 size={12} className="animate-spin" />
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
      </div>
    </Modal>
  );
}
