"use client";

import { useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import type { User } from "@/lib/types";
import { isUserAnonymized } from "@/lib/types";
import { Modal } from "@/components/tabler";
import { usersService } from "../services/usersService";

interface AnonymizeUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AnonymizeUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: Readonly<AnonymizeUserModalProps>) {
  const { notify } = useToast();
  const [confirmationInput, setConfirmationInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user || isUserAnonymized(user)) return null;

  const isConfirmed = confirmationInput.trim() === user.username.trim();

  const handleAnonymize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      notify("Username does not match confirmation", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await usersService.anonymizeUser(user.id);
      notify(
        res.message || `User data for ${user.username} has been successfully anonymized (ISO Standards)`,
        "success"
      );
      setConfirmationInput("");
      onSuccess();
      onClose();
    } catch (err: any) {
      notify(err.message || "Failed to anonymize user", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setConfirmationInput("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Anonymize User"
      footer={
        <>
          <button type="button" className="btn btn-link link-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAnonymize}
            disabled={!isConfirmed || saving}
            className="btn btn-danger d-inline-flex align-items-center gap-1"
          >
            {saving && <span className="spinner-border spinner-border-sm" role="status" />}
            Confirm Anonymization
          </button>
        </>
      }
    >
      <form onSubmit={handleAnonymize}>
        {/* Target user information card */}
        <div className="bg-light p-3 rounded small mb-3">
          <div className="d-flex justify-content-between mb-1">
            <span className="text-secondary text-uppercase fw-bold fs-6">Target Account:</span>
            <span className="fw-bold">{user.name || user.username}</span>
          </div>
          <div className="d-flex justify-content-between mb-1 text-secondary">
            <span>Username:</span>
            <code
              className="text-dark user-select-none"
              style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}
              onCopy={(e) => e.preventDefault()}
            >
              {user.username}
            </code>
          </div>
          <div className="d-flex justify-content-between text-secondary">
            <span>Email:</span>
            <span>{user.email || "—"}</span>
          </div>
        </div>

        {/* Warning banner */}
        <div className="alert alert-danger d-flex gap-2 mb-3">
          <IconAlertTriangle size={24} className="flex-shrink-0 text-danger mt-1" />
          <div className="small">
            <div className="fw-bold mb-1">This action cannot be undone!</div>
            In compliance with privacy and information security standards, all personal identity
            details will be permanently anonymized from the database.
          </div>
        </div>

        <div className="mb-2">
          <label
            htmlFor="confirm-user-username"
            className="form-label small user-select-none"
            style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}
            onCopy={(e) => e.preventDefault()}
          >
            Type{" "}
            <strong
              className="user-select-none"
              style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none" }}
              onCopy={(e) => e.preventDefault()}
            >
              {user.username}
            </strong>{" "}
            to confirm:
          </label>
          <input
            id="confirm-user-username"
            type="text"
            className="form-control"
            placeholder={user.username}
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              notify("Paste is disabled for safety. Please type the username manually.");
            }}
            required
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </form>
    </Modal>
  );
}
