"use client";

import { Fragment } from "react";
import {
  IconShield,
  IconKey,
  IconBan,
  IconFingerprint,
  IconPencil,
  IconUserX,
  IconCheck,
} from "@tabler/icons-react";
import type { User, Company, Passkey } from "@/lib/types";
import { isUserAnonymized } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export function UserList({
  users,
  companies,
  loading,
  passkeysFor,
  userPasskeys,
  pkLoading,
  onToggleActive,
  onDeactivateUser,
  onAssignCompany,
  onEditUser,
  onViewPasskeys,
  onAnonymizeUser,
}: Readonly<{
  users: User[];
  companies: Company[];
  loading: boolean;
  passkeysFor: number | null;
  userPasskeys: Passkey[];
  pkLoading: boolean;
  onToggleActive: (u: User) => void;
  onDeactivateUser: (u: User) => void;
  onAssignCompany: (u: User, compId?: number, compObj?: Company) => void;
  onEditUser: (u: User) => void;
  onViewPasskeys: (u: User) => void;
  onAnonymizeUser?: (u: User) => void;
}>) {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const renderPasskeyContent = (u: User) => {
    if (pkLoading) {
      return (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status" />
        </div>
      );
    }
    if (userPasskeys.length === 0) {
      return (
        <div className="text-secondary small">
          This user has no registered passkeys.
        </div>
      );
    }
    return (
      <div className="list-group list-group-flush">
        {userPasskeys.map((pk) => {
          const iconSrc = isDark
            ? pk.icon_dark || pk.icon || pk.icon_light
            : pk.icon_light || pk.icon || pk.icon_dark;
          return (
            <div
              key={pk.id}
              className="list-group-item d-flex align-items-center justify-content-between gap-3 px-3 py-2 bg-light"
            >
              <div className="d-flex align-items-center gap-2">
                <span className="avatar avatar-xs bg-white flex-shrink-0">
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      alt={pk.friendly_name || "Authenticator"}
                      className="w-100 h-100 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <IconFingerprint size={16} className="text-primary" />
                  )}
                </span>
                <div>
                  <div className="fw-semibold small">{pk.friendly_name || "Passkey"}</div>
                  <div className="text-secondary fs-6">
                    Added {new Date(pk.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="badge bg-secondary-lt text-uppercase fs-6">
                User Managed
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">All Users</h3>
        <div className="card-actions">
          <span className="badge bg-secondary-lt">{users.length} total</span>
        </div>
      </div>

      {loading ? (
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>User</th>
                <th style={{ minWidth: 320 }}>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th className="w-1 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAnonymized = isUserAnonymized(u);
                const isSelf =
                  Boolean(currentUser?.id && currentUser.id === u.id) ||
                  Boolean(currentUser?.username && u.username === currentUser.username);

                return (
                  <Fragment key={u.id}>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="avatar avatar-sm bg-blue-lt text-blue fw-bold">
                            {(u.name || u.username || "U").charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="fw-semibold">{u.name || u.username}</div>
                            <div className="text-secondary small">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {(() => {
                          const matchedCompany = companies.find(
                            (c) =>
                              (u.company_id && c.id === u.company_id) ||
                              (u.company && c.name?.toLowerCase() === u.company.toLowerCase()) ||
                              (u.company && c.code?.toLowerCase() === u.company.toLowerCase())
                          );
                          const currentVal = matchedCompany ? String(matchedCompany.id) : "";

                          if (isAnonymized) {
                            return (
                              <span className="badge bg-secondary-lt border border-dashed text-nowrap">
                                {matchedCompany
                                  ? `${matchedCompany.code.toUpperCase()} — ${matchedCompany.name}`
                                  : "— Unassigned —"}
                              </span>
                            );
                          }

                          return (
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: 320, width: "auto" }}
                              value={currentVal}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "You cannot modify your own company assignment"
                                  : undefined
                              }
                              onChange={(e) => {
                                if (isSelf) return;
                                const compId = e.target.value ? Number(e.target.value) : undefined;
                                const compObj = companies.find((c) => c.id === compId);
                                onAssignCompany(u, compId, compObj);
                              }}
                            >
                              <option value="">— Unassigned —</option>
                              {companies.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                  {c.code.toUpperCase()} — {c.name}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === "admin" ? "bg-purple-lt" : "bg-secondary-lt"
                          } text-uppercase d-inline-flex align-items-center gap-1`}
                        >
                          {u.role === "admin" && <IconShield size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {isAnonymized ? (
                          <span className="badge bg-secondary-lt border border-dashed text-uppercase">
                            Anonymized
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleActive(u)}
                            disabled={currentUser?.id === u.id}
                            title={
                              currentUser?.id === u.id
                                ? "You cannot deactivate your own account"
                                : undefined
                            }
                            className={`badge border-0 cursor-pointer text-uppercase ${
                              u.is_active ? "bg-success-lt" : "bg-danger-lt"
                            }`}
                          >
                            {u.is_active ? "Active" : "Disabled"}
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="btn-list justify-content-end flex-nowrap">
                          {isAnonymized ? (
                            <span className="badge bg-secondary-lt text-secondary">
                              Anonymized
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => !isSelf && onEditUser(u)}
                                disabled={isSelf}
                                className={`btn btn-sm btn-icon ${
                                  isSelf
                                    ? "btn-outline-secondary opacity-50 cursor-not-allowed"
                                    : "btn-outline-secondary"
                                }`}
                                title={
                                  isSelf
                                    ? "You cannot edit your own account here"
                                    : "Edit user details"
                                }
                              >
                                <IconPencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onViewPasskeys(u)}
                                className={`btn btn-sm btn-icon ${
                                  passkeysFor === u.id
                                    ? "btn-primary"
                                    : "btn-outline-secondary"
                                }`}
                                title="Manage passkeys"
                              >
                                <IconKey size={15} />
                              </button>
                              {u.is_active
                                ? !isSelf && (
                                    <button
                                      type="button"
                                      onClick={() => onDeactivateUser(u)}
                                      className="btn btn-sm btn-icon btn-outline-danger"
                                      title="Deactivate user"
                                    >
                                      <IconBan size={15} />
                                    </button>
                                  )
                                : !isSelf && (
                                    <button
                                      type="button"
                                      onClick={() => onToggleActive(u)}
                                      className="btn btn-sm btn-icon btn-outline-success"
                                      title="Reactivate user"
                                    >
                                      <IconCheck size={15} />
                                    </button>
                                  )}
                              {onAnonymizeUser && !isSelf && (
                                <button
                                  type="button"
                                  onClick={() => onAnonymizeUser(u)}
                                  className="btn btn-sm btn-icon btn-outline-danger"
                                  title="Anonymize user data"
                                >
                                  <IconUserX size={15} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {passkeysFor === u.id && (
                      <tr>
                        <td colSpan={5} className="bg-light p-3">
                          <div className="mb-2 d-flex align-items-center gap-1 small fw-bold text-secondary text-uppercase">
                            <IconKey size={14} /> Passkeys for {u.username}
                          </div>
                          {renderPasskeyContent(u)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
