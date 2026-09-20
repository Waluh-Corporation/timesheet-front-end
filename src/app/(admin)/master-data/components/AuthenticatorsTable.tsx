"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RotateCw, Search, Fingerprint, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { AuthenticatorItem } from "@/lib/types";
import { fetchAuthenticators, syncAuthenticators } from "@/app/(admin)/master-data/services/masterData";

export function AuthenticatorsTable() {
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
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Registered Authenticators</h2>
          <p className="text-xs text-mr-muted">
            FIDO2 / WebAuthn AAGUID directory from the community registry.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn border-2 border-mr-ink bg-mr-cyan text-mr-ink text-sm font-bold flex items-center justify-center gap-2"
        >
          <RotateCw size={16} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync with Community Registry"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mr-muted" />
        <input
          type="text"
          className="input pl-9 text-sm"
          placeholder="Search authenticators by name or AAGUID..."
          aria-label="Search authenticators by name or AAGUID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-mr-purple" size={32} />
        </div>
      ) : authenticators.length === 0 ? (
        <div className="py-12 text-center text-sm text-mr-muted">
          No authenticators found. {debouncedSearch ? "Try a different search query." : "Click sync to load authenticators."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-mr-ink text-xs uppercase text-mr-muted">
                <th className="pb-2 w-12">Icon</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">AAGUID</th>
                <th className="pb-2 text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {authenticators.map((auth) => {
                const iconSrc = auth.icon || auth.icon_light || auth.icon_dark;
                return (
                  <tr key={auth.aaguid} className="border-b border-mr-ink/20 hover:bg-mr-surface2/50 transition-colors">
                    <td className="py-3 pr-2">
                      {iconSrc ? (
                        <img
                          src={iconSrc}
                          alt={auth.name}
                          className="h-6 w-6 object-contain rounded-sm"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Fingerprint size={20} className="text-mr-purple" />
                      )}
                    </td>
                    <td className="py-3 font-bold text-mr-ink">{auth.name || "Unknown Authenticator"}</td>
                    <td className="py-3 font-mono text-xs text-mr-muted">
                      <span className="rounded border border-mr-ink/20 bg-mr-surface2 px-1.5 py-0.5">
                        {auth.aaguid}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-mr-muted text-right whitespace-nowrap">
                      {auth.updated_at ? new Date(auth.updated_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && total > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t-2 border-mr-ink/20 pt-4 sm:flex-row">
          <p className="text-xs text-mr-muted">
            Showing <span className="font-semibold text-mr-ink">{startItem}</span> to{" "}
            <span className="font-semibold text-mr-ink">{endItem}</span> of{" "}
            <span className="font-semibold text-mr-ink">{total}</span> authenticators
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn border border-mr-ink px-2 py-1 text-xs disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn border border-mr-ink px-2 py-1 text-xs disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
