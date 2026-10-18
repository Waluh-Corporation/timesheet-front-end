"use client";

import { useState } from "react";
import {
  IconKey,
  IconPlus,
  IconFingerprint,
  IconTrash,
  IconPencil,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { passkeysSupported } from "@/lib/webauthn";
import type { Passkey } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { Modal } from "@/components/tabler";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
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

  const handleCreatePasskey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await addPasskey(newKeyName.trim() || undefined);
    setShowAddModal(false);
    setNewKeyName("");
  };

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <IconKey size={20} className="text-purple" />
          <h3 className="card-title mb-0">Passkeys</h3>
          <span className="badge bg-secondary-lt">{passkeys.length}</span>
        </div>
        {passkeysSupported() && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            disabled={addingKey}
            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
          >
            {addingKey ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <IconPlus size={16} />
            )}
            Add Passkey
          </button>
        )}
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-secondary small">
            No passkeys registered yet. Add one to sign in securely with biometric authentication, security keys, or device locks.
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {passkeys.map((pk) => {
              const iconSrc = isDark
                ? pk.icon_dark || pk.icon || pk.icon_light
                : pk.icon_light || pk.icon || pk.icon_dark;
              const isEditing = editingId === pk.id;

              return (
                <div
                  key={pk.id}
                  className="list-group-item d-flex align-items-center justify-content-between gap-3 px-0 py-3"
                >
                  <div className="d-flex align-items-center gap-3 min-w-0">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 32, height: 32 }}
                    >
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
                        <IconFingerprint size={24} className="text-primary" />
                      )}
                    </div>

                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="d-flex align-items-center gap-1 my-1">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            aria-label="Rename passkey"
                            disabled={savingRename}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void handleSaveRename(pk);
                              if (e.key === "Escape") handleCancelRename();
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              void handleSaveRename(pk);
                            }}
                            disabled={savingRename || !editName.trim()}
                            className="btn btn-sm btn-icon btn-success"
                            title="Save"
                          >
                            {savingRename ? (
                              <span className="spinner-border spinner-border-sm" role="status" />
                            ) : (
                              <IconCheck size={14} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            disabled={savingRename}
                            className="btn btn-sm btn-icon btn-ghost-secondary"
                            title="Cancel"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <div className="fw-bold text-truncate">{pk.friendly_name || "Passkey"}</div>
                          <button
                            type="button"
                            onClick={() => handleStartRename(pk)}
                            className="btn btn-sm btn-ghost-secondary btn-icon"
                            title="Rename"
                          >
                            <IconPencil size={14} />
                          </button>
                        </div>
                      )}
                      <div className="text-secondary small">
                        Added {new Date(pk.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void removePasskey(pk);
                    }}
                    className="btn btn-sm btn-ghost-danger btn-icon flex-shrink-0"
                    title="Remove passkey"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Passkey Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Passkey"
        footer={
          <>
            <button
              type="button"
              className="btn btn-link link-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                void handleCreatePasskey();
              }}
              disabled={addingKey}
              className="btn btn-primary d-inline-flex align-items-center gap-1"
            >
              {addingKey && <span className="spinner-border spinner-border-sm" role="status" />}
              Continue Registration
            </button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            void handleCreatePasskey(e);
          }}
        >
          <p className="text-secondary small mb-3">
            You can give this passkey a friendly nickname (e.g. <em>Work Laptop</em> or <em>iPhone</em>), or leave it empty to use your authenticator&apos;s default name.
          </p>
          <div className="mb-3">
            <label htmlFor="new-passkey-name" className="form-label">
              Passkey Nickname (Optional)
            </label>
            <input
              id="new-passkey-name"
              type="text"
              className="form-control"
              placeholder="e.g. Work MacBook, Windows Hello"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              maxLength={100}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
