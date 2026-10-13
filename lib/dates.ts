import { COMPANY_TIMEZONE } from "@/lib/config";

const dateTimeFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: COMPANY_TIMEZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const timeFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: COMPANY_TIMEZONE,
  timeStyle: "short",
});

// en-CA formats dates as YYYY-MM-DD.
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: COMPANY_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const calendarDateFormat = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
});

export function formatDateTime(date: Date) {
  return dateTimeFormat.format(date);
}

export function formatTime(date: Date) {
  return timeFormat.format(date);
}

// The YYYY-MM-DD day a timestamp falls on in company time.
export function companyDayKey(date: Date) {
  return dayKeyFormat.format(date);
}

export function todayInCompanyTimezone() {
  return companyDayKey(new Date());
}

// Formats a YYYY-MM-DD calendar date. It has no time of day, so there is no
// timezone to convert from.
export function formatCalendarDate(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return calendarDateFormat.format(new Date(year, month - 1, date));
}
