import { create } from "zustand";

export interface TimesheetState {
  month: number;
  year: number;
  page: number;
  limit: number;
  setPeriod: (month: number, year: number) => void;
  setPagination: (page: number, limit: number) => void;
  resetPagination: () => void;
}

export const useTimesheetStore = create<TimesheetState>((set) => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  page: 1,
  limit: 10,
  setPeriod: (month, year) => set({ month, year, page: 1 }),
  setPagination: (page, limit) => set({ page, limit }),
  resetPagination: () => set({ page: 1 }),
}));
