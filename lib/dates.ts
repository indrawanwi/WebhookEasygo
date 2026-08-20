import { format, parseISO, isValid } from 'date-fns';

/**
 * Checks if a date string is invalid or a placeholder like "0001-01-01..."
 */
export function isInvalidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true;
  const clean = dateStr.trim();
  if (clean.startsWith('0001-01-01') || clean.startsWith('0000-00-00') || clean === '' || clean === 'null') {
    return true;
  }
  return false;
}

/**
 * Safely format an ISO datetime string.
 * Example return: "20 Oct 2019, 14:10:10"
 * Returns fallback ("—" or custom) for invalid placeholders.
 */
export function formatDate(
  dateStr: string | null | undefined,
  fallback = '—',
  pattern = 'dd MMM yyyy, HH:mm:ss'
): string {
  if (isInvalidDate(dateStr)) {
    return fallback;
  }
  try {
    const parsed = parseISO(dateStr!);
    if (!isValid(parsed)) {
      return fallback;
    }
    return format(parsed, pattern);
  } catch {
    return fallback;
  }
}

/**
 * Format relative time or short time for live stream (HH:mm:ss)
 */
export function formatTimeOnly(dateStr: string | null | undefined, fallback = '—'): string {
  return formatDate(dateStr, fallback, 'HH:mm:ss');
}

/**
 * Format date only (20 Oct 2019)
 */
export function formatDateOnly(dateStr: string | null | undefined, fallback = '—'): string {
  return formatDate(dateStr, fallback, 'dd MMM yyyy');
}
