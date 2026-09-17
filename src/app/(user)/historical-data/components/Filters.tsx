import { useState } from "react";
import { Filter } from "lucide-react";

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
  filterMonth, setFilterMonth,
  filterYear, setFilterYear,
  filterStatus, setFilterStatus,
  filterApp, setFilterApp,
  uniqueYears,
  uniqueStatuses,
  uniqueApps,
}: Readonly<FiltersProps>) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-auto">
          <Filter size={18} className="text-mr-purple" />
          <h2 className="text-lg font-bold">Filters</h2>
          
          {/* Status Definition Tooltip */}
          <div className="relative flex items-center ml-1">
            <button 
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-mr-muted hover:text-mr-ink hover:bg-mr-surface2 transition-colors cursor-pointer rounded-full border border-mr-muted/30 w-5 h-5 flex items-center justify-center text-xs font-bold"
              aria-label="Toggle status definitions"
            >
              ?
            </button>
            
            {showTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-3 bg-mr-surface text-mr-ink border-2 border-mr-ink shadow-[4px_4px_0_0_var(--ink)] text-xs z-50 cursor-default">
                <div className="font-bold mb-2 uppercase border-b border-mr-ink/20 pb-1 flex justify-between items-center">
                  <span>Definitions</span>
                  <button type="button" onClick={() => setShowTooltip(false)} className="text-mr-muted hover:text-mr-ink font-normal px-1 -mr-1">✕</button>
                </div>
                <ul className="space-y-1 text-left font-normal">
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
        
        <select
          className="input w-auto"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">All Months</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        
        <select
          className="input w-auto"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">All Years</option>
          {uniqueYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        
        <select
          className="input w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {uniqueStatuses.map((s) => (
            <option key={s as string} value={s as string}>{s as string}</option>
          ))}
        </select>
        
        <select
          className="input w-auto"
          value={filterApp}
          onChange={(e) => setFilterApp(e.target.value)}
        >
          <option value="All">All Apps Impacted</option>
          {uniqueApps.map((a) => (
            <option key={a as string} value={a as string}>{a as string}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
