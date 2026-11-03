// utils/format.ts
// Formatting helpers. Pure functions – no React Native dependencies.

/**
 * Formats a number as a BDT currency string.
 * e.g. 6000 → "৳ 6,000 / month"
 */
export function formatSalary(amount: number): string {
  const formatted = amount.toLocaleString('en-BD');
  return `৳ ${formatted} / month`;
}

/**
 * Formats an ISO date string or timestamp to "12 Nov 2026".
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns relative time string, e.g. "2 days ago", "just now".
 * Used for "applied X ago" in application cards.
 */
export function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWk = Math.floor(diffDay / 7);
  const diffMo = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWk < 5) return `${diffWk} week${diffWk !== 1 ? 's' : ''} ago`;
  return `${diffMo} month${diffMo !== 1 ? 's' : ''} ago`;
}

/**
 * Truncates a string to maxLength and appends "…" if needed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Returns the user's initials from a full name (up to 2 chars).
 * e.g. "Arif Hassan" → "AH"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
