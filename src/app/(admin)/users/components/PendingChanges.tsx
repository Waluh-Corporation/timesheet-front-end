import Link from "next/link";
import { ClipboardList, ChevronRight, Check, X } from "lucide-react";
import type { ProfileChangeRequest } from "@/lib/types";

export function PendingChanges({
  changes,
  onReview,
}: Readonly<{
  changes: ProfileChangeRequest[];
  onReview: (c: ProfileChangeRequest, action: "approve" | "reject") => void;
}>) {
  if (changes.length === 0) return null;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-mr-purple" />
          <h2 className="text-lg font-bold">Pending profile changes</h2>
          <span className="chip bg-mr-yellow text-mr-ink">{changes.length}</span>
        </div>
        <Link
          href="/profile-changes"
          className="text-xs font-bold text-mr-purple hover:underline flex items-center gap-0.5"
        >
          Manage all requests <ChevronRight size={14} />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {changes.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 bg-mr-surface2 p-4"
          >
            <div className="text-sm">
              <p className="font-semibold">{c.user?.username || `User #${c.user_id}`}</p>
              <p className="text-mr-muted">
                {[
                  c.name,
                  c.email ? `Email: ${c.email}` : null,
                  c.employee_id || c.mii_id,
                  c.bni_id ? `BNI: ${c.bni_id}` : null,
                  c.division,
                  c.site,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {c.notes && (
                <p className="text-xs text-mr-ink italic mt-0.5 bg-mr-surface px-2 py-1 border border-mr-ink/20">
                  Note: &quot;{c.notes}&quot;
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onReview(c, "approve")}
                className="btn border-2 border-mr-ink bg-mr-cyan text-mr-ink"
              >
                <Check size={16} /> Approve
              </button>
              <button
                onClick={() => onReview(c, "reject")}
                className="btn border-2 border-mr-ink bg-mr-pink text-white"
              >
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
