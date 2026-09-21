import { Loader2 } from "lucide-react";
import type { ProfileChangeRequest } from "@/lib/types";

interface ChangeRequestsHistoryProps {
  changes: ProfileChangeRequest[];
  loading: boolean;
}

export function ChangeRequestsHistory({ changes, loading }: ChangeRequestsHistoryProps) {
  const statusChip = (s: ProfileChangeRequest["status"]) => {
    const map: Record<string, string> = {
      pending: "bg-mr-yellow text-black",
      approved: "bg-mr-cyan text-black",
      rejected: "bg-mr-pink text-white",
    };
    return `chip ${map[s] || "bg-mr-surface2 text-mr-muted"}`;
  };

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-bold">Change Requests History</h2>
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-mr-purple" />
        </div>
      ) : changes.length === 0 ? (
        <p className="text-sm text-mr-muted">No change requests submitted yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {changes.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-2 border-2 border-mr-ink bg-mr-surface2 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mr-ink/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Request #{c.id}</span>
                  <span className="text-xs text-mr-muted">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <span className={statusChip(c.status)}>{c.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 pt-1">
                {c.name && (
                  <div>
                    <span className="font-bold text-mr-muted">Name:</span> {c.name}
                  </div>
                )}
                {c.email && (
                  <div>
                    <span className="font-bold text-mr-muted">Email:</span> {c.email}
                  </div>
                )}
                {(c.employee_id || c.mii_id) && (
                  <div>
                    <span className="font-bold text-mr-muted">Employee ID:</span>{" "}
                    {c.employee_id || c.mii_id}
                  </div>
                )}
                {c.bni_id && (
                  <div>
                    <span className="font-bold text-mr-muted">BNI ID:</span> {c.bni_id}
                  </div>
                )}
                {c.division && (
                  <div>
                    <span className="font-bold text-mr-muted">Division:</span> {c.division}
                  </div>
                )}
                {c.department && (
                  <div>
                    <span className="font-bold text-mr-muted">Dept:</span> {c.department}
                  </div>
                )}
                {c.site && (
                  <div>
                    <span className="font-bold text-mr-muted">Site:</span> {c.site}
                  </div>
                )}
              </div>

              {c.notes && (
                <div className="text-xs border-l-2 border-mr-purple bg-mr-surface p-2 text-mr-ink">
                  <span className="font-bold text-mr-muted block text-[10px] uppercase">Reason / Notes:</span>
                  <p className="italic">{c.notes}</p>
                </div>
              )}

              {c.reviewed_at && (
                <div className="mt-1 text-xs text-mr-muted bg-mr-surface p-2 border border-mr-ink/20">
                  Reviewed by <span className="font-semibold">{c.reviewer_name || `Admin #${c.reviewed_by}`}</span> on{" "}
                  {new Date(c.reviewed_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
