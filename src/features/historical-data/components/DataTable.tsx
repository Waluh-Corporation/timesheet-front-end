"use client";

import { IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import type { DailyActivity } from "@/lib/types";

type DataTableProps = Readonly<{
  loading: boolean;
  activities: DailyActivity[];
}>;

export function DataTable({ loading, activities }: DataTableProps) {
  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-center py-5">
          <IconLoader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-5 text-secondary">
          <IconAlertCircle size={32} className="mb-2 opacity-50" />
          <div className="fw-semibold">No activities found</div>
          <div className="small">Try adjusting your filters above.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-vcenter card-table table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Activity Description</th>
              <th>Project Name</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act, i) => {
              let dateLabel = act.date || "-";
              if (act.date) {
                const dateOnly = act.date.split("T")[0];
                const parts = dateOnly.split("-");
                if (parts.length === 3) {
                  const year = Number(parts[0]);
                  const monthIdx = Number(parts[1]) - 1;
                  const day = Number(parts[2]);
                  const dateObj = new Date(year, monthIdx, day);

                  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const months = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                  ];

                  const dow = days[dateObj.getDay()];
                  const monthName = months[monthIdx];
                  dateLabel = `${monthName} ${day} · ${dow}`;
                }
              }

              return (
                <tr key={act.id || i}>
                  <td className="fw-semibold text-nowrap">{dateLabel}</td>
                  <td className="text-nowrap">
                    {act.status ? (
                      <span className="badge bg-primary-lt fw-bold">{act.status}</span>
                    ) : (
                      <span className="text-secondary">-</span>
                    )}
                  </td>
                  <td className="text-nowrap">{act.start_time || "-"}</td>
                  <td className="text-nowrap">{act.end_time || "-"}</td>
                  <td
                    className="text-truncate"
                    style={{ maxWidth: 360 }}
                    title={act.activity}
                  >
                    {act.activity || "-"}
                  </td>
                  <td className="text-nowrap text-secondary small">
                    {act.app_impacted || act.project_ref?.app_impacted || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
