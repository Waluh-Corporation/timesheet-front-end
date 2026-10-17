"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { User } from "@/lib/types";
import { isUserAnonymized } from "@/lib/types";
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
      notify("Nama username tidak sesuai untuk konfirmasi", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await usersService.anonymizeUser(user.id);
      notify(
        res.message || `Data pengguna ${user.username} berhasil dianonimkan (UU PDP)`,
        "success"
      );
      setConfirmationInput("");
      onSuccess();
      onClose();
    } catch (err: any) {
      notify(err.message || "Gagal melakukan anonimisasi pengguna", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setConfirmationInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="card w-full max-w-lg p-6 shadow-hard border-2 border-rose-600 dark:border-rose-500">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-mr-ink pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center bg-rose-600 text-white shadow-hard-sm">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-rose-700 dark:text-rose-400">
                Anonimisasi Pengguna
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 border border-mr-ink hover:bg-mr-surface2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAnonymize} className="flex flex-col gap-4">
          {/* Target user information card */}
          <div className="border border-mr-ink/30 bg-mr-surface2/60 p-3 text-xs flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-mr-muted font-bold uppercase text-[10px]">Target Akun:</span>
              <span className="font-extrabold text-sm">{user.name}</span>
            </div>
            <div className="flex justify-between items-center text-mr-muted">
              <span>Username:</span>
              <strong className="text-mr-ink font-mono">{user.username}</strong>
            </div>
            <div className="flex justify-between items-center text-mr-muted">
              <span>Email:</span>
              <span className="font-mono">{user.email || "-"}</span>
            </div>
          </div>

          {/* Warning banner */}
          <div className="border-2 border-rose-500/50 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs text-rose-900 dark:text-rose-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-extrabold text-rose-700 dark:text-rose-300">
              <AlertTriangle size={16} className="shrink-0" />
              <span>PERINGATAN: AKSI INI PERMANEN & TIDAK DAPAT DIBATALKAN</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] opacity-90 leading-relaxed">
              <li>
                Seluruh Data Pribadi seperti nama, email, NPP, BNI ID, dan kredensial akan dihapus dan disamarkan secara permanen.
              </li>
              <li>
                Semua sesi aktif dan passkey milik pengguna akan segera dihapus.
              </li>
              <li>
                Akun pengguna akan dinonaktifkan secara permanen dan tidak dapat dipulihkan kembali.
              </li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-mr-ink">
              Ketik <strong className="font-mono text-rose-600 dark:text-rose-400">&ldquo;{user.username}&rdquo;</strong> untuk mengonfirmasi:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={user.username}
              className="input font-mono text-sm border-2 focus:border-rose-600"
              required
              autoFocus
            />
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t-2 border-mr-ink pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || saving}
              className="btn bg-rose-600 text-white font-extrabold text-xs py-2 px-4 border-2 border-mr-ink shadow-hard-sm hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Anonimkan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
