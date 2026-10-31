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
import { formatLocalTimestamp } from "@/lib/date";

export default function VerifyClient({ initialToken }: { initialToken?: string }) {
  const params = useParams();
  const token = initialToken || (params?.token as string) || "";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DocVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Timesheet Portal";

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
              : "Document not found or verification token is invalid."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      void loadVerification();
    } else {
      setLoading(false);
      setError("Document verification token was not provided.");
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const documentTypeLabel =
    data?.document_type === "berita_acara"
      ? "Berita Acara - Attendance Incident Report"
      : "Monthly Timesheet";

  return (
    <div className="page page-center min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="container container-tight py-4" style={{ maxWidth: 540 }}>
        <div className="text-center mb-4">
          <Link href="/login" className="navbar-brand navbar-brand-autodark">
            <h1 className="h2 text-primary font-weight-bold mb-0">{appName}</h1>
          </Link>
          <p className="text-secondary small mt-1">
            Official Digital Signature & Document Verification System
          </p>
        </div>

        <div className="card shadow-sm border-0">
          {loading ? (
            <div className="card-body text-center py-5">
              <IconLoader2 className="animate-spin text-primary mb-3" size={40} />
              <h3 className="h4 text-secondary mb-1">Verifying Document…</h3>
              <p className="text-muted small mb-0">
                Checking digital signature validity and audit trail.
              </p>
            </div>
          ) : error || !data || !data.is_valid ? (
            <div className="card-body text-center py-5">
              <div className="avatar avatar-lg bg-danger-lt rounded-circle mb-3">
                <IconAlertTriangle size={36} className="text-danger" />
              </div>
              <h2 className="card-title text-danger mb-2">Document Verification Failed</h2>
              <p className="text-secondary small mb-4">
                {error ||
                  "This digital document could not be verified, has expired, or the verification token is invalid."}
              </p>
              <div className="alert alert-warning text-start small mb-4">
                <strong>Security Notice:</strong> Ensure you are using the complete verification link or official QR code printed on the certified document.
              </div>
              <Link href="/login" className="btn btn-outline-secondary w-100">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="avatar avatar-lg bg-success-lt rounded-circle mb-2">
                  <IconShieldCheck size={40} className="text-success" />
                </div>
                <h2 className="card-title text-success mb-1">Authentic & Verified Document</h2>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  <IconCheck size={14} className="me-1 inline" /> Valid Registered Digital Signature
                </span>
              </div>

              <div className="list-group list-group-flush mb-4 border rounded">
                <div className="list-group-item d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
                  <span className="text-secondary d-flex align-items-center small">
                    <IconFileCertificate size={16} className="me-2 text-primary" /> Document Type
                  </span>
                  <span className="badge bg-blue-lt text-uppercase font-weight-medium text-wrap">
                    {documentTypeLabel}
                  </span>
                </div>

                {data.user_name && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
                    <span className="text-secondary d-flex align-items-center small">
                      <IconUser size={16} className="me-2 text-primary" /> Signatory
                    </span>
                    <span className="font-weight-medium text-end">
                      {data.user_name}
                      {data.employee_id && (
                        <span className="text-muted small d-block">ID: {data.employee_id}</span>
                      )}
                    </span>
                  </div>
                )}

                {data.period && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
                    <span className="text-secondary d-flex align-items-center small">
                      <IconCalendar size={16} className="me-2 text-primary" /> Period
                    </span>
                    <span className="font-weight-medium">{data.period}</span>
                  </div>
                )}

                {data.signed_at && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
                    <span className="text-secondary small">Signed At</span>
                    <span className="text-muted small text-end font-monospace">
                      {formatLocalTimestamp(data.signed_at)}
                    </span>
                  </div>
                )}

                {data.witness_name && (
                  <div className="list-group-item d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
                    <span className="text-secondary small">Approved Witness</span>
                    <span className="font-weight-medium text-end">
                      {data.witness_name}
                      {data.witness_signed_at && (
                        <span className="text-muted small d-block font-monospace">
                          {formatLocalTimestamp(data.witness_signed_at)}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {data.hash && (
                  <div className="list-group-item py-3">
                    <span className="text-secondary d-flex align-items-center small mb-1">
                      <IconHash size={14} className="me-1 text-primary" /> Document Audit Hash (SHA-256)
                    </span>
                    <div
                      className="bg-light p-2 rounded small text-break font-monospace text-muted text-uppercase"
                      style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                    >
                      {data.hash.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Link href="/login" className="btn btn-outline-secondary w-100">
                  Go to Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
