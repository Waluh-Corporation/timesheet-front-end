"use client";

import React from "react";
import { IconClock, IconLoader2, IconCheck } from "@tabler/icons-react";
import { Modal } from "@/components/tabler";
import type { OvertimeRequest, Approver } from "@/lib/types";

interface OvertimeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: OvertimeRequest;
  setForm: React.Dispatch<React.SetStateAction<OvertimeRequest>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  teamLeaders: Approver[];
  deptHeads: Approver[];
}

export function OvertimeFormModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  saving,
  teamLeaders,
  deptHeads,
}: OvertimeFormModalProps) {
  const isEditing = Boolean(form.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="d-flex align-items-center gap-2">
          <span className="avatar avatar-sm bg-primary-lt text-primary rounded">
            <IconClock size={18} />
          </span>
          <div>
            <div className="fw-bold">{isEditing ? "Edit Overtime Entry" : "Log Overtime"}</div>
            <div className="text-secondary small fw-normal">Record task details and assign approving managers.</div>
          </div>
        </div>
      }
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" onClick={onClose} className="btn btn-outline-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="btn btn-primary d-inline-flex align-items-center gap-1"
          >
            {saving ? (
              <IconLoader2 size={16} className="animate-spin me-1" />
            ) : (
              <IconCheck size={16} className="me-1" />
            )}
            {isEditing ? "Update Entry" : "Save Entry"}
          </button>
        </div>
      }
    >
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label required">Date</label>
          <input
            className="form-control"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label required">Start Time</label>
            <input
              className="form-control"
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
          </div>
          <div className="col-6">
            <label className="form-label required">End Time</label>
            <input
              className={`form-control ${
                form.start_time && form.end_time && form.end_time <= form.start_time ? "is-invalid" : ""
              }`}
              type="time"
              min={form.start_time}
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
            {form.start_time && form.end_time && form.end_time <= form.start_time && (
              <div className="invalid-feedback">End Time must be after Start Time</div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label required">Task Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.task_description}
            onChange={(e) => setForm({ ...form, task_description: e.target.value })}
            placeholder="What tasks were completed during overtime?"
            required
          />
        </div>

        <div className="row g-3">
          <div className="col-sm-6">
            <label className="form-label">Team Leader Approver</label>
            <select
              className="form-select"
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

          <div className="col-sm-6">
            <label className="form-label">Department Head Approver</label>
            <select
              className="form-select"
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
      </form>
    </Modal>
  );
}
