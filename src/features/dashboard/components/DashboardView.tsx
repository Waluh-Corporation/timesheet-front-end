"use client";

import { useState } from "react";
import {
  IconTable,
  IconLayoutList,
} from "@tabler/icons-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardHeader } from "./DashboardHeader";
import { MonthlyGrid } from "./MonthlyGrid";
import { ActivitiesTable } from "./ActivitiesTable";
import { MonthlyWitnessCard } from "./MonthlyWitnessCard";
import { TimesheetJobsModal } from "./TimesheetJobsModal";
import { MonthlyWitnessModal } from "./MonthlyWitnessModal";
import { WitnessReviewModal } from "./WitnessReviewModal";
import { UnsignedBeritaAcaraModal } from "./UnsignedBeritaAcaraModal";

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
    timesheetStatus,
    signingTimesheet,
    handleSignTimesheet,
    revokingTimesheet,
    handleRevokeTimesheet,
    witnessRequests,
    isWitnessReviewModalOpen,
    setIsWitnessReviewModalOpen,
    pushSchedule,
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
    isUnsignedBAModalOpen,
    setIsUnsignedBAModalOpen,
    unsignedActivities,
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

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const isTimesheetSigned = Boolean(
    timesheetStatus?.is_signed || timesheetStatus?.status === "signed"
  );
  const isBaSigned =
    beritaAcaraStatus?.status === "signed" || beritaAcaraStatus?.status === "approved";
  const isBaPending =
    beritaAcaraStatus?.status === "pending_witness" || beritaAcaraStatus?.status === "submitted";
  const isBaRejected = beritaAcaraStatus?.status === "rejected";

  const handleGenerateWithGuard = async () => {
    if (beritaAcaraCount > 0 && !isBaSigned) {
      setIsUnsignedBAModalOpen(true);
      return;
    }
    await generate();
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Header with Quick Action Cards */}
      <DashboardHeader
        user={user}
        filledCount={activities.length}
        generating={generating}
        onGenerate={handleGenerateWithGuard}
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
        beritaAcaraStatus={beritaAcaraStatus}
        submittingBA={submittingBA}
        onSubmitBeritaAcara={() => handleSubmitBeritaAcara()}
        onOpenWitnessModal={() => setIsWitnessModalOpen(true)}
        witnessRequestsCount={witnessRequests.length}
        onOpenWitnessReviewModal={() => setIsWitnessReviewModalOpen(true)}
        timesheetStatus={timesheetStatus}
        pushSchedule={pushSchedule}
      />

      {/* Unified Monthly Witness & Berita Acara Card (Single Source of Truth) */}
      <MonthlyWitnessCard
        month={month}
        year={year}
        monthlyWitness={monthlyWitness}
        beritaAcaraStatus={beritaAcaraStatus}
        beritaAcaraCount={beritaAcaraCount}
        submittingBA={submittingBA}
        onSubmitBeritaAcara={() => handleSubmitBeritaAcara()}
        onRevokeBeritaAcara={handleRevokeBeritaAcara}
        revokingBA={revokingBA}
        onOpenUnsignedModal={() => setIsUnsignedBAModalOpen(true)}
        onOpenWitnessModal={() => setIsWitnessModalOpen(true)}
        isTimesheetSigned={isTimesheetSigned}
      />

      {/* Table vs Grid View Selector */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
        <h3 className="h3 mb-0 fw-bold text-slate-900">Timesheet Entries</h3>
        <div className="btn-group btn-group-sm" role="group" aria-label="View toggle">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`btn d-inline-flex align-items-center gap-1.5 ${
              viewMode === "table" ? "btn-dark fw-bold" : "btn-outline-secondary"
            }`}
            aria-pressed={viewMode === "table"}
          >
            <IconTable size={16} aria-hidden="true" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`btn d-inline-flex align-items-center gap-1.5 ${
              viewMode === "grid" ? "btn-dark fw-bold" : "btn-outline-secondary"
            }`}
            aria-pressed={viewMode === "grid"}
          >
            <IconLayoutList size={16} aria-hidden="true" />
            <span>Cards View</span>
          </button>
        </div>
      </div>

      {/* Render Table or Grid View */}
      {viewMode === "table" ? (
        <ActivitiesTable
          beritaAcaraStatus={beritaAcaraStatus}
          onOpenWitnessModal={() => setIsWitnessModalOpen(true)}
        />
      ) : (
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
          monthlyWitness={monthlyWitness}
          beritaAcaraStatus={beritaAcaraStatus}
          onOpenWitnessModal={() => setIsWitnessModalOpen(true)}
        />
      )}

      {/* Modals */}
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
        beritaAcaraStatus={beritaAcaraStatus}
        onRevokeBeritaAcara={handleRevokeBeritaAcara}
        revokingBA={revokingBA}
        onSubmitBeritaAcara={() => handleSubmitBeritaAcara()}
        submittingBA={submittingBA}
        onWitnessUpdated={reload}
      />

      <WitnessReviewModal
        isOpen={isWitnessReviewModalOpen}
        onClose={() => setIsWitnessReviewModalOpen(false)}
        requests={witnessRequests}
        onActionCompleted={reload}
      />

      <UnsignedBeritaAcaraModal
        isOpen={isUnsignedBAModalOpen}
        onClose={() => setIsUnsignedBAModalOpen(false)}
        month={month}
        year={year}
        monthlyWitness={monthlyWitness}
        unsignedActivities={unsignedActivities}
        beritaAcaraStatus={beritaAcaraStatus}
        onSubmitBeritaAcara={() => handleSubmitBeritaAcara()}
        submittingBA={submittingBA}
        onRevokeBeritaAcara={handleRevokeBeritaAcara}
        revokingBA={revokingBA}
        onOpenWitnessModal={() => setIsWitnessModalOpen(true)}
      />
    </div>
  );
}
