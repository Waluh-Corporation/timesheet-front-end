"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Loader2, ArrowLeft } from "lucide-react";
import { useActivityData } from "../hooks/useActivityData";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ActivityDetailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const defaultDate = params.get("date") || todayISO();

  const { form, set, setProjectDetails, submit, loading, saving, activeId, projects } = useActivityData(id, defaultDate);

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
          <div className="grid h-11 w-11 place-items-center border-2 border-mr-ink bg-mr-yellow text-black">
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

      <form onSubmit={submit} className="card flex flex-col gap-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="mb-1 block text-xs font-bold uppercase">Date</label>
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
              <option value="P">Present</option>
              <option value="S">Sick</option>
              <option value="PM">Permission</option>
              <option value="V">Leave</option>
              <option value="BT">Business Trip</option>
              <option value="X">Off</option>
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
              className="input"
              type="time"
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
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 flex justify-end gap-2">
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
