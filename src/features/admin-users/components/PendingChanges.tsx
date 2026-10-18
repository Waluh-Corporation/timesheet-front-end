"use client";

import Link from "next/link";
import { IconClipboardList, IconChevronRight, IconCheck, IconX } from "@tabler/icons-react";
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
    <div className="card mb-4 border-warning">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar avatar-sm bg-warning-lt text-warning">
            <IconClipboardList size={18} />
          </span>
          <h3 className="card-title mb-0">Pending Profile Changes</h3>
          <span className="badge bg-warning">{changes.length}</span>
        </div>
        <Link
          href="/profile-changes"
          className="btn btn-sm btn-link link-secondary d-inline-flex align-items-center gap-1"
        >
          Manage all requests <IconChevronRight size={14} />
        </Link>
      </div>

      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {changes.map((c) => (
            <div
              key={c.id}
              className="list-group-item d-flex flex-wrap align-items-center justify-content-between gap-3 p-3"
            >
              <div>
                <div className="fw-bold">{c.user?.username || `User #${c.user_id}`}</div>
                <div className="text-secondary small">
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
                </div>
                {c.notes && (
                  <div className="text-secondary fst-italic small mt-1 bg-light p-1 rounded">
                    Note: &quot;{c.notes}&quot;
                  </div>
                )}
              </div>
              <div className="btn-group">
                <button
                  type="button"
                  onClick={() => onReview(c, "approve")}
                  className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                >
                  <IconCheck size={14} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => onReview(c, "reject")}
                  className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                >
                  <IconX size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
