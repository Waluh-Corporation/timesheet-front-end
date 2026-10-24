"use client";

import {
  IconShieldCheck,
  IconAlertTriangle,
  IconClock,
  IconCheck,
  IconX,
  IconSend,
  IconLoader2,
  IconArrowBackUp,
} from "@tabler/icons-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardHeader } from "./DashboardHeader";
import { MonthlyGrid } from "./MonthlyGrid";
import { TimesheetJobsModal } from "./TimesheetJobsModal";
import { MonthlyWitnessModal } from "./MonthlyWitnessModal";
import { WitnessReviewModal } from "./WitnessReviewModal";

export default function DashboardView() {
  const {
    user,
    activities,
    monthlyWitness,
    beritaAcaraCount,
    beritaAcaraStatus,
    submittingBA,
    handleSubmitBeritaAcara,
    revokingBA,
    handleRevokeBeritaAcara,
    witnessRequests,
    isWitnessReviewModalOpen,
    setIsWitnessReviewModalOpen,
    loading,
    generating,
    generate,
    pushBusy,
    pushOn,
    handleTogglePush,
    pushSupported,
    sendingTestPush,
    handleSendTestPush,
    isJobsModalOpen,
    setIsJobsModalOpen,
    isWitnessModalOpen,
    setIsWitnessModalOpen,
    handleAddPasskey,
    passkeysSupported,
    year,
    month,
    totalDays,
    now,
    byDay,
    holidays,
    page,
    setPage,
    ITEMS_PER_PAGE,
    reload,
  } = useDashboardData();

  const witnessName =
    beritaAcaraStatus?.witness_name ||
    monthlyWitness?.name ||
    (beritaAcaraStatus?.witness_id ? `Saksi #${beritaAcaraStatus.witness_id}` : "Saksi");

  const isBaSigned =
    beritaAcaraStatus?.status === "signed" || beritaAcaraStatus?.status === "approved";
  const isBaPending =
    beritaAcaraStatus?.status === "pending_witness" || beritaAcaraStatus?.status === "submitted";
  const isBaRejected = beritaAcaraStatus?.status === "rejected";
  const isBaRevoked = beritaAcaraStatus?.status === "revoked";
  const isBaUnsubmitted = !beritaAcaraStatus || beritaAcaraStatus.status === "draft";

  return (
    <div className="d-flex flex-column gap-3">
      {/* Witness pending review notification alert banner */}
      {witnessRequests.length > 0 && (
        <div className="alert alert-warning border border-warning shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-0" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span className="avatar avatar-sm bg-warning text-warning-fg rounded">
              <IconShieldCheck size={20} />
            </span>
            <div>
              <div className="fw-bold">Permohonan Tanda Tangan Saksi Tertunda ({witnessRequests.length})</div>
              <div className="small text-secondary">
                Anda ditunjuk sebagai saksi untuk {witnessRequests.length} Berita Acara bulanan yang memerlukan persetujuan & tanda tangan Anda.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-warning btn-sm d-flex align-items-center gap-1 shrink-0"
            onClick={() => setIsWitnessReviewModalOpen(true)}
          >
            <IconCheck size={16} />
            <span>Tinjau Permohonan</span>
          </button>
        </div>
      )}

      {/* Berita Acara Guard Banner for Month Period */}
      {beritaAcaraCount > 0 && (
        <>
          {isBaUnsubmitted && (
            <div className="alert alert-warning border-warning shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-0" role="alert">
              <div className="d-flex align-items-center gap-2">
                <span className="avatar avatar-sm bg-warning-lt text-warning rounded">
                  <IconAlertTriangle size={20} />
                </span>
                <div>
                  <div className="fw-bold">⚠️ Berita Acara Belum Diajukan ke Saksi</div>
                  <div className="small text-secondary">
                    Terdapat {beritaAcaraCount} catatan Berita Acara pada periode ini yang belum diajukan ke saksi. Dokumen timesheet belum dapat dibuat sebelum Berita Acara disetujui & ditandatangani oleh saksi.
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 shrink-0">
                {!monthlyWitness && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setIsWitnessModalOpen(true)}
                  >
                    Atur Saksi
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                  onClick={() => handleSubmitBeritaAcara()}
                  disabled={submittingBA || !monthlyWitness}
                  title={!monthlyWitness ? "Atur saksi bulanan terlebih dahulu" : "Ajukan Berita Acara ke saksi"}
                >
                  {submittingBA ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <IconSend size={16} />
                  )}
                  <span>Ajukan ke Saksi</span>
                </button>
              </div>
            </div>
          )}

          {isBaPending && (
            <div className="alert alert-info border-info shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-0" role="alert">
              <div className="d-flex align-items-center gap-2">
                <span className="avatar avatar-sm bg-info-lt text-info rounded shrink-0">
                  <IconClock size={20} />
                </span>
                <div>
                  <div className="fw-bold">⏳ Menunggu Tanda Tangan Saksi</div>
                  <div className="small text-secondary">
                    Pengajuan Berita Acara telah terkirim. Dokumen belum dapat dibuat karena masih menunggu persetujuan dan tanda tangan dari saksi {witnessName}.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 shrink-0"
                onClick={() => {
                  if (window.confirm("Batalkan permintaan tanda tangan saksi untuk Berita Acara periode ini?")) {
                    handleRevokeBeritaAcara();
                  }
                }}
                disabled={revokingBA}
                title="Batalkan permintaan tanda tangan saksi ini"
              >
                {revokingBA ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconArrowBackUp size={16} />
                )}
                <span>Batalkan Permintaan</span>
              </button>
            </div>
          )}

          {isBaRevoked && (
            <div className="alert alert-warning border-warning shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-0" role="alert">
              <div className="d-flex align-items-center gap-2">
                <span className="avatar avatar-sm bg-warning-lt text-warning rounded shrink-0">
                  <IconArrowBackUp size={20} />
                </span>
                <div>
                  <div className="fw-bold">↩️ Pengajuan Berita Acara Dibatalkan</div>
                  <div className="small text-secondary">
                    Permintaan tanda tangan saksi untuk periode ini telah dibatalkan. Anda dapat mengoreksi aktivitas harian atau mengajukan kembali ke saksi.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center gap-1 shrink-0"
                onClick={() => handleSubmitBeritaAcara()}
                disabled={submittingBA || !monthlyWitness}
                title={!monthlyWitness ? "Atur saksi bulanan terlebih dahulu" : "Ajukan kembali Berita Acara ke saksi"}
              >
                {submittingBA ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconSend size={16} />
                )}
                <span>Ajukan Kembali ke Saksi</span>
              </button>
            </div>
          )}

          {isBaRejected && (
            <div className="alert alert-danger border-danger shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-0" role="alert">
              <div className="d-flex align-items-center gap-2">
                <span className="avatar avatar-sm bg-danger-lt text-danger rounded shrink-0">
                  <IconX size={20} />
                </span>
                <div>
                  <div className="fw-bold">❌ Pengajuan Berita Acara Ditolak oleh Saksi ({witnessName})</div>
                  <div className="small text-secondary">
                    Catatan revisi saksi: <em>&ldquo;{beritaAcaraStatus?.witness_rejection_notes || beritaAcaraStatus?.notes || "Periksa catatan harian"}&rdquo;</em>. Harap periksa catatan revisi dan ajukan kembali.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm d-flex align-items-center gap-1 shrink-0"
                onClick={() => handleSubmitBeritaAcara()}
                disabled={submittingBA}
              >
                {submittingBA ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconSend size={16} />
                )}
                <span>Ajukan Kembali ke Saksi</span>
              </button>
            </div>
          )}

          {isBaSigned && (
            <div className="alert alert-success border-success shadow-sm d-flex align-items-center gap-2 mb-0" role="alert">
              <span className="avatar avatar-sm bg-success-lt text-success rounded shrink-0">
                <IconCheck size={20} />
              </span>
              <div>
                <div className="fw-bold">Berita Acara Telah Disetujui & Ditandatangani Saksi</div>
                <div className="small text-secondary">
                  Seluruh catatan Berita Acara telah diverifikasi oleh saksi. Dokumen timesheet siap untuk di-generate.
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <DashboardHeader
        user={user}
        filledCount={activities.length}
        generating={generating}
        onGenerate={generate}
        pushBusy={pushBusy}
        pushOn={pushOn}
        onTogglePush={handleTogglePush}
        pushSupported={pushSupported()}
        sendingTestPush={sendingTestPush}
        onSendTestPush={handleSendTestPush}
        onOpenJobsModal={() => setIsJobsModalOpen(true)}
        onAddPasskey={handleAddPasskey}
        passkeysSupported={passkeysSupported()}
        monthlyWitness={monthlyWitness}
        beritaAcaraCount={beritaAcaraCount}
        onOpenWitnessModal={() => setIsWitnessModalOpen(true)}
        witnessRequestsCount={witnessRequests.length}
        onOpenWitnessReviewModal={() => setIsWitnessReviewModalOpen(true)}
      />

      <MonthlyGrid
        loading={loading}
        year={year}
        month={month}
        totalDays={totalDays}
        now={now}
        byDay={byDay}
        holidays={holidays}
        page={page}
        setPage={setPage}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
      />

      <TimesheetJobsModal
        isOpen={isJobsModalOpen}
        onClose={() => setIsJobsModalOpen(false)}
        currentYear={year}
        currentMonth={month}
      />

      <MonthlyWitnessModal
        isOpen={isWitnessModalOpen}
        onClose={() => setIsWitnessModalOpen(false)}
        year={year}
        month={month}
        currentWitness={monthlyWitness}
        beritaAcaraCount={beritaAcaraCount}
        onWitnessUpdated={reload}
      />

      <WitnessReviewModal
        isOpen={isWitnessReviewModalOpen}
        onClose={() => setIsWitnessReviewModalOpen(false)}
        requests={witnessRequests}
        onActionCompleted={reload}
      />
    </div>
  );
}

