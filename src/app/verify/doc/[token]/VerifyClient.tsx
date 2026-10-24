"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconLoader2,
  IconFileCertificate,
  IconCheck,
  IconUser,
  IconCalendar,
  IconHash,
} from "@tabler/icons-react";
import { verifyDocument } from "@/services/verifyService";
import type { DocVerificationResponse } from "@/lib/types";

export default function VerifyClient({ initialToken }: { initialToken?: string }) {
  const params = useParams();
  const token = initialToken || (params?.token as string) || "";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DocVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadVerification() {
      try {
        setLoading(true);
        setError(null);
        const res = await verifyDocument(token);
        if (isMounted) {
          setData(res);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Dokumen tidak ditemukan atau token verifikasi tidak valid."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      loadVerification();
    } else {
      setLoading(false);
      setError("Token verifikasi dokumen tidak ditemukan.");
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="page page-center min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="container container-tight py-4" style={{ maxWidth: 540 }}>
        <div className="text-center mb-4">
          <Link href="/login" className="navbar-brand navbar-brand-autodark">
            <h1 className="h2 text-primary font-weight-bold mb-0">Timesheet Portal</h1>
          </Link>
          <p className="text-secondary small mt-1">Sistem Verifikasi Dokumen & Tanda Tangan Digital Resmi</p>
        </div>

        <div className="card shadow-sm border-0">
          {loading ? (
            <div className="card-body text-center py-5">
              <IconLoader2 className="animate-spin text-primary mb-3" size={40} />
              <h3 className="h4 text-secondary mb-1">Memverifikasi Dokumen…</h3>
              <p className="text-muted small mb-0">Memeriksa keabsahan tanda tangan digital dan jejak audit dokumen.</p>
            </div>
          ) : error || !data || !data.is_valid ? (
            <div className="card-body text-center py-5">
              <div className="avatar avatar-lg bg-danger-lt rounded-circle mb-3">
                <IconAlertTriangle size={36} className="text-danger" />
              </div>
              <h2 className="card-title text-danger mb-2">Verifikasi Dokumen Gagal</h2>
              <p className="text-secondary small mb-4">
                {error || "Dokumen digital ini tidak dapat diverifikasi, telah kedaluwarsa, atau token verifikasi tidak valid."}
              </p>
              <div className="alert alert-warning text-start small mb-4">
                <strong>Catatan Keamanan:</strong> Pastikan Anda menggunakan tautan verifikasi lengkap yang tercantum pada dokumen atau QR code resmi.
              </div>
              <Link href="/login" className="btn btn-outline-secondary w-100">
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="avatar avatar-lg bg-success-lt rounded-circle mb-2">
                  <IconShieldCheck size={40} className="text-success" />
                </div>
                <h2 className="card-title text-success mb-1">Dokumen Asli & Terverifikasi</h2>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  <IconCheck size={14} className="me-1 inline" /> Tanda Tangan Sah Terdaftar
                </span>
              </div>

              <div className="list-group list-group-flush mb-4 border rounded">
                <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                  <span className="text-secondary d-flex align-items-center small">
                    <IconFileCertificate size={16} className="me-2 text-primary" /> Jenis Dokumen
                  </span>
                  <span className="badge bg-blue-lt text-uppercase font-weight-medium">
                    {data.document_type === "berita_acara" ? "Berita Acara" : "Timesheet Bulanan"}
                  </span>
                </div>

                {data.user_name && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary d-flex align-items-center small">
                      <IconUser size={16} className="me-2 text-primary" /> Penandatangan
                    </span>
                    <span className="font-weight-medium text-end">
                      {data.user_name}
                      {data.employee_id && (
                        <span className="text-muted small d-block">{data.employee_id}</span>
                      )}
                    </span>
                  </div>
                )}

                {data.period && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary d-flex align-items-center small">
                      <IconCalendar size={16} className="me-2 text-primary" /> Periode Kegiatan
                    </span>
                    <span className="font-weight-medium">{data.period}</span>
                  </div>
                )}

                {data.signed_at && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary small">Waktu Tanda Tangan</span>
                    <span className="text-muted small text-end">
                      {new Date(data.signed_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                )}

                {data.witness_name && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-secondary small">Saksi Penyetuju</span>
                    <span className="font-weight-medium text-end">
                      {data.witness_name}
                      {data.witness_signed_at && (
                        <span className="text-muted small d-block">
                          {new Date(data.witness_signed_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {data.hash && (
                  <div className="list-group-item py-3">
                    <span className="text-secondary d-flex align-items-center small mb-1">
                      <IconHash size={14} className="me-1 text-primary" /> Audit Hash Dokumen (SHA-256)
                    </span>
                    <div className="bg-light p-2 rounded small text-break font-monospace text-muted" style={{ fontSize: "0.75rem" }}>
                      {data.hash}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Link href="/login" className="btn btn-outline-secondary w-100">
                  Ke Portal Timesheet
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
