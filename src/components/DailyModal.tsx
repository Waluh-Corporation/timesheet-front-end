"use client";

import { useEffect, useState } from "react";
import { X, Loader2, CalendarDays, Copy, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { ActivityStatus, DailyActivity, Project, WitnessResponse } from "@/lib/types";
import { fetchActivityStatuses, fetchProjects } from "@/app/(admin)/master-data/services/masterData";
import { fetchEligibleWitnesses, fetchPreviousDayActivity } from "@/services/activityService";

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
  const [copying, setCopying] = useState(false);
  const [statuses, setStatuses] = useState<ActivityStatus[]>(DEFAULT_STATUSES);
  const [projects, setProjects] = useState<Project[]>([]);
  const [witnesses, setWitnesses] = useState<WitnessResponse[]>([]);
  const [form, setForm] = useState<DailyActivity>({
    date: todayISO(),
    start_time: "08:00",
    end_time: "17:00",
    status: "P",
    activity: "",
    project_name: "",
    project_id: "",
    app_impacted: "",
    is_berita_acara: false,
    berita_acara_notes: "",
    witness_id: undefined,
  });

  useEffect(() => {
    fetchActivityStatuses().then((res) => {
      if (res && res.length > 0) setStatuses(res);
    });
    fetchProjects().then((res) => {
      if (res) setProjects(res);
    });
    fetchEligibleWitnesses().then((res) => {
      if (res) setWitnesses(res);
    });
  }, []);

  const set = (k: keyof DailyActivity, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleCopyPreviousDay = async () => {
    setCopying(true);
    try {
      const prev = await fetchPreviousDayActivity(form.date);
      if (prev) {
        setForm((curr) => {
          const matchedProj =
            (prev.project_ref_id ? projects.find((p) => p.id === prev.project_ref_id) : undefined) ||
            (prev.project_name ? projects.find((p) => p.name?.trim().toLowerCase() === prev.project_name.trim().toLowerCase()) : undefined);

          return {
            ...curr,
            activity: prev.activity || curr.activity,
            start_time: prev.start_time || curr.start_time,
            end_time: prev.end_time || curr.end_time,
            status: prev.status || curr.status,
            project_ref_id: prev.project_ref_id || matchedProj?.id || curr.project_ref_id,
            project_id: prev.project_id || matchedProj?.code || curr.project_id,
            project_name: prev.project_name || matchedProj?.name || curr.project_name,
            app_impacted: prev.app_impacted || matchedProj?.app_impacted || curr.app_impacted,
          };
        });
        notify("Berhasil menyalin data kegiatan hari sebelumnya 📋", "success");
      }
    } catch (err: any) {
      notify(err.message || "Tidak ada kegiatan sebelumnya yang dapat disalin", "error");
    } finally {
      setCopying(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="card w-full max-w-lg p-6 shadow-hard max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b-2 border-mr-ink pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center bg-mr-yellow text-black shadow-hard-sm">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Today&apos;s Activity</h2>
              <p className="text-xs text-mr-muted">Fill in what you worked on.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 border border-mr-ink hover:bg-mr-surface2 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold">Date</label>
                <button
                  type="button"
                  onClick={handleCopyPreviousDay}
                  disabled={copying}
                  title="Salin aktivitas dari hari aktif sebelumnya"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-mr-purple hover:underline disabled:opacity-50"
                >
                  {copying ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Copy size={12} />
                  )}
                  Salin Kemarin
                </button>
              </div>
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
              Project Name: <span className="font-semibold text-mr-ink">{form.app_impacted}</span>
            </div>
          )}

          {/* Berita Acara Section */}
          <div className="border-2 border-mr-ink/30 bg-mr-surface2/50 p-3 mt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs select-none">
              <input
                type="checkbox"
                checked={!!form.is_berita_acara}
                onChange={(e) => set("is_berita_acara", e.target.checked)}
                className="h-4 w-4 border-2 border-mr-ink accent-mr-purple cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className={form.is_berita_acara ? "text-mr-purple" : "text-mr-muted"} />
                Perlu Berita Acara (Lupa tap absen / Kendala kehadiran)
              </span>
            </label>

            {form.is_berita_acara && (
              <div className="flex flex-col gap-2.5 pt-3 mt-2 border-t border-mr-ink/20 animate-in fade-in duration-150">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase text-mr-muted">
                    Catatan / Alasan Berita Acara <span className="text-rose-500">*</span>
                  </label>
                  <input
                    className="input text-xs"
                    type="text"
                    placeholder="Contoh: Lupa tap absen masuk / Mesin absen maintenance"
                    value={form.berita_acara_notes || ""}
                    onChange={(e) => set("berita_acara_notes", e.target.value)}
                    required={form.is_berita_acara}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase text-mr-muted">
                    Saksi Berita Acara (Rekan Kerja)
                  </label>
                  <select
                    className="input text-xs font-semibold"
                    value={form.witness_id || ""}
                    onChange={(e) => set("witness_id", e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">— Pilih Saksi —</option>
                    {witnesses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t-2 border-mr-ink pt-3">
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
