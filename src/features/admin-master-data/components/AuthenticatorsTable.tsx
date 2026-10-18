"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconRotateClockwise,
  IconSearch,
  IconFingerprint,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import type { AuthenticatorItem } from "@/lib/types";
import {
  fetchAuthenticators,
  syncAuthenticators,
} from "../services/masterDataService";
import { useTheme } from "@/lib/theme";

export function AuthenticatorsTable() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { notify } = useToast();
  const [authenticators, setAuthenticators] = useState<AuthenticatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAuthenticators({
        search: debouncedSearch.trim() || undefined,
        page,
        limit,
      });
      setAuthenticators(res.authenticators || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      notify(err.message || "Failed to load authenticators", "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, limit, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncAuthenticators();
      notify(`Successfully synchronized ${res.total_synced} authenticators!`, "success");
      loadData();
    } catch (err: any) {
      notify(err.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h3 className="card-title mb-0">Passkey Authenticators Metadata ({total})</h3>
        <div className="d-flex align-items-center gap-2">
          <div className="input-icon">
            <span className="input-icon-addon">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search authenticators..."
              className="form-control form-control-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
          >
            <IconRotateClockwise size={16} className={syncing ? "animate-spin" : ""} />
            Sync Metadata
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-vcenter card-table table-hover">
              <thead>
                <tr>
                  <th className="w-1">Icon</th>
                  <th>Name</th>
                  <th>AAGUID</th>
                  <th className="text-end">Updated</th>
                </tr>
              </thead>
              <tbody>
                {authenticators.map((a) => {
                  const iconSrc = isDark
                    ? a.icon_dark || a.icon || a.icon_light
                    : a.icon_light || a.icon || a.icon_dark;
                  return (
                    <tr key={a.aaguid}>
                      <td>
                        <span className="avatar avatar-sm bg-light flex-shrink-0">
                          {iconSrc ? (
                            <img
                              src={iconSrc}
                              alt={a.name}
                              className="w-100 h-100 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <IconFingerprint size={18} className="text-primary" />
                          )}
                        </span>
                      </td>
                      <td className="fw-semibold">{a.name || "Unknown Authenticator"}</td>
                      <td className="font-monospace text-secondary small">{a.aaguid}</td>
                      <td className="text-secondary small text-end">
                        {a.updated_at ? new Date(a.updated_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
                {authenticators.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-secondary">
                      No authenticators found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="card-footer d-flex align-items-center justify-content-between">
              <div className="text-secondary small">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
              </div>
              <div className="btn-group">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <IconChevronLeft size={16} />
                </button>
                <span className="btn btn-sm btn-outline-secondary disabled fw-bold">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <IconChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
