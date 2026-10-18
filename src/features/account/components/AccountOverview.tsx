"use client";

import { useAuth } from "@/lib/auth";
import { IconUser, IconMail, IconShield, IconBuilding } from "@tabler/icons-react";

export function AccountOverview() {
  const { user } = useAuth();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Account Overview</h3>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-md-3">
            <div className="d-flex align-items-center mb-1">
              <IconUser size={16} className="text-secondary me-1" />
              <div className="text-uppercase text-secondary fs-6 fw-bold">Username</div>
            </div>
            <div className="fw-semibold text-truncate">{user?.username || "—"}</div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="d-flex align-items-center mb-1">
              <IconMail size={16} className="text-secondary me-1" />
              <div className="text-uppercase text-secondary fs-6 fw-bold">Email</div>
            </div>
            <div className="fw-semibold text-truncate">{user?.email || "—"}</div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="d-flex align-items-center mb-1">
              <IconShield size={16} className="text-secondary me-1" />
              <div className="text-uppercase text-secondary fs-6 fw-bold">Role</div>
            </div>
            <div>
              <span className={`badge ${user?.role === "admin" ? "bg-purple-lt" : "bg-blue-lt"} text-uppercase`}>
                {user?.role || "user"}
              </span>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="d-flex align-items-center mb-1">
              <IconBuilding size={16} className="text-secondary me-1" />
              <div className="text-uppercase text-secondary fs-6 fw-bold">Company</div>
            </div>
            <div className="fw-semibold">{user?.company || "Unassigned"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
