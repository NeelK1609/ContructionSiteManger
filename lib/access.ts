import 'server-only';
import { prisma } from './db';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Admins are set in ADMIN_EMAILS (comma-separated) and can manage the team. */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  return !!email && getAdminEmails().includes(normalizeEmail(email));
}

/**
 * Admins plus anyone added on the Team page. Checked on every page load and API
 * call, so removing someone takes effect on their next request.
 */
export async function isAllowedEmail(email?: string | null): Promise<boolean> {
  if (!email) return false;
  if (isAdminEmail(email)) return true;
  const member = await prisma.allowedUser.findUnique({ where: { email: normalizeEmail(email) } });
  return !!member;
}
