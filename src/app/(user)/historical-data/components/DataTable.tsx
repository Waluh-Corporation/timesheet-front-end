import { Loader2 } from "lucide-react";
import type { DailyActivity } from "@/lib/types";

type DataTableProps = Readonly<{
  loading: boolean;
  activities: DailyActivity[];
}>;

export function DataTable({ loading, activities }: DataTableProps) {
  let content;

  if (loading) {
    content = (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-mr-purple" />
      </div>
    );
  } else if (activities.length === 0) {
    content = (
      <p className="text-center py-12 text-mr-muted font-semibold">No activities found.</p>
    );
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-mr-surface2">
            <tr className="border-b-2 border-mr-ink">
              <th className="p-4 font-extrabold uppercase">Date</th>
              <th className="p-4 font-extrabold uppercase">Status</th>
              <th className="p-4 font-extrabold uppercase">Time In</th>
              <th className="p-4 font-extrabold uppercase">Time Out</th>
              <th className="p-4 font-extrabold uppercase">Activity</th>
              <th className="p-4 font-extrabold uppercase">App Impacted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mr-ink">
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
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  
                  const dow = days[dateObj.getDay()];
                  const monthName = months[monthIdx];
                  dateLabel = `${monthName} ${day} · ${dow}`;
                }
              }
              
              return (
                <tr key={act.id || i} className="hover:bg-mr-surface2 transition-colors">
                  <td className="p-4 font-semibold">{dateLabel}</td>
                  <td className="p-4">
                    {act.status ? (
                      <span className="font-bold text-sm px-3 py-1 rounded bg-mr-surface2 text-mr-ink border border-mr-ink/10">
                        {act.status}
                      </span>
                    ) : (
                      <span className="text-mr-muted">-</span>
                    )}
                  </td>
                  <td className="p-4">{act.start_time}</td>
                  <td className="p-4">{act.end_time}</td>
                  <td className="p-4 max-w-md truncate" title={act.activity}>
                    {act.activity && act.activity.length > 50 
                      ? `${act.activity.substring(0, 50)}...` 
                      : act.activity}
                  </td>
                  <td className="p-4">{act.app_impacted}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      {content}
    </div>
  );
}
