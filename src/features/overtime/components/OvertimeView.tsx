"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconClock,
  IconPlus,
  IconCalendar,
  IconFileText,
} from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import type { OvertimeEntry, OvertimeRequest, Approver } from "@/lib/types";
import {
  fetchOvertimes,
  upsertOvertime,
  deleteOvertime,
  fetchApprovers,
} from "../services/overtimeService";
import { OvertimeFormModal } from "./OvertimeFormModal";
import { OvertimeTable } from "./OvertimeTable";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return 0;
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const diff = endMins - startMins;
  return diff > 0 ? Number((diff / 60).toFixed(1)) : 0;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function OvertimeView() {
  const { notify } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [entries, setEntries] = useState<OvertimeEntry[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<Approver[]>([]);
  const [deptHeads, setDeptHeads] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OvertimeRequest>({
    date: todayISO(),
    start_time: "17:00",
    end_time: "20:00",
    task_description: "",
    team_leader_id: undefined,
    department_head_id: undefined,
  });

  const loadApprovers = useCallback(async () => {
    try {
      const [tls, dhs] = await Promise.all([
        fetchApprovers("team_leader"),
        fetchApprovers("department_head"),
      ]);
      setTeamLeaders(tls);
      setDeptHeads(dhs);
    } catch (err: any) {
      console.error("Failed to load approvers", err);
    }
  }, []);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOvertimes(year, month);
      setEntries(data || []);
    } catch (err: any) {
      notify(err.message || "Failed to load overtime records", "error");
    } finally {
      setLoading(false);
    }
  }, [year, month, notify]);

  useEffect(() => {
    loadApprovers();
  }, [loadApprovers]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const openNewModal = () => {
    setForm({
      date: todayISO(),
      start_time: "17:00",
      end_time: "20:00",
      task_description: "",
      team_leader_id: teamLeaders[0]?.id,
      department_head_id: deptHeads[0]?.id,
    });
    setShowModal(true);
  };

  const openEditModal = (entry: OvertimeEntry) => {
    setForm({
      id: entry.id,
      date: entry.date ? entry.date.split("T")[0] : todayISO(),
      start_time: entry.start_time,
      end_time: entry.end_time,
      task_description: entry.task_description,
      team_leader_id: entry.team_leader_id,
      department_head_id: entry.department_head_id,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task_description.trim()) {
      notify("Please fill in task description", "error");
      return;
    }
    if (form.start_time && form.end_time) {
      if (form.end_time <= form.start_time) {
        notify("End Time must be greater than Start Time", "error");
        return;
      }
    }
    setSaving(true);
    try {
      await upsertOvertime(form);
      notify(form.id ? "Overtime entry updated" : "Overtime entry logged 🎉", "success");
      setShowModal(false);
      loadEntries();
    } catch (err: any) {
      notify(err.message || "Failed to save overtime", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this overtime entry?")) return;
    try {
      await deleteOvertime(id);
      notify("Overtime entry deleted", "success");
      loadEntries();
    } catch (err: any) {
      notify(err.message || "Delete failed", "error");
    }
  };

  const totalHours = entries.reduce(
    (acc, cur) => acc + calculateHours(cur.start_time, cur.end_time),
    0
  );

  return (
    <div className="d-flex flex-column gap-3">
      {/* Page Header */}
      <div className="page-header d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle text-secondary">Work Records</div>
            <h2 className="page-title">Overtime</h2>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <button
              type="button"
              onClick={openNewModal}
              className="btn btn-primary d-inline-flex align-items-center gap-1"
            >
              <IconPlus size={18} /> Log Overtime
            </button>
          </div>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="row row-cards">
        {/* Period Selector Card */}
        <div className="col-sm-6 col-lg-4">
          <div className="card card-sm shadow-sm">
            <div className="card-body d-flex align-items-center">
              <span className="avatar bg-primary-lt text-primary me-3 rounded">
                <IconCalendar size={22} />
              </span>
              <div className="min-w-0 flex-fill">
                <div className="text-secondary small fw-medium">Period Filter</div>
                <div className="d-flex gap-2 mt-1">
                  <select
                    className="form-select form-select-sm"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    aria-label="Filter by month"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-select form-select-sm"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    aria-label="Filter by year"
                  >
                    {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Entries */}
        <div className="col-sm-6 col-lg-4">
          <div className="card card-sm shadow-sm">
            <div className="card-body d-flex align-items-center">
              <span className="avatar bg-cyan-lt text-cyan me-3 rounded">
                <IconFileText size={22} />
              </span>
              <div>
                <div className="text-secondary small fw-medium">Total Entries</div>
                <div className="h2 mb-0 fw-bold">{entries.length} day{entries.length === 1 ? "" : "s"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Hours */}
        <div className="col-sm-6 col-lg-4">
          <div className="card card-sm shadow-sm">
            <div className="card-body d-flex align-items-center">
              <span className="avatar bg-pink-lt text-pink me-3 rounded">
                <IconClock size={22} />
              </span>
              <div>
                <div className="text-secondary small fw-medium">Total Overtime Hours</div>
                <div className="h2 mb-0 fw-bold">{totalHours.toFixed(1)} hrs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overtime records card */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h3 className="card-title mb-0">
            Records for {MONTHS[month - 1]} {year}
          </h3>
        </div>
        <OvertimeTable
          entries={entries}
          loading={loading}
          onEdit={openEditModal}
          onDelete={handleDelete}
          calculateHours={calculateHours}
        />
      </div>

      <OvertimeFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
        teamLeaders={teamLeaders}
        deptHeads={deptHeads}
      />
    </div>
  );
}
