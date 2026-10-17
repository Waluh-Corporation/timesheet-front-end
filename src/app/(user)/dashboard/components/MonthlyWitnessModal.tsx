"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { WitnessResponse } from "@/lib/types";
import {
  fetchEligibleWitnesses,
  updateMonthlyWitness,
} from "@/services/activityService";

interface MonthlyWitnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  currentWitness?: WitnessResponse;
  beritaAcaraCount: number;
  onWitnessUpdated: () => void;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function MonthlyWitnessModal({
  isOpen,
  onClose,
  year,
  month,
  currentWitness,
  beritaAcaraCount,
  onWitnessUpdated,
}: Readonly<MonthlyWitnessModalProps>) {
  const { notify } = useToast();
  const [witnesses, setWitnesses] = useState<WitnessResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedWitnessId, setSelectedWitnessId] = useState<number | undefined>(
    currentWitness?.id
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedWitnessId(currentWitness?.id);
    setLoading(true);
    fetchEligibleWitnesses()
      .then((data) => setWitnesses(data || []))
      .catch((err) => notify(err.message || "Gagal memuat daftar saksi", "error"))
      .finally(() => setLoading(false));
  }, [isOpen, currentWitness, notify]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWitnessId) {
      notify("Silakan pilih saksi terlebih dahulu", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await updateMonthlyWitness({
        year,
        month,
        witness_id: selectedWitnessId,
      });
      notify(res.message || "Saksi Berita Acara berhasil diperbarui!", "success");
      onWitnessUpdated();
      onClose();
    } catch (err: any) {
      notify(err.message || "Gagal memperbarui saksi", "error");
    } finally {
      setSaving(false);
    }
  };

  const monthLabel = MONTH_NAMES[month - 1] || `Bulan ${month}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="card w-full max-w-md p-6 shadow-hard">
        <div className="mb-4 flex items-center justify-between border-b-2 border-mr-ink pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center bg-mr-cyan text-black shadow-hard-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Saksi Berita Acara
              </h2>
              <p className="text-xs text-mr-muted">
                {monthLabel} {year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-mr-ink hover:bg-mr-surface2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="border border-mr-ink/30 bg-mr-surface2/60 p-3 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-bold">
              <span>Status Entri Berita Acara:</span>
              <span className="badge border border-mr-ink/40 bg-mr-yellow/30 px-2 py-0.5 text-xs text-amber-900 dark:text-amber-300">
                {beritaAcaraCount} Hari Berita Acara
              </span>
            </div>
            {currentWitness ? (
              <p className="text-mr-muted text-[11px] flex items-center gap-1 mt-1">
                <UserCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                Saksi saat ini: <strong className="text-mr-ink">{currentWitness.name}</strong>
              </p>
            ) : (
              <p className="text-mr-muted text-[11px] flex items-center gap-1 mt-1 text-amber-700 dark:text-amber-400">
                <AlertCircle size={13} className="shrink-0" />
                Belum ada saksi bulanan yang ditetapkan.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-mr-muted">
              Pilih Rekan Kerja Sebagai Saksi <span className="text-rose-500">*</span>
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={18} className="animate-spin text-mr-purple" />
              </div>
            ) : (
              <select
                className="input text-xs font-semibold"
                value={selectedWitnessId || ""}
                onChange={(e) => setSelectedWitnessId(Number(e.target.value))}
                required
              >
                <option value="">— Pilih Saksi —</option>
                {witnesses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1.5 text-[11px] text-mr-muted">
              Menetapkan saksi di sini akan otomatis memperbarui saksi untuk semua entri Berita Acara pada bulan {monthLabel} {year}.
            </p>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t-2 border-mr-ink pt-3">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || loading || !selectedWitnessId}
              className="btn-primary text-xs font-bold inline-flex items-center gap-1.5"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Simpan Saksi Bulanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
