"use client";

import { useState, useEffect } from "react";
import { IconLoader2, IconShieldCheck, IconUserCheck, IconAlertCircle } from "@tabler/icons-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/tabler";
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
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-2">
          <span className="avatar avatar-sm bg-primary-lt text-primary rounded">
            <IconShieldCheck size={18} />
          </span>
          <div>
            <div className="fw-bold">Saksi Berita Acara</div>
            <div className="text-secondary small fw-normal">{monthLabel} {year}</div>
          </div>
        </div>
      }
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" onClick={onClose} className="btn btn-outline-secondary">
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loading || !selectedWitnessId}
            className="btn btn-primary d-inline-flex align-items-center gap-1"
          >
            {saving && <IconLoader2 size={16} className="animate-spin me-1" />}
            Simpan Saksi Bulanan
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="card card-sm bg-body-tertiary mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-secondary">Status Entri Berita Acara:</span>
              <span className="badge bg-warning-lt">
                {beritaAcaraCount} Hari Berita Acara
              </span>
            </div>
            {currentWitness ? (
              <div className="small text-success d-flex align-items-center gap-1">
                <IconUserCheck size={16} />
                <span>Saksi saat ini: <strong>{currentWitness.name}</strong></span>
              </div>
            ) : (
              <div className="small text-warning d-flex align-items-center gap-1">
                <IconAlertCircle size={16} />
                <span>Belum ada saksi bulanan yang ditetapkan.</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label required">
            Pilih Rekan Kerja Sebagai Saksi
          </label>
          {loading ? (
            <div className="d-flex align-items-center justify-content-center py-3">
              <IconLoader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : (
            <select
              className="form-select"
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
          <div className="form-text text-secondary small">
            Menetapkan saksi di sini akan otomatis memperbarui saksi untuk semua entri Berita Acara pada {monthLabel} {year}.
          </div>
        </div>
      </form>
    </Modal>
  );
}
