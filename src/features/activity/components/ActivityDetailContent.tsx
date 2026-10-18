"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  IconCalendarEvent,
  IconLoader2,
  IconArrowLeft,
  IconCopy,
  IconShieldCheck,
  IconCheck,
} from "@tabler/icons-react";
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
      <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: "40vh" }}>
        <IconLoader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  const isEditing = Boolean(activeId);

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      {/* Page Header */}
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn btn-outline-secondary btn-icon"
              aria-label="Back to dashboard"
            >
              <IconArrowLeft size={18} />
            </button>
          </div>
          <div className="col">
            <div className="page-pretitle text-secondary">
              {isEditing ? "Update Entry" : "Daily Timesheet Entry"}
            </div>
            <h2 className="page-title">
              {isEditing ? "Edit Activity" : "Daily Activity"}
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="card shadow-sm">
        <div className="card-body">
          {/* Row 1: Date & Status */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="date" className="form-label required mb-0">Date</label>
                <button
                  type="button"
                  onClick={copyPreviousDay}
                  disabled={copying}
                  title="Salin aktivitas dari hari aktif sebelumnya"
                  className="btn btn-link btn-sm p-0 text-primary small d-flex align-items-center gap-1"
                >
                  {copying ? (
                    <IconLoader2 size={13} className="animate-spin" />
                  ) : (
                    <IconCopy size={13} />
                  )}
                  Salin Hari Sebelumnya
                </button>
              </div>
              <input
                id="date"
                className="form-control bg-body-tertiary"
                value={form.date ? form.date.split("T")[0] : "-"}
                readOnly
                disabled
              />
            </div>

            <div className="col-sm-6">
              <label htmlFor="status" className="form-label required">Status Kehadiran</label>
              <select
                id="status"
                className="form-select"
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

          {/* Row 2: Time In & Time Out */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label htmlFor="start_time" className="form-label">Time In</label>
              <input
                id="start_time"
                className="form-control"
                type="time"
                value={form.start_time || ""}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div className="col-6">
              <label htmlFor="end_time" className="form-label">Time Out</label>
              <input
                id="end_time"
                className={`form-control ${
                  form.start_time && form.end_time && form.end_time <= form.start_time
                    ? "is-invalid"
                    : ""
                }`}
                type="time"
                min={form.start_time}
                value={form.end_time || ""}
                onChange={(e) => set("end_time", e.target.value)}
              />
              {form.start_time && form.end_time && form.end_time <= form.start_time && (
                <div className="invalid-feedback">Time Out must be after Time In</div>
              )}
            </div>
          </div>

          {/* Row 3: Activity Description */}
          <div className="mb-3">
            <label htmlFor="activity" className="form-label required">Activity Description</label>
            <textarea
              id="activity"
              className="form-control"
              rows={3}
              value={form.activity || ""}
              onChange={(e) => set("activity", e.target.value)}
              placeholder="What did you work on today?"
              required
            />
          </div>

          {/* Row 4: Project / Application */}
          <div className="mb-3">
            <label htmlFor="project_ref_id" className="form-label">
              Project / Aplikasi
            </label>
            <select
              id="project_ref_id"
              className="form-select"
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
              <div className="form-text text-secondary small mt-1">
                Project Name: <strong className="text-body">{form.app_impacted}</strong>
              </div>
            )}
          </div>

          {/* Berita Acara Section */}
          <div className="card card-sm bg-body-tertiary mb-2">
            <div className="card-body">
              <label className="form-check mb-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_berita_acara)}
                  onChange={(e) => set("is_berita_acara", e.target.checked)}
                  className="form-check-input"
                />
                <span className="form-check-label d-flex align-items-center gap-1.5 fw-semibold">
                  <IconShieldCheck
                    size={18}
                    className={form.is_berita_acara ? "text-primary" : "text-secondary"}
                  />
                  Perlu Berita Acara (Lupa tap absen / kendala kehadiran)
                </span>
              </label>

              {form.is_berita_acara && (
                <div className="mt-3 pt-3 border-top">
                  <div className="mb-3">
                    <label className="form-label required">
                      Catatan / Alasan Berita Acara
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Contoh: Lupa tap absen masuk / Mesin absen maintenance"
                      value={form.berita_acara_notes || ""}
                      onChange={(e) => set("berita_acara_notes", e.target.value)}
                      required={form.is_berita_acara}
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Saksi Berita Acara (Rekan Kerja)
                    </label>
                    <select
                      className="form-select"
                      value={form.witness_id || ""}
                      onChange={(e) =>
                        set("witness_id", e.target.value ? Number(e.target.value) : undefined)
                      }
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
          </div>
        </div>

        <div className="card-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="btn btn-outline-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary d-inline-flex align-items-center gap-1"
            disabled={saving}
          >
            {saving ? (
              <IconLoader2 size={16} className="animate-spin me-1" />
            ) : (
              <IconCheck size={16} className="me-1" />
            )}
            {isEditing ? "Update Activity" : "Save Activity"}
          </button>
        </div>
      </form>
    </div>
  );
}
