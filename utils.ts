/**
 * Creates a URL for a page route
 * @param page - The page name (e.g., 'Dashboard', 'Materials', 'Flats')
 * @returns The URL path for the page
 */
export function createPageUrl(page: string): string {
  if (!page || page === 'Dashboard') {
    return '/';
  }
  return `/${page.toLowerCase()}`;
}
