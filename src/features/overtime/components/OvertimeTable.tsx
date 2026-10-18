"use client";

import { IconTrash, IconEdit, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import type { OvertimeEntry } from "@/lib/types";

interface OvertimeTableProps {
  entries: OvertimeEntry[];
  loading: boolean;
  onEdit: (entry: OvertimeEntry) => void;
  onDelete: (id: number) => void;
  calculateHours: (start: string, end: string) => number;
}

export function OvertimeTable({
  entries,
  loading,
  onEdit,
  onDelete,
  calculateHours,
}: OvertimeTableProps) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <IconLoader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-5 border border-dashed rounded text-secondary">
        <IconAlertCircle size={32} className="mb-2 opacity-50" />
        <div className="fw-semibold">No overtime logged for this month</div>
        <div className="small">Click &quot;Log Overtime&quot; above to record hours and assign approvers.</div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-vcenter card-table table-hover">
        <thead>
          <tr>
            <th>Date</th>
            <th>Hours</th>
            <th>Task Description</th>
            <th>Team Leader</th>
            <th>Dept Head</th>
            <th className="w-1 text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((item) => {
            const hrs = calculateHours(item.start_time, item.end_time);
            const dateDisplay = item.date ? item.date.split("T")[0] : "-";
            return (
              <tr key={item.id}>
                <td className="fw-semibold text-nowrap">{dateDisplay}</td>
                <td className="text-nowrap">
                  <span className="badge bg-secondary-lt fw-bold">
                    {item.start_time} - {item.end_time} ({hrs}h)
                  </span>
                </td>
                <td className="text-truncate" style={{ maxWidth: 260 }} title={item.task_description}>
                  {item.task_description}
                </td>
                <td className="text-nowrap small text-secondary">
                  {item.team_leader?.name || "-"}
                </td>
                <td className="text-nowrap small text-secondary">
                  {item.department_head?.name || "-"}
                </td>
                <td className="text-end text-nowrap">
                  <div className="btn-list flex-nowrap justify-content-end">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <IconEdit size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => item.id && onDelete(item.id)}
                      className="btn btn-sm btn-icon btn-outline-danger"
                      title="Delete record"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
