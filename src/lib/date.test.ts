import { describe, it, expect } from "bun:test";
import { formatLocalTimestamp, formatLocalDate } from "./date";

describe("date utility", () => {
  it("returns '-' for null, undefined, or empty string", () => {
    expect(formatLocalTimestamp(null)).toBe("-");
    expect(formatLocalTimestamp(undefined)).toBe("-");
    expect(formatLocalTimestamp("")).toBe("-");
    expect(formatLocalDate(null)).toBe("-");
    expect(formatLocalDate(undefined)).toBe("-");
  });

  it("returns '-' for invalid date strings", () => {
    expect(formatLocalTimestamp("not-a-valid-date")).toBe("-");
    expect(formatLocalDate("invalid-date")).toBe("-");
  });

  it("formats valid ISO 8601 timestamps with local time and timezone abbreviation", () => {
    const isoString = "2026-10-24T12:48:00Z";
    const formatted = formatLocalTimestamp(isoString);
    expect(formatted).not.toBe("-");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Oct");
  });

  it("formats valid Date objects", () => {
    const d = new Date(2026, 9, 24, 15, 30);
    const formatted = formatLocalTimestamp(d);
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Oct");
    expect(formatted).toContain("24");
  });

  it("formats date only with formatLocalDate", () => {
    const d = new Date(2026, 9, 24, 15, 30);
    const formatted = formatLocalDate(d);
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Oct");
    expect(formatted).toContain("24");
    // Should not contain colon for time
    expect(formatted).not.toContain(":");
  });
});
