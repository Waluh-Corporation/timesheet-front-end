/**
 * Formats an ISO 8601 timestamp string or Date object using the user's browser local timezone.
 * Example output: "24 Oct 2026, 19:48 WIB" or "24 Oct 2026, 12:48 UTC".
 * If the input is null, undefined, or invalid, returns a safe fallback "-".
 */
export function formatLocalTimestamp(
  dateInput?: string | Date | null,
  options?: { includeTime?: boolean }
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";

  const includeTime = options?.includeTime ?? true;

  if (!includeTime) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  const dateFormatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  let tzName = "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZoneName: "short",
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart?.value) {
      tzName = tzPart.value;
    }
  } catch {
    // Graceful fallback if timeZoneName is unsupported
  }

  return tzName ? `${dateFormatted} ${tzName}` : dateFormatted;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into a human-readable English date.
 * Example output: "24 Oct 2026"
 */
export function formatLocalDate(dateInput?: string | Date | null): string {
  return formatLocalTimestamp(dateInput, { includeTime: false });
}
