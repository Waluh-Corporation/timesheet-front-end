"use client";

import { forwardRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface HotGridProps {
  data: any[][];
  colHeaders?: boolean | string[];
  rowHeaders?: boolean;
  cells?: (row: number, col: number) => any;
  afterSelectionEnd?: (r: number, c: number, r2: number, c2: number) => void;
  afterChange?: (changes: any, source: string) => void;
  readOnly?: boolean;
  height?: number | string;
  colWidths?: number | number[];
  mergeCells?: any[];
}

const HotGrid = forwardRef<any, HotGridProps>(function HotGrid(props, ref) {
  const { data, colHeaders, cells, afterChange, readOnly } = props;

  // Ensure colHeaders is an array of strings
  const headers = Array.isArray(colHeaders) ? colHeaders : [];

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // On mount or when data changes significantly, we can default to expanding the current day
  // To keep it simple, we just expand the first item we render (which is the highest date)
  useEffect(() => {
    if (data.length > 0) {
      const today = new Date().getDate();
      // If the data length is at least today's date, expand today's row (today - 1)
      // Otherwise expand the last available row
      const rowToExpand = data.length >= today ? today - 1 : data.length - 1;
      setExpandedRows((prev) => ({ ...prev, [rowToExpand]: true }));
    }
  }, [data.length]);

  const toggleRow = (r: number) => {
    setExpandedRows((prev) => ({ ...prev, [r]: !prev[r] }));
  };

  const handleInputChange = (originalRowIndex: number, colIndex: number, newValue: string) => {
    if (readOnly) return;
    
    // We update the local data directly to simulate the two-way binding of Handsontable
    // However, since `data` is passed from parent, we should ideally let the parent update it.
    // The parent dashboard currently expects Handsontable to mutate the array before calling afterChange, 
    // or it relies on reading the changed gridData in afterChange.
    // Wait, dashboard's afterChange reads from gridData which is re-computed on render!
    // Actually, Handsontable mutates the array internally.
    const oldValue = data[originalRowIndex][colIndex];
    data[originalRowIndex][colIndex] = newValue;
    
    if (afterChange) {
      afterChange([[originalRowIndex, colIndex, oldValue, newValue]], "edit");
    }
  };

  // We reverse the data to show the most recent days at the top (e.g. 31 down to 1)
  const rows = data
    .map((rowData, originalRowIndex) => ({
      rowData,
      originalRowIndex,
    }))
    .reverse();

  return (
    <div
      className="flex flex-col gap-3 overflow-y-auto pr-2"
      style={{ maxHeight: props.height }}
    >
      {rows.map(({ rowData, originalRowIndex }) => {
        const dayLabel = rowData[0];
        const dayCellMeta = cells ? cells(originalRowIndex, 0) : {};
        const isHoliday = dayCellMeta.className?.includes("holiday");
        const isWeekend = dayCellMeta.className?.includes("weekend");
        const isNonWorking = isHoliday || isWeekend;

        // Add a badge or label for today / yesterday
        const today = new Date().getDate();
        let dayStatus = "";
        if (originalRowIndex + 1 === today) dayStatus = "(Today)";
        else if (originalRowIndex + 1 === today - 1) dayStatus = "(Yesterday)";

        return (
          <div
            key={originalRowIndex}
            className={`card border overflow-hidden transition-colors ${
              isNonWorking
                ? "border-mr-black/5 bg-mr-black/5"
                : "border-mr-black/10 bg-white"
            }`}
          >
            <button
              onClick={() => toggleRow(originalRowIndex)}
              className={`w-full flex items-center justify-between p-4 text-left transition hover:bg-mr-black/5`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold ${isNonWorking ? "text-mr-muted" : "text-black"}`}>
                  {dayLabel} {dayStatus && <span className="text-mr-purple ml-1">{dayStatus}</span>}
                </span>
                {isHoliday && <span className="text-xs px-2 py-0.5 rounded-full bg-mr-pink/20 text-mr-pink font-semibold">Holiday</span>}
                {isWeekend && !isHoliday && <span className="text-xs px-2 py-0.5 rounded-full bg-mr-black/10 text-mr-muted font-semibold">Weekend</span>}
              </div>
              <div className="text-mr-muted">
                {expandedRows[originalRowIndex] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {expandedRows[originalRowIndex] && (
              <div className="p-4 border-t border-mr-black/10 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                {headers.slice(1).map((header, i) => {
                  const colIndex = i + 1;
                  const value = rowData[colIndex] || "";
                  const cellMeta = cells ? cells(originalRowIndex, colIndex) : { readOnly };
                  const isReadOnly = cellMeta.readOnly || readOnly;

                  return (
                    <div key={colIndex} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-mr-muted">
                        {header}
                      </label>
                      {cellMeta.type === "dropdown" ? (
                        <select
                          className="input w-full"
                          value={value}
                          disabled={isReadOnly}
                          onChange={(e) =>
                            handleInputChange(originalRowIndex, colIndex, e.target.value)
                          }
                        >
                          <option value=""></option>
                          {cellMeta.source?.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="input w-full"
                          value={value}
                          disabled={isReadOnly}
                          onChange={(e) =>
                            handleInputChange(originalRowIndex, colIndex, e.target.value)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default HotGrid;
