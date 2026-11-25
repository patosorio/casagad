import { addDays } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { STAY_TIMEZONE } from "./index";

const MAX_STAY_NIGHTS = 800;

export class StayDateError extends Error {
  constructor(message = "Invalid stay date.") {
    super(message);
    this.name = "StayDateError";
  }
}

/** Calendar date in Europe/Rome. Check-out is exclusive: the night of checkOut is not a stay night. */
export function parseStayDate(value: string): TZDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const year = match?.[1];
  const month = match?.[2];
  const day = match?.[3];
  if (year === undefined || month === undefined || day === undefined) {
    throw new StayDateError();
  }
  const date = dateInRome(Number(year), Number(month) - 1, Number(day));
  if (formatStayDate(date) !== value) throw new StayDateError();
  return date;
}

export function formatStayDate(date: Date): string {
  const zoned = date instanceof TZDate ? date : new TZDate(date.getTime(), STAY_TIMEZONE);
  const year = zoned.getFullYear();
  const month = String(zoned.getMonth() + 1).padStart(2, "0");
  const day = String(zoned.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addStayDays(value: string, days: number): string {
  if (!Number.isInteger(days)) throw new StayDateError();
  let cursor = parseStayDate(value);
  const step = days < 0 ? -1 : 1;
  for (let i = 0; i < Math.abs(days); i += 1) {
    cursor = stepStayDay(cursor, step);
  }
  return formatStayDate(cursor);
}

/**
 * Nights in [checkIn, checkOut). checkOut is not included.
 * Steps calendar days in Europe/Rome, including across DST.
 */
export function rangeToNights(checkIn: string, checkOut: string): string[] {
  const start = parseStayDate(checkIn);
  parseStayDate(checkOut);
  const nights: string[] = [];
  let cursor = start;
  for (let i = 0; i < MAX_STAY_NIGHTS; i += 1) {
    const day = formatStayDate(cursor);
    if (day >= checkOut) return nights;
    nights.push(day);
    const next = stepStayDay(cursor, 1);
    if (formatStayDate(next) <= day) throw new StayDateError("Stay date did not advance.");
    cursor = next;
  }
  throw new StayDateError("Stay range is too long.");
}

function stepStayDay(date: TZDate, amount: number): TZDate {
  const viaDateFns: Date = addDays(date, amount);
  const civil = dateInRome(date.getFullYear(), date.getMonth(), date.getDate() + amount);
  const zoned = viaDateFns instanceof TZDate ? viaDateFns : new TZDate(viaDateFns.getTime(), STAY_TIMEZONE);
  return formatStayDate(zoned) === formatStayDate(civil) ? zoned : civil;
}

/** Noon UTC is the same calendar date in Europe/Rome (UTC+1 / UTC+2). Invalid days roll over and fail the caller's check. */
function dateInRome(year: number, monthIndex: number, day: number): TZDate {
  return new TZDate(Date.UTC(year, monthIndex, day, 12, 0, 0), STAY_TIMEZONE);
}
