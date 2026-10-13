/**
 * Creates a URL for a page route
 * @param page - The page name (e.g., 'Dashboard', 'Materials', 'Flats')
 * @returns The URL path for the page
 */
export function createPageUrl(page: string): string {
  if (!page || page === 'Dashboard') {
    return '/';
  }
  return `/${page}`;
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

