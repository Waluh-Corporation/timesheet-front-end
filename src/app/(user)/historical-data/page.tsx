"use client";

import { History } from "lucide-react";
import { useHistoricalData } from "./hooks/useHistoricalData";
import { Filters } from "./components/Filters";
import { DataTable } from "./components/DataTable";

export default function HistoricalDataPage() {
  const { loading, filteredActivities, filters, options } = useHistoricalData();

  return (
    <div className="flex flex-col gap-6">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-4 bg-mr-yellow p-6 text-black">
          <div className="grid h-12 w-12 place-items-center border-2 border-black bg-white text-black">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Historical Data</h1>
            <p className="mt-1 text-sm font-semibold opacity-70">
              All of your daily activity data
            </p>
          </div>
        </div>
      </div>

      <Filters 
        filterMonth={filters.filterMonth}
        setFilterMonth={filters.setFilterMonth}
        filterYear={filters.filterYear}
        setFilterYear={filters.setFilterYear}
        filterStatus={filters.filterStatus}
        setFilterStatus={filters.setFilterStatus}
        filterApp={filters.filterApp}
        setFilterApp={filters.setFilterApp}
        uniqueYears={options.uniqueYears}
        uniqueStatuses={options.uniqueStatuses}
        uniqueApps={options.uniqueApps}
      />

      <DataTable 
        loading={loading}
        activities={filteredActivities}
      />
    </div>
  );
}
