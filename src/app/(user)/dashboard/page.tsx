"use client";

import { useDashboardData } from "./hooks/useDashboardData";
import { DashboardHeader } from "./components/DashboardHeader";
import { MonthlyGrid } from "./components/MonthlyGrid";

export default function DashboardPage() {
  const {
    user,
    activities,
    loading,
    generating,
    generate,
    pushBusy,
    pushOn,
    handleTogglePush,
    pushSupported,
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
        onAddPasskey={handleAddPasskey}
        passkeysSupported={passkeysSupported()}
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
    </div>
  );
}
