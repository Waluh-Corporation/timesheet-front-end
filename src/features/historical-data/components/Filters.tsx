"use client";

import { useState } from "react";
import { IconFilter, IconHelp } from "@tabler/icons-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type FiltersProps = {
  filterMonth: number | "";
  setFilterMonth: (val: number | "") => void;
  filterYear: number | "";
  setFilterYear: (val: number | "") => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterApp: string;
  setFilterApp: (val: string) => void;
  uniqueYears: number[];
  uniqueStatuses: string[];
  uniqueApps: string[];
};

export function Filters({
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterStatus,
  setFilterStatus,
  filterApp,
  setFilterApp,
  uniqueYears,
  uniqueStatuses,
  uniqueApps,
}: Readonly<FiltersProps>) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-auto d-flex align-items-center gap-2 me-md-auto">
            <IconFilter size={18} className="text-primary" />
            <h3 className="card-title mb-0">Filters</h3>

            {/* Status Definition Tooltip */}
            <div className="position-relative d-inline-block ms-1">
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="btn btn-icon btn-sm btn-ghost rounded-circle text-secondary"
                aria-label="Toggle status definitions"
              >
                <IconHelp size={16} />
              </button>

              {showTooltip && (
                <div
                  className="position-absolute start-0 top-100 mt-1 card card-sm shadow border p-2 z-3"
                  style={{ width: 220 }}
                >
                  <div className="d-flex justify-content-between align-items-center pb-1 mb-1 border-bottom">
                    <span className="fw-bold small text-uppercase">Status Codes</span>
                    <button
                      type="button"
                      onClick={() => setShowTooltip(false)}
                      className="btn-close btn-sm p-0"
                      aria-label="Close"
                    ></button>
                  </div>
                  <ul className="list-unstyled mb-0 small">
                    <li><strong>P</strong> = Present</li>
                    <li><strong>S</strong> = Sick</li>
                    <li><strong>V</strong> = Vacation</li>
                    <li><strong>BT</strong> = Business Trip</li>
                    <li><strong>PM</strong> = Permit</li>
                    <li><strong>X</strong> = Not Working Anymore</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="col-6 col-sm-3 col-md-auto">
            <select
              className="form-select form-select-sm"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : "")}
              aria-label="Filter by month"
            >
              <option value="">All Months</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-sm-3 col-md-auto">
            <select
              className="form-select form-select-sm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : "")}
              aria-label="Filter by year"
            >
              <option value="">All Years</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-sm-3 col-md-auto">
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-sm-3 col-md-auto">
            <select
              className="form-select form-select-sm"
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              aria-label="Filter by project"
            >
              <option value="All">All Projects</option>
              {uniqueApps.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
