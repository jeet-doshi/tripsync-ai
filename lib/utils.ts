export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** "Riya  Shah " → "Riya Shah" */
export function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function nameKey(name: string) {
  return cleanName(name).toLowerCase();
}

/** Parse a YYYY-MM-DD date as UTC midnight so timezones never shift the day. */
export function parseDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function formatDay(day: string, opts: { year?: boolean } = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(opts.year ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(parseDay(day)));
}

export function formatDateRange(start: string, end: string) {
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${formatDay(start, { year: !sameYear })} – ${formatDay(end, { year: true })}`;
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function daysBetweenInclusive(start: string, end: string) {
  return Math.round((parseDay(end) - parseDay(start)) / 86_400_000) + 1;
}

export type FitLevel = "great" | "good" | "stretch";

export function fitLevel(fit: number): FitLevel {
  if (fit >= 75) return "great";
  if (fit >= 55) return "good";
  return "stretch";
}

export const FIT_STYLES: Record<FitLevel, { bar: string; badge: string; label: string; text: string }> = {
  great: { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", label: "Great fit", text: "text-emerald-700" },
  good: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-amber-600/20", label: "Good fit", text: "text-amber-700" },
  stretch: { bar: "bg-rose-500", badge: "bg-rose-50 text-rose-700 ring-rose-600/20", label: "Compromise", text: "text-rose-700" },
};

export function initials(name: string) {
  const parts = cleanName(name).split(" ");
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
