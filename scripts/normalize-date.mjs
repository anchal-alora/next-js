const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_LOWER = MONTHS.map((m) => m.toLowerCase());

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isValidYear(year) {
  return Number.isInteger(year) && year >= 1900 && year <= 2100;
}

function isValidMonth(month) {
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

function isValidDay(year, month, day) {
  if (!Number.isInteger(day) || day < 1) return false;
  if (!isValidYear(year) || !isValidMonth(month)) return false;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= lastDay;
}

function monthFromToken(token) {
  const t = String(token).trim().toLowerCase();
  if (!t) return null;
  const exact = MONTHS_LOWER.indexOf(t);
  if (exact !== -1) return { month: exact + 1, monthName: MONTHS[exact] };

  const prefix = t.slice(0, 3);
  const prefixIndex = MONTHS_LOWER.findIndex((m) => m.startsWith(prefix));
  if (prefixIndex !== -1) return { month: prefixIndex + 1, monthName: MONTHS[prefixIndex] };

  return null;
}

function applyTwoDigitYearPivot(twoDigitYear) {
  const yy = Number(twoDigitYear);
  if (!Number.isInteger(yy) || yy < 0 || yy > 99) return null;
  return yy <= 68 ? 2000 + yy : 1900 + yy;
}

function excelSerialToIsoDate(serial) {
  const n = Number(serial);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;

  // Excel 1900 date system:
  // - day 1 is 1900-01-01
  // - Excel incorrectly treats 1900 as a leap year, so serials >= 60 are off by +1 day
  const excelEpoch = Date.UTC(1899, 11, 31);
  const days = n >= 60 ? n - 1 : n;
  const ms = excelEpoch + days * 24 * 60 * 60 * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  if (!isValidYear(year) || !isValidMonth(month) || !isValidDay(year, month, day)) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * normalizeDate(input)
 *
 * Tolerant parsing for date-like inputs coming from CSV/Sheets exports.
 * Never throws; returns warnings for ambiguous inputs.
 *
 * Output policy:
 * - displayDate: "Month YYYY" when month+year known, "YYYY" for year-only, "Qn YYYY" for quarter, else raw string
 * - sortDate: ISO "YYYY-MM-DD" (month-year -> first of month; year-only -> Jan 1; quarter -> quarter start)
 * - dateRaw: exact raw string (String(input ?? ""))
 */
export function normalizeDate(input) {
  const dateRaw = input === undefined || input === null ? "" : String(input);
  const raw = dateRaw;
  const warnings = [];

  const s = raw.trim();
  if (!s) {
    warnings.push("Missing date value.");
    return { dateRaw, displayDate: "", sortDate: "", warnings };
  }

  // Detect ambiguous slash dates early (e.g., 01/03/2026).
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
    warnings.push(
      `Ambiguous slash date "${s}" (could be DD/MM/YYYY or MM/DD/YYYY). Use ISO "YYYY-MM-DD" to avoid ambiguity.`,
    );
    return { dateRaw, displayDate: raw, sortDate: "", warnings };
  }

  const normalized = s.replace(/,/g, "").replace(/\s+/g, " ");

  // ISO full date: YYYY-MM-DD
  {
    const m = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) {
      const year = Number(m[1]);
      const month = Number(m[2]);
      const day = Number(m[3]);
      if (!isValidDay(year, month, day)) {
        warnings.push(`Invalid ISO date "${s}".`);
        return { dateRaw, displayDate: raw, sortDate: "", warnings };
      }

      const sortDate = `${year}-${pad2(month)}-${pad2(day)}`;
      const displayDate = `${MONTHS[month - 1]} ${year}`;
      if (day !== 1) {
        warnings.push(`Day component ignored for displayDate; using "${displayDate}".`);
      }
      return { dateRaw, displayDate, sortDate, warnings };
    }
  }

  // ISO month: YYYY-MM
  {
    const m = normalized.match(/^(\d{4})-(\d{1,2})$/);
    if (m) {
      const year = Number(m[1]);
      const month = Number(m[2]);
      if (!isValidYear(year) || !isValidMonth(month)) {
        warnings.push(`Invalid ISO year-month "${s}".`);
        return { dateRaw, displayDate: raw, sortDate: "", warnings };
      }

      return {
        dateRaw,
        displayDate: `${MONTHS[month - 1]} ${year}`,
        sortDate: `${year}-${pad2(month)}-01`,
        warnings,
      };
    }
  }

  // Quarter: Q1 2026 / 2026 Q1 / Q1-2026 / 2026-Q1
  {
    const m = normalized.match(/^(?:Q([1-4])[\s-]*(\d{4})|(\d{4})[\s-]*Q([1-4]))$/i);
    if (m) {
      const quarter = Number(m[1] ?? m[4]);
      const year = Number(m[2] ?? m[3]);
      if (!isValidYear(year) || !Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
        warnings.push(`Invalid quarter date "${s}".`);
        return { dateRaw, displayDate: raw, sortDate: "", warnings };
      }

      const startMonth = (quarter - 1) * 3 + 1;
      return {
        dateRaw,
        displayDate: `Q${quarter} ${year}`,
        sortDate: `${year}-${pad2(startMonth)}-01`,
        warnings,
      };
    }
  }

  // D-MMM-YY / DD-MMM-YY: "1-Mar-26", "26-Mar-26"
  {
    const m = normalized.match(/^(\d{1,2})-([A-Za-z]+)-(\d{2})$/);
    if (m) {
      const day = Number(m[1]);
      const monthToken = m[2];
      const yy = m[3];
      const monthInfo = monthFromToken(monthToken);
      const year = applyTwoDigitYearPivot(yy);
      if (!monthInfo || year === null || !isValidDay(year, monthInfo.month, day)) {
        warnings.push(`Unrecognized date "${s}".`);
        return { dateRaw, displayDate: raw, sortDate: "", warnings };
      }

      const sortDate = `${year}-${pad2(monthInfo.month)}-${pad2(day)}`;
      const displayDate = `${monthInfo.monthName} ${year}`;
      warnings.push(
        `Two-digit year "${yy}" interpreted as ${year} (pivot: 00–68 => 2000–2068, 69–99 => 1969–1999).`,
      );
      warnings.push(`Day component ignored for displayDate; using "${displayDate}".`);
      return { dateRaw, displayDate, sortDate, warnings };
    }
  }

  // Month name + year: "March 2026", "Mar 2026", "Mar-2026"
  {
    const m = normalized.match(/^([A-Za-z]+)[\s-]+(\d{4})$/);
    if (m) {
      const monthToken = m[1];
      const year = Number(m[2]);
      const monthInfo = monthFromToken(monthToken);
      if (!monthInfo || !isValidYear(year)) {
        warnings.push(`Unrecognized month-year date "${s}".`);
        return { dateRaw, displayDate: raw, sortDate: "", warnings };
      }
      return {
        dateRaw,
        displayDate: `${monthInfo.monthName} ${year}`,
        sortDate: `${year}-${pad2(monthInfo.month)}-01`,
        warnings,
      };
    }
  }

  // Excel MMM-YY: "Mar-26", "Sep-24" (also accept "Mar 26")
  {
    const m = normalized.match(/^([A-Za-z]+)[\s-]+(\d{2})$/);
    if (m) {
      const monthToken = m[1];
      const yy = m[2];
      const monthInfo = monthFromToken(monthToken);
      const year = applyTwoDigitYearPivot(yy);
      if (!monthInfo || year === null || !isValidYear(year)) {
        warnings.push(`Unrecognized month-year date "${s}".`);
        return { dateRaw, displayDate: raw, sortDate: "", warnings };
      }
      warnings.push(
        `Two-digit year "${yy}" interpreted as ${year} (pivot: 00–68 => 2000–2068, 69–99 => 1969–1999).`,
      );
      return {
        dateRaw,
        displayDate: `${monthInfo.monthName} ${year}`,
        sortDate: `${year}-${pad2(monthInfo.month)}-01`,
        warnings,
      };
    }
  }

  // Year-only: "2026"
  {
    const m = normalized.match(/^(\d{4})$/);
    if (m) {
      const year = Number(m[1]);
      if (!isValidYear(year)) {
        warnings.push(`Invalid year "${s}".`);
        return { dateRaw, displayDate: raw, sortDate: "", warnings };
      }
      return {
        dateRaw,
        displayDate: String(year),
        sortDate: `${year}-01-01`,
        warnings,
      };
    }
  }

  // Excel serial date number
  {
    if (/^\d{3,6}$/.test(normalized)) {
      const serial = Number(normalized);
      const iso = excelSerialToIsoDate(serial);
      if (iso) {
        const [year, month] = iso.split("-").map(Number);
        return {
          dateRaw,
          displayDate: `${MONTHS[month - 1]} ${year}`,
          sortDate: iso,
          warnings: [...warnings, `Excel serial ${serial} interpreted as ${iso}.`],
        };
      }
    }
  }

  // Last resort: JS Date parsing
  {
    const d = new Date(normalized);
    if (!Number.isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      if (isValidDay(year, month, day)) {
        const sortDate = `${year}-${pad2(month)}-${pad2(day)}`;
        return {
          dateRaw,
          displayDate: `${MONTHS[month - 1]} ${year}`,
          sortDate,
          warnings: [...warnings, `Parsed with JS Date; prefer ISO for stability.`],
        };
      }
    }
  }

  warnings.push(`Unrecognized date format "${s}".`);
  return { dateRaw, displayDate: raw, sortDate: "", warnings };
}

