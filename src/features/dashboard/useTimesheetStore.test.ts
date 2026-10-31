import { describe, it, expect, beforeEach } from "bun:test";
import { useTimesheetStore } from "./useTimesheetStore";

describe("useTimesheetStore", () => {
  beforeEach(() => {
    useTimesheetStore.setState({
      month: 10,
      year: 2026,
      page: 1,
      limit: 10,
    });
  });

  it("initializes with default values", () => {
    const state = useTimesheetStore.getState();
    expect(state.page).toBe(1);
    expect(state.limit).toBe(10);
    expect(state.month).toBe(10);
    expect(state.year).toBe(2026);
  });

  it("sets period and resets page to 1", () => {
    useTimesheetStore.getState().setPagination(3, 25);
    expect(useTimesheetStore.getState().page).toBe(3);

    useTimesheetStore.getState().setPeriod(11, 2026);
    const updated = useTimesheetStore.getState();
    expect(updated.month).toBe(11);
    expect(updated.year).toBe(2026);
    expect(updated.page).toBe(1);
  });

  it("updates pagination correctly", () => {
    useTimesheetStore.getState().setPagination(2, 50);
    const updated = useTimesheetStore.getState();
    expect(updated.page).toBe(2);
    expect(updated.limit).toBe(50);
  });

  it("resets page pagination to 1 while keeping limit", () => {
    useTimesheetStore.getState().setPagination(4, 50);
    useTimesheetStore.getState().resetPagination();
    const updated = useTimesheetStore.getState();
    expect(updated.page).toBe(1);
    expect(updated.limit).toBe(50);
  });
});
