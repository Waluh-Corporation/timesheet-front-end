"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Loader2, ArrowLeft, Copy, ShieldCheck } from "lucide-react";
import { useActivityData } from "../hooks/useActivityData";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ActivityDetailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const defaultDate = params.get("date") || todayISO();

  const {
    form,
    set,
    setProjectDetails,
    submit,
    loading,
    saving,
    copying,
    copyPreviousDay,
    activeId,
    projects,
    statuses,
    witnesses,
  } = useActivityData(id, defaultDate);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-mr-purple" />
      </div>
    );
  }

  const isEditing = !!activeId;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="btn-ghost px-3">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center border-2 border-mr-ink bg-mr-yellow text-black shadow-hard-sm">
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{isEditing ? "Edit Activity" : "Daily Activity"}</h1>
            <p className="text-sm text-mr-muted">
              {isEditing ? "Update your activity details." : "Fill today or pick a past date."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="card flex flex-col gap-4 p-6 shadow-hard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="date" className="text-xs font-bold uppercase">Date</label>
              <button
                type="button"
                onClick={copyPreviousDay}
                disabled={copying}
                title="Salin aktivitas dari hari aktif sebelumnya"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-mr-purple hover:underline disabled:opacity-50"
              >
                {copying ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Copy size={12} />
                )}
                Salin Hari Sebelumnya
              </button>
            </div>
            <div id="date" className="input bg-mr-surface2 flex items-center text-mr-muted cursor-not-allowed">
              {form.date ? form.date.split("T")[0] : "-"}
            </div>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-xs font-bold uppercase">Status</label>
            <select
              id="status"
              className="input"
              value={form.status || "P"}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_time" className="mb-1 block text-xs font-bold uppercase">Time In</label>
            <input
              id="start_time"
              className="input"
              type="time"
              value={form.start_time || ""}
              onChange={(e) => set("start_time", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="end_time" className="mb-1 block text-xs font-bold uppercase">Time Out</label>
            <input
              id="end_time"
              className={`input ${form.start_time && form.end_time && form.end_time <= form.start_time ? "bg-mr-surface2 text-mr-muted border-red-500" : ""}`}
              type="time"
              min={form.start_time}
              value={form.end_time || ""}
              onChange={(e) => set("end_time", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="activity" className="mb-1 block text-xs font-bold uppercase">Activity</label>
          <textarea
            id="activity"
            className="input min-h-[96px]"
            value={form.activity || ""}
            onChange={(e) => set("activity", e.target.value)}
            placeholder="What did you work on?"
          />
        </div>

        <div>
          <label htmlFor="project_ref_id" className="mb-1 block text-xs font-semibold">
            Project / Aplikasi
          </label>
          <select
            id="project_ref_id"
            className="input"
            value={form.project_ref_id || ""}
            onChange={(e) => setProjectDetails(e.target.value)}
          >
            <option value="">— Pilih Project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.app_impacted ? `(${p.app_impacted})` : ""}
              </option>
            ))}
          </select>
          {form.app_impacted && (
            <p className="mt-1 text-xs text-mr-muted">
              Project Name: <span className="font-semibold text-mr-ink">{form.app_impacted}</span>
            </p>
          )}
        </div>

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
          <button type="button" onClick={() => router.push("/dashboard")} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEditing ? "Update activity" : "Save activity"}
          </button>
        </div>
      </form>
    </div>
  );
}
