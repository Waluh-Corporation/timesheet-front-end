import { Fragment } from "react";
import { Loader2, ShieldCheck, KeyRound, Ban, Trash2, Fingerprint } from "lucide-react";
import type { User, Company, Passkey } from "@/lib/types";
import { useAuth } from "@/lib/auth";

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
  onViewPasskeys,
  onRemovePasskey,
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
  onViewPasskeys: (u: User) => void;
  onRemovePasskey: (u: User, pk: Passkey) => void;
}>) {
  const { user: currentUser } = useAuth();

  const renderPasskeyContent = (u: User) => {
    if (pkLoading) {
      return (
        <div className="flex justify-center py-3">
          <Loader2 size={18} className="animate-spin text-mr-purple" />
        </div>
      );
    }
    if (userPasskeys.length === 0) {
      return (
        <p className="text-sm text-mr-muted">
          This user has no passkeys.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {userPasskeys.map((pk) => (
          <div
            key={pk.id}
            className="flex items-center justify-between gap-3 border-2 border-mr-ink bg-mr-surface px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className="text-mr-purple" />
              <div>
                <p className="text-sm font-semibold">{pk.friendly_name || "Passkey"}</p>
                <p className="text-xs text-mr-muted">
                  Added {new Date(pk.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemovePasskey(u, pk)}
              className="border-2 border-mr-ink p-2 text-mr-muted hover:bg-mr-pink hover:text-white"
              title="Remove passkey"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-bold">All users</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-mr-purple" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-mr-muted">
                <th className="pb-2">User</th>
                <th className="pb-2">Company</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Fragment key={u.id}>
                  <tr className="border-t border-mr-ink">
                    <td className="py-3">
                      <p className="font-semibold">{u.name || u.username}</p>
                      <p className="text-xs text-mr-muted">{u.email}</p>
                    </td>
                    <td className="py-3">
                      {(() => {
                        const matchedCompany = companies.find(
                          (c) =>
                            (u.company_id && c.id === u.company_id) ||
                            (u.company && c.name?.toLowerCase() === u.company.toLowerCase()) ||
                            (u.company && c.code?.toLowerCase() === u.company.toLowerCase())
                        );
                        const currentVal = matchedCompany ? String(matchedCompany.id) : "";

                        return (
                          <select
                            className={`input py-1 px-2 text-xs font-bold border-mr-ink/30 ${
                              currentVal ? "bg-mr-surface" : "bg-amber-100 text-amber-800 border-amber-400"
                            }`}
                            value={currentVal}
                            onChange={(e) => {
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
                    <td className="py-3">
                      <span
                        className={`chip ${
                          u.role === "admin"
                            ? "bg-mr-purple text-white"
                            : "bg-mr-surface2 text-mr-muted"
                        }`}
                      >
                        {u.role === "admin" && <ShieldCheck size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => onToggleActive(u)}
                        disabled={currentUser?.id === u.id}
                        title={
                          currentUser?.id === u.id
                            ? "You cannot deactivate your own account"
                            : undefined
                        }
                        className={`chip ${
                          u.is_active
                            ? "bg-mr-cyan text-mr-ink"
                            : "bg-mr-pink text-white"
                        } ${currentUser?.id === u.id ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {u.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewPasskeys(u)}
                          className={`border-2 border-mr-ink p-2 ${
                            passkeysFor === u.id
                              ? "bg-mr-purple text-white"
                              : "text-mr-muted hover:bg-mr-surface2"
                          }`}
                          title="Manage passkeys"
                        >
                          <KeyRound size={16} />
                        </button>
                        {u.is_active && currentUser?.id !== u.id && (
                          <button
                            onClick={() => onDeactivateUser(u)}
                            className="border-2 border-mr-ink p-2 text-mr-muted hover:bg-mr-pink hover:text-white"
                            title="Deactivate user"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {passkeysFor === u.id && (
                    <tr>
                      <td colSpan={5} className="border-t-2 border-mr-ink bg-mr-surface2 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-mr-muted">
                          <KeyRound size={14} /> Passkeys for {u.username}
                        </div>
                        {renderPasskeyContent(u)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
