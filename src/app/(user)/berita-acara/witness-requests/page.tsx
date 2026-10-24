"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  IconShieldCheck,
  IconCheck,
  IconX,
  IconCalendar,
  IconUser,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/tabler";
import { useToast } from "@/components/Toast";
import { getPendingWitnessRequests, witnessAction } from "@/services/beritaAcaraService";
import type { WitnessRequestItem } from "@/lib/types";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function WitnessRequestsPage() {
  const { notify } = useToast();
  const [requests, setRequests] = useState<WitnessRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string | number, string>>({});

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingWitnessRequests();
      setRequests(data || []);
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : "Gagal memuat permintaan saksi",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (id: string | number) => {
    setProcessingId(id);
    try {
      await witnessAction(id, "approve");
      notify("Berita Acara berhasil disetujui & ditandatangani sebagai saksi! ✍️", "success");
      await loadRequests();
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : "Gagal menandatangani Berita Acara",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string | number) => {
    const notes = rejectNotes[id]?.trim();
    if (!notes) {
      notify("Harap berikan catatan revisi alasan penolakan Berita Acara", "error");
      return;
    }

    setProcessingId(id);
    try {
      await witnessAction(id, "reject", notes);
      notify("Pengajuan Berita Acara telah ditolak dengan catatan revisi", "info");
      setRejectingId(null);
      await loadRequests();
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : "Gagal memproses penolakan",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        pretitle="Berita Acara"
        title="Permintaan Tanda Tangan Saksi"
        description="Daftar pengajuan Berita Acara dari rekan kerja yang menunjuk Anda sebagai saksi bulanan."
        actions={
          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            title="Segarkan daftar"
          >
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
        }
      />

      <div className="card shadow-sm">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="avatar avatar-xs bg-primary-lt rounded text-primary">
              <IconShieldCheck size={18} />
            </span>
            <h3 className="card-title m-0">Antrean Verifikasi Saksi</h3>
          </div>
          <span className="badge bg-blue-lt">
            {requests.length} Permintaan Tertunda
          </span>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-5 text-secondary">
              <div className="spinner-border spinner-border-sm me-2" role="status" />
              Memeriksa antrean permohonan tanda tangan saksi...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5">
              <div className="avatar avatar-lg bg-success-lt rounded-circle mb-3">
                <IconCheck size={36} className="text-success" />
              </div>
              <h3 className="fw-bold mb-1">Tidak Ada Permintaan Saksi Tertunda</h3>
              <p className="text-secondary small mb-0">
                Semua permohonan Berita Acara yang menunjuk Anda sebagai saksi telah selesai ditinjau dan ditandatangani.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                <IconAlertCircle size={20} className="text-info flex-shrink-0" />
                <span>
                  Berikut adalah Berita Acara yang memerlukan tanda tangan Anda sebagai saksi sebelum rekan kerja Anda dapat men-generate dokumen timesheet mereka.
                </span>
              </div>

              <div className="list-group list-group-flush border rounded">
                {requests.map((req) => {
                  const isProcessing = processingId === req.id;
                  const isRejecting = rejectingId === req.id;
                  const monthName = MONTH_NAMES[(req.month || 1) - 1] || req.month;
                  const employeeName = req.user_name || req.user?.name || `Pegawai #${req.user_id}`;

                  return (
                    <div key={req.id} className="list-group-item p-3">
                      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-2">
                            <span className="avatar avatar-sm bg-primary-lt text-primary fw-bold rounded">
                              <IconUser size={18} />
                            </span>
                            <div>
                              <div className="fw-bold fs-3 text-body">{employeeName}</div>
                              <div className="text-secondary small d-flex align-items-center gap-2 flex-wrap">
                                <span className="d-inline-flex align-items-center gap-1">
                                  <IconCalendar size={14} />
                                  Periode: <strong>{monthName} {req.year}</strong>
                                </span>
                                {req.submitted_at && (
                                  <span>
                                    • Diajukan: {new Date(req.submitted_at).toLocaleDateString("id-ID")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {req.notes && (
                            <div className="mt-2 p-2 bg-body-tertiary rounded small text-secondary">
                              <strong>Catatan Pemohon:</strong> {req.notes}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="d-flex align-items-center gap-2 align-self-start align-self-md-center">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleApprove(req.id)}
                            disabled={isProcessing}
                          >
                            <IconCheck size={16} />
                            <span>
                              {isProcessing ? "Menandatangani..." : "Tanda Tangani / Setujui"}
                            </span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                            onClick={() => setRejectingId(isRejecting ? null : req.id)}
                            disabled={isProcessing}
                          >
                            <IconX size={16} />
                            <span>{isRejecting ? "Batal" : "Tolak / Revisi"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Rejection input form */}
                      {isRejecting && (
                        <div className="mt-3 p-3 border border-danger-subtle rounded bg-danger-subtle bg-opacity-10">
                          <label htmlFor={`reject-notes-${req.id}`} className="form-label text-danger fw-bold small mb-1">
                            Alasan Penolakan / Catatan Revisi untuk {employeeName}:
                          </label>
                          <textarea
                            id={`reject-notes-${req.id}`}
                            className="form-control mb-2"
                            rows={2}
                            placeholder="Contoh: Tanggal 15 catatan belum lengkap..."
                            value={rejectNotes[req.id] || ""}
                            onChange={(e) =>
                              setRejectNotes((prev) => ({
                                ...prev,
                                [req.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setRejectingId(null)}
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                              onClick={() => handleReject(req.id)}
                              disabled={isProcessing}
                            >
                              <IconX size={14} />
                              <span>Kirim Penolakan</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
