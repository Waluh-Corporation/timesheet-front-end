"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  UserCheck,
  Building,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import type { OvertimeEntry, OvertimeRequest, Approver } from "@/lib/types";
import { fetchOvertimes, upsertOvertime, deleteOvertime } from "@/services/overtime";
import { fetchApprovers } from "@/app/(admin)/master-data/services/masterData";

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

export default function OvertimePage() {
  const { notify } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [entries, setEntries] = useState<OvertimeEntry[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<Approver[]>([]);
  const [deptHeads, setDeptHeads] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header banner */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-mr-yellow p-6 text-black">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center border-2 border-black bg-white text-black">
              <Clock size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Overtime (Lembur)</h1>
              <p className="mt-0.5 text-sm font-semibold opacity-80">
                Log and track monthly overtime work and SPL approvers.
              </p>
            </div>
          </div>
          <button onClick={openNewModal} className="btn-primary">
            <Plus size={18} /> Log Overtime
          </button>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Month selector card */}
        <div className="card flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-mr-purple text-white">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-mr-muted">Period</p>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  aria-label="Filter by month"
                  className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter by year"
                  className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
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

        {/* Total Entries */}
        <div className="card flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 place-items-center bg-mr-cyan text-mr-ink">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-mr-muted">Total Entries</p>
            <p className="text-lg font-extrabold">{entries.length} day{entries.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        {/* Total Hours */}
        <div className="card flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 place-items-center bg-mr-pink text-white">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-mr-muted">Total Hours</p>
            <p className="text-lg font-extrabold">{totalHours.toFixed(1)} hrs</p>
          </div>
        </div>
      </div>

      {/* Overtime records list */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold">
          Records for {months[month - 1]} {year}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-mr-purple" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={32} className="text-mr-muted mb-2" />
            <p className="font-semibold text-mr-ink">No overtime logged for this month.</p>
            <p className="text-xs text-mr-muted mt-1">
              Click &quot;Log Overtime&quot; above to record hours and assign approvers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Hours</th>
                  <th className="pb-3">Task Description</th>
                  <th className="pb-3">Team Leader</th>
                  <th className="pb-3">Dept Head</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item) => {
                  const hrs = calculateHours(item.start_time, item.end_time);
                  const dateDisplay = item.date ? item.date.split("T")[0] : "-";
                  return (
                    <tr key={item.id} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50 transition">
                      <td className="py-3 font-semibold whitespace-nowrap">
                        {dateDisplay}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className="chip bg-mr-surface2 text-mr-ink font-bold">
                          {item.start_time} - {item.end_time} ({hrs}h)
                        </span>
                      </td>
                      <td className="py-3 max-w-xs truncate" title={item.task_description}>
                        {item.task_description}
                      </td>
                      <td className="py-3 whitespace-nowrap text-xs">
                        {item.team_leader?.name || "-"}
                      </td>
                      <td className="py-3 whitespace-nowrap text-xs">
                        {item.department_head?.name || "-"}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn border border-mr-ink py-1 px-2.5 text-xs hover:bg-mr-yellow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => item.id && handleDelete(item.id)}
                            className="border border-mr-ink p-1.5 text-mr-muted hover:bg-mr-pink hover:text-white transition"
                            title="Delete record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-hard">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center bg-mr-yellow text-black">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold">
                    {form.id ? "Edit Overtime Entry" : "Log Overtime (SPL)"}
                  </h2>
                  <p className="text-xs text-mr-muted">
                    Record task details and assign approving managers.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-mr-surface2">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Date</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Start Time</label>
                  <input
                    className="input"
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">End Time</label>
                  <input
                    className={`input ${form.start_time && form.end_time && form.end_time <= form.start_time ? "bg-mr-surface2 text-mr-muted border-red-500" : ""}`}
                    type="time"
                    min={form.start_time}
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Task Description</label>
                <textarea
                  className="input min-h-[80px]"
                  value={form.task_description}
                  onChange={(e) => setForm({ ...form, task_description: e.target.value })}
                  placeholder="What tasks were completed during overtime?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold flex items-center gap-1">
                    <UserCheck size={14} /> Team Leader
                  </label>
                  <select
                    className="input"
                    value={form.team_leader_id || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        team_leader_id: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  >
                    <option value="">— Select Team Leader —</option>
                    {teamLeaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.name} {tl.title ? `(${tl.title})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold flex items-center gap-1">
                    <Building size={14} /> Department Head
                  </label>
                  <select
                    className="input"
                    value={form.department_head_id || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        department_head_id: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  >
                    <option value="">— Select Dept Head —</option>
                    {deptHeads.map((dh) => (
                      <option key={dh.id} value={dh.id}>
                        {dh.name} {dh.title ? `(${dh.title})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {form.id ? "Update Entry" : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
