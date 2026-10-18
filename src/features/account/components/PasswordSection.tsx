"use client";

import Link from "next/link";
import { IconLock, IconChevronRight } from "@tabler/icons-react";

export function PasswordSection() {
  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="avatar avatar-sm bg-primary-lt text-primary">
              <IconLock size={18} />
            </span>
            <div>
              <h3 className="card-title mb-0">Password & Authentication</h3>
              <div className="text-secondary small">
                Manage your credentials and sign-in protection.
              </div>
            </div>
          </div>
          <div>
            <Link href="/change-password" className="btn btn-outline-primary d-inline-flex align-items-center gap-1">
              Change Password <IconChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
