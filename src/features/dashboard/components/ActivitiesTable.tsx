"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  PaginationState,
  flexRender,
} from "@tanstack/react-table";
import {
  IconLoader2,
  IconShieldCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconPencil,
  IconFileText,
} from "@tabler/icons-react";
import { useActivities } from "../useActivitiesQuery";
import { useTimesheetStore } from "../useTimesheetStore";
import type { DailyActivity, BeritaAcaraStatusResponse } from "@/lib/types";
import { formatLocalDate } from "@/lib/date";
import { Modal } from "@/components/tabler";

interface ActivitiesTableProps {
  beritaAcaraStatus?: BeritaAcaraStatusResponse | null;
  onOpenWitnessModal?: () => void;
}

export function ActivitiesTable({
  beritaAcaraStatus,
  onOpenWitnessModal,
}: Readonly<ActivitiesTableProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, limit, setPagination } = useTimesheetStore();
  const { data, isLoading, isPlaceholderData } = useActivities();

  // Selected Berita Acara for detailed inspection modal
  const [selectedIncident, setSelectedIncident] = useState<DailyActivity | null>(null);

  // Synchronize URL query params with Zustand store
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    if (pageParam || limitParam) {
      const p = pageParam ? Math.max(1, Number.parseInt(pageParam, 10) || 1) : page;
      const l = limitParam ? Number.parseInt(limitParam, 10) || limit : limit;
      if (p !== page || l !== limit) {
        setPagination(p, l);
      }
    }
  }, [searchParams, page, limit, setPagination]);

  // Update URL search params when page or limit changes
  const handlePageChange = (newPage: number, newLimit: number) => {
    setPagination(newPage, newLimit);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    params.set("limit", String(newLimit));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const columns = useMemo<ColumnDef<DailyActivity>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: (info) => {
          const act = info.row.original;
          const dateStr = String(info.getValue() || "");
          const d = new Date(dateStr);
          const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] || "";
          return (
            <div className="d-flex align-items-center gap-2">
              <span className="avatar avatar-xs rounded bg-slate-100 text-slate-800 fw-bold">
                {d.getDate() || "-"}
              </span>
              <div>
                <div className="fw-semibold text-slate-900 text-nowrap">
                  {formatLocalDate(dateStr)}
                </div>
                <div className="text-muted small">{dow}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "activity",
        header: "Activity / Description",
        cell: (info) => {
          const act = info.row.original;
          const description = String(act.work_description || act.activity || "-");
          return (
            <div className="min-w-0" style={{ maxWidth: 360 }}>
              <div className="text-slate-900 text-truncate font-weight-medium">
                {description}
              </div>
              {act.project_name && (
                <span className="badge bg-slate-100 text-slate-700 mt-1">
                  {act.project_name}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "start_time",
        header: "Time In / Out",
        cell: (info) => {
          const act = info.row.original;
          if (!act.start_time && !act.end_time) {
            return <span className="text-muted small fst-italic">—</span>;
          }
          return (
            <span className="text-nowrap text-slate-800 small">
              {act.start_time || "--:--"} - {act.end_time || "--:--"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = String(info.getValue() || "P");
          return (
            <span className="badge bg-blue-lt fw-bold px-2 py-1">
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "is_berita_acara",
        header: "Berita Acara - Attendance Incident",
        cell: (info) => {
          const act = info.row.original;
          if (!act.is_berita_acara) {
            return <span className="text-muted small px-2">-</span>;
          }

          const baStatus = beritaAcaraStatus?.status;
          const isSigned = baStatus === "signed" || baStatus === "approved";
          const isPending = baStatus === "pending_witness" || baStatus === "submitted";
          const isRejected = baStatus === "rejected";

          return (
            <button
              type="button"
              onClick={() => setSelectedIncident(act)}
              className="btn btn-sm btn-ghost p-0 border-0 text-start"
              title="Click to view Attendance Incident Report details and witness status"
              aria-label="View Attendance Incident Report details"
            >
              {isSigned ? (
                <span className="badge bg-green-lt text-green d-inline-flex align-items-center gap-1 cursor-pointer">
                  <IconCheck size={12} aria-hidden="true" />
                  <span>Signed & Approved</span>
                </span>
              ) : isPending ? (
                <span className="badge bg-yellow-lt text-yellow d-inline-flex align-items-center gap-1 cursor-pointer">
                  <IconClock size={12} aria-hidden="true" />
                  <span>Awaiting Witness</span>
                </span>
              ) : isRejected ? (
                <span className="badge bg-danger-lt text-danger d-inline-flex align-items-center gap-1 cursor-pointer">
                  <IconAlertTriangle size={12} aria-hidden="true" />
                  <span>Rejected</span>
                </span>
              ) : (
                <span className="badge bg-secondary-lt text-secondary d-inline-flex align-items-center gap-1 cursor-pointer">
                  <IconFileText size={12} aria-hidden="true" />
                  <span>Draft</span>
                </span>
              )}
            </button>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: (info) => {
          const act = info.row.original;
          const href = act.id ? `/activity?id=${act.id}` : `/activity?date=${act.date}`;
          return (
            <Link
              href={href}
              className="btn btn-sm btn-ghost d-inline-flex align-items-center justify-content-center text-slate-700"
              style={{ minWidth: 44, minHeight: 44 }}
              title="Edit daily activity"
              aria-label={`Edit activity for ${formatLocalDate(act.date)}`}
            >
              <IconPencil size={16} aria-hidden="true" />
            </Link>
          );
        },
      },
    ],
    [beritaAcaraStatus]
  );

  const paginationState: PaginationState = {
    pageIndex: page - 1,
    pageSize: limit,
  };

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pagination?.total_pages ?? -1,
    state: {
      pagination: paginationState,
    },
    onPaginationChange: (updater) => {
      const nextState =
        typeof updater === "function" ? updater(paginationState) : updater;
      handlePageChange(nextState.pageIndex + 1, nextState.pageSize);
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total_rows: 0,
    total_pages: 1,
  };

  const totalRows = pagination.total_rows || 0;
  const totalPages = Math.max(1, pagination.total_pages || 1);
  const startRow = totalRows === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(pagination.page * pagination.limit, totalRows);

  // Smart page numbers calculation with ellipsis for > 5 pages
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <>
      <div className="card shadow-sm border-slate-200">
        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table className="table table-vcenter table-hover card-table mb-0">
            <thead className="bg-slate-50 text-slate-700 text-uppercase small">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-3 fw-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5">
                    <IconLoader2 className="animate-spin text-primary mb-2 mx-auto" size={28} />
                    <div className="text-secondary small">Loading daily activities…</div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-5 text-secondary">
                    No activity entries found for this period.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={isPlaceholderData ? "opacity-75 transition-opacity" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* UI/UX Pro Max Standard Pagination Bar */}
        <div className="card-footer d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 py-3 px-3 border-top bg-white">
          {/* Left: Showing range counter */}
          <div className="text-secondary small">
            Showing <strong>{startRow}</strong> to <strong>{endRow}</strong> of{" "}
            <strong>{totalRows}</strong> results
          </div>

          {/* Middle: Rows per page selector */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="rows-per-page" className="form-label small text-secondary mb-0 text-nowrap">
              Rows per page:
            </label>
            <select
              id="rows-per-page"
              value={limit}
              onChange={(e) => handlePageChange(1, Number.parseInt(e.target.value, 10))}
              className="form-select form-select-sm w-auto cursor-pointer"
              aria-label="Rows per page selector"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Right: Accessible Pagination Navigation */}
          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(Math.max(1, page - 1), limit)}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
              style={{ minWidth: 44, minHeight: 44 }}
              aria-label="Previous page"
            >
              <IconChevronLeft size={16} aria-hidden="true" />
            </button>

            {/* Desktop Page Numbers */}
            <div className="d-none d-sm-flex align-items-center gap-1">
              {pageNumbers.map((p, idx) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p, limit)}
                    className={`btn btn-sm ${
                      p === page
                        ? "btn-dark fw-bold shadow-sm"
                        : "btn-outline-secondary"
                    }`}
                    style={{ minWidth: 44, minHeight: 44 }}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted">
                    …
                  </span>
                )
              )}
            </div>

            {/* Mobile Compact Page Indicator (< 640px) */}
            <div className="d-sm-none text-secondary small px-2 font-weight-medium">
              Page {page} of {totalPages}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(Math.min(totalPages, page + 1), limit)}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
              style={{ minWidth: 44, minHeight: 44 }}
              aria-label="Next page"
            >
              <IconChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <Modal
          isOpen={Boolean(selectedIncident)}
          onClose={() => setSelectedIncident(null)}
          title={
            <div className="d-flex align-items-center gap-2">
              <IconShieldCheck size={20} className="text-primary" aria-hidden="true" />
              <span>Berita Acara - Attendance Incident Report Details</span>
            </div>
          }
          size="lg"
          footer={
            <div className="d-flex justify-content-end gap-2 w-100">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedIncident(null)}
              >
                Close
              </button>
              {onOpenWitnessModal && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedIncident(null);
                    onOpenWitnessModal();
                  }}
                >
                  Monthly Witness Settings
                </button>
              )}
            </div>
          }
        >
          <div className="d-flex flex-column gap-3">
            <div className="p-3 bg-body-tertiary rounded border">
              <div className="small text-secondary fw-semibold text-uppercase">
                Incident Date
              </div>
              <div className="fw-bold fs-4">{formatLocalDate(selectedIncident.date)}</div>
            </div>

            <div>
              <span className="form-label small fw-semibold text-secondary d-block">
                Reported Reason / Note
              </span>
              <div className="p-3 border rounded bg-white">
                {selectedIncident.berita_acara_notes || "No additional discrepancy note provided."}
              </div>
            </div>

            <div className="p-3 border rounded bg-slate-50 d-flex flex-column gap-2">
              <div className="small text-secondary fw-semibold text-uppercase">
                Assigned Witness & Status
              </div>
              <div>
                Witness:{" "}
                <strong>
                  {beritaAcaraStatus?.witness_name ||
                    selectedIncident.witness?.name ||
                    "Monthly Designated Witness"}
                </strong>{" "}
                <span className="text-secondary small">(Inherited from Monthly Settings)</span>
              </div>
              {beritaAcaraStatus?.witness_rejection_notes && (
                <div className="alert alert-danger py-2 px-3 small mt-2 mb-0">
                  <strong>Rejection Note:</strong> {beritaAcaraStatus.witness_rejection_notes}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
