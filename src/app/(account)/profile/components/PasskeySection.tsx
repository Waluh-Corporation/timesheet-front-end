import { Loader2, KeyRound, Plus, Fingerprint, Trash2 } from "lucide-react";
import { passkeysSupported } from "@/lib/webauthn";
import type { Passkey } from "@/lib/types";

interface PasskeySectionProps {
  passkeys: Passkey[];
  loading: boolean;
  addingKey: boolean;
  addPasskey: () => void;
  removePasskey: (pk: Passkey) => void;
}

export function PasskeySection({ passkeys, loading, addingKey, addPasskey, removePasskey }: PasskeySectionProps) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-mr-purple" />
          <h2 className="text-lg font-bold">Passkeys</h2>
          <span className="chip bg-mr-surface2 text-mr-muted">{passkeys.length}</span>
        </div>
        {passkeysSupported() && (
          <button onClick={addPasskey} disabled={addingKey} className="btn-primary text-sm">
            {addingKey ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add passkey
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-mr-purple" />
        </div>
      ) : passkeys.length === 0 ? (
        <p className="text-sm text-mr-muted">
          No passkeys yet. Add one to sign in without a password.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {passkeys.map((pk) => (
            <div
              key={pk.id}
              className="flex items-center justify-between gap-3 border-2 border-mr-ink bg-mr-surface2 px-4 py-2"
            >
              <div className="flex items-center gap-3">
                <Fingerprint size={18} className="text-mr-purple" />
                <div>
                  <p className="text-sm font-semibold">{pk.friendly_name || "Passkey"}</p>
                  <p className="text-xs text-mr-muted">
                    Added {new Date(pk.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removePasskey(pk)}
                className="border-2 border-mr-ink p-2 text-mr-muted hover:bg-mr-pink hover:text-white"
                title="Remove passkey"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
