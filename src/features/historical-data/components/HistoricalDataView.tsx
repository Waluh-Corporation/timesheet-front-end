"use client";

import { useHistoricalData } from "../hooks/useHistoricalData";
import { Filters } from "./Filters";
import { DataTable } from "./DataTable";

export default function HistoricalDataView() {
  const { loading, filteredActivities, filters, options } = useHistoricalData();

  return (
    <div className="d-flex flex-column gap-3">
      {/* Page Header */}
      <div className="page-header d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle text-secondary">Archives & History</div>
            <h2 className="page-title">Historical Data</h2>
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

      <DataTable loading={loading} activities={filteredActivities} />
    </div>
  );
}
