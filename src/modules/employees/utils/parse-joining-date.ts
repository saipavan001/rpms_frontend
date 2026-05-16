/**
 * Normalizes joining dates from CSV to ISO (YYYY-MM-DD) for the API.
 * Supports YYYY-MM-DD and DD-MM-YYYY / DD/MM/YYYY.
 */
export const normalizeJoiningDate = (
  value: string
): { iso: string | null; error?: string } => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { iso: null };
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (isValidDateParts(year, month, day)) {
      return { iso: formatIso(year, month, day) };
    }
    return { iso: null, error: `Invalid date "${trimmed}"` };
  }

  const dayFirstMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(trimmed);
  if (dayFirstMatch) {
    const day = Number(dayFirstMatch[1]);
    const month = Number(dayFirstMatch[2]);
    const year = Number(dayFirstMatch[3]);
    if (isValidDateParts(year, month, day)) {
      return { iso: formatIso(year, month, day) };
    }
    return { iso: null, error: `Invalid date "${trimmed}"` };
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      iso: formatIso(
        parsed.getFullYear(),
        parsed.getMonth() + 1,
        parsed.getDate()
      ),
    };
  }

  return {
    iso: null,
    error: `Invalid date "${trimmed}" — use YYYY-MM-DD or DD-MM-YYYY`,
  };
};

const isValidDateParts = (year: number, month: number, day: number): boolean => {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const formatIso = (year: number, month: number, day: number): string => {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};
