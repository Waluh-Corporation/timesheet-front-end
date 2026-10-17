"use client";

import { useDashboardData } from "./hooks/useDashboardData";
import { DashboardHeader } from "./components/DashboardHeader";
import { MonthlyGrid } from "./components/MonthlyGrid";
import { TimesheetJobsModal } from "./components/TimesheetJobsModal";
import { MonthlyWitnessModal } from "./components/MonthlyWitnessModal";

export default function DashboardPage() {
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
    <div className="flex flex-col gap-6">
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
