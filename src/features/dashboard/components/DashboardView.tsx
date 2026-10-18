"use client";

import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardHeader } from "./DashboardHeader";
import { MonthlyGrid } from "./MonthlyGrid";
import { TimesheetJobsModal } from "./TimesheetJobsModal";
import { MonthlyWitnessModal } from "./MonthlyWitnessModal";

export default function DashboardView() {
  const {
    user,
    activities,
    monthlyWitness,
    beritaAcaraCount,
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

  return (
    <div className="d-flex flex-column gap-3">
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
    </div>
  );
}
