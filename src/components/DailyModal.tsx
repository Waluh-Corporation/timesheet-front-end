"use client";

import { useEffect, useState } from "react";
import { X, Loader2, CalendarDays } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { ActivityStatus, DailyActivity, Project } from "@/lib/types";
import { fetchActivityStatuses, fetchProjects } from "@/app/(admin)/master-data/services/masterData";

function todayISO(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

const DEFAULT_STATUSES: ActivityStatus[] = [
  { code: "P", name: "Present", is_working_day: true, sort_order: 1 },
  { code: "S", name: "Sick", is_working_day: false, sort_order: 2 },
  { code: "PM", name: "Permission", is_working_day: false, sort_order: 3 },
  { code: "V", name: "Leave", is_working_day: false, sort_order: 4 },
  { code: "BT", name: "Business Trip", is_working_day: true, sort_order: 5 },
  { code: "X", name: "Off", is_working_day: false, sort_order: 6 },
];

export default function DailyModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { notify } = useToast();
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<ActivityStatus[]>(DEFAULT_STATUSES);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<DailyActivity>({
    date: todayISO(),
    start_time: "08:00",
    end_time: "17:00",
    status: "P",
    activity: "",
    project_name: "",
    project_id: "",
    app_impacted: "",
  });

  useEffect(() => {
    fetchActivityStatuses().then((res) => {
      if (res && res.length > 0) setStatuses(res);
    });
    fetchProjects().then((res) => {
      if (res) setProjects(res);
    });
  }, []);

  const set = (k: keyof DailyActivity, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleProjectChange = (projectIdStr: string) => {
    if (!projectIdStr) {
      setForm((prev) => ({
        ...prev,
        project_ref_id: undefined,
        project_id: "",
        project_name: "",
        app_impacted: "",
      }));
      return;
    }
    const pId = Number.parseInt(projectIdStr, 10);
    const p = projects.find((proj) => proj.id === pId);
    if (p) {
      setForm((prev) => ({
        ...prev,
        project_ref_id: p.id,
        project_id: p.code,
        project_name: p.name,
        app_impacted: p.app_impacted || "",
      }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/v1/activities", { method: "POST", body: JSON.stringify(form) });
      notify("Saved today's activity 🎉", "success");
      onSaved();
      onClose();
    } catch (err: any) {
      notify(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 shadow-hard">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center bg-mr-yellow text-black">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">Today&apos;s Activity</h2>
              <p className="text-xs text-mr-muted">Fill in what you worked on.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-mr-surface2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold">Date</label>
              <input
                className="input"
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold">Time In</label>
              <input
                className="input"
                type="time"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Time Out</label>
              <input
                className="input"
                type="time"
                value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold">Activity</label>
            <textarea
              className="input min-h-[80px]"
              value={form.activity}
              onChange={(e) => set("activity", e.target.value)}
              placeholder="What did you work on today?"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold">Project / Aplikasi</label>
            <select
              className="input"
              value={form.project_ref_id || ""}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">— Pilih Project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.app_impacted ? `(${p.app_impacted})` : ""}
                </option>
              ))}
            </select>
          </div>

          {form.app_impacted && (
            <div className="text-xs text-mr-muted">
              App Impacted: <span className="font-semibold text-mr-ink">{form.app_impacted}</span>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Save activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
