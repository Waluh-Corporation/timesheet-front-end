"use client";

import { useState } from "react";
import { Loader2, KeyRound, Plus, Fingerprint, Trash2, Pencil, Check, X } from "lucide-react";
import { passkeysSupported } from "@/lib/webauthn";
import type { Passkey } from "@/lib/types";

interface PasskeySectionProps {
  passkeys: Passkey[];
  loading: boolean;
  addingKey: boolean;
  addPasskey: (name?: string) => Promise<void>;
  renamePasskey: (pk: Passkey, newName: string) => Promise<void>;
  removePasskey: (pk: Passkey) => void;
}

export function PasskeySection({
  passkeys,
  loading,
  addingKey,
  addPasskey,
  renamePasskey,
  removePasskey,
}: PasskeySectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  const handleStartRename = (pk: Passkey) => {
    setEditingId(pk.id);
    setEditName(pk.friendly_name || "");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveRename = async (pk: Passkey) => {
    if (!editName.trim()) return;
    setSavingRename(true);
    try {
      await renamePasskey(pk, editName.trim());
      setEditingId(null);
    } finally {
      setSavingRename(false);
    }
  };

  const handleCreatePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPasskey(newKeyName.trim() || undefined);
    setShowAddModal(false);
    setNewKeyName("");
  };

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-mr-purple" />
          <h2 className="text-lg font-bold">Passkeys</h2>
          <span className="chip bg-mr-surface2 text-mr-muted">{passkeys.length}</span>
        </div>
        {passkeysSupported() && (
          <button
            onClick={() => setShowAddModal(true)}
            disabled={addingKey}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
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
          No passkeys yet. Add one to sign in securely without a password.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {passkeys.map((pk) => {
            const iconSrc = pk.icon_light || pk.icon_dark;
            const isEditing = editingId === pk.id;

            return (
              <div
                key={pk.id}
                className="flex items-center justify-between gap-3 border-2 border-mr-ink bg-mr-surface2 px-4 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={pk.friendly_name || "Authenticator"}
                        className="h-5 w-5 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Fingerprint size={18} className="text-mr-purple" />
                    )}
                  </div>

                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 my-0.5">
                        <input
                          type="text"
                          className="input py-0.5 px-2 text-xs font-semibold"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          aria-label="Rename passkey"
                          disabled={savingRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(pk);
                            if (e.key === "Escape") handleCancelRename();
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(pk)}
                          disabled={savingRename || !editName.trim()}
                          className="btn border border-mr-ink p-1 bg-mr-green text-mr-ink text-xs hover:opacity-90"
                          title="Save name"
                        >
                          {savingRename ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        </button>
                        <button
                          onClick={handleCancelRename}
                          disabled={savingRename}
                          className="btn border border-mr-ink p-1 text-xs hover:bg-mr-surface2"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">{pk.friendly_name || "Passkey"}</p>
                        <button
                          onClick={() => handleStartRename(pk)}
                          className="p-1 text-mr-muted hover:text-mr-purple transition-colors"
                          title="Rename passkey"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-mr-muted">
                      Added {new Date(pk.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removePasskey(pk)}
                  className="border-2 border-mr-ink p-2 text-mr-muted hover:bg-mr-pink hover:text-white transition-colors shrink-0"
                  title="Remove passkey"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Passkey Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6 bg-mr-surface shadow-hard">
            <div className="mb-4 flex items-center justify-between border-b-2 border-mr-ink pb-3">
              <div className="flex items-center gap-2">
                <Fingerprint size={20} className="text-mr-purple" />
                <h3 className="text-lg font-bold">Add Passkey</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-mr-surface2 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePasskey} className="flex flex-col gap-4">
              <p className="text-xs text-mr-muted">
                You can provide a custom nickname for this passkey or leave it blank to automatically use your authenticator&apos;s name (e.g. Bitwarden, iCloud Keychain, Windows Hello).
              </p>

              <div>
                <label htmlFor="new-passkey-name" className="mb-1 block text-xs font-bold uppercase text-mr-muted">
                  Passkey Name (Optional)
                </label>
                <input
                  id="new-passkey-name"
                  type="text"
                  className="input text-sm"
                  placeholder="e.g. Work MacBook, or leave blank for auto"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn border border-mr-ink px-3 py-1.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingKey}
                  className="btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                >
                  {addingKey && <Loader2 size={13} className="animate-spin" />}
                  Continue Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
