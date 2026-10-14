import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * Only Google accounts listed in ALLOWED_EMAILS (comma-separated) may use the app.
 * Checked at sign-in, and again by app/(app)/layout.tsx, the login page and the
 * API on every request, so removing an email locks that person out on their next
 * page load (after a server restart).
 */
export function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowed = (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    signIn({ profile }) {
      return profile?.email_verified === true && isAllowedEmail(profile.email);
    },
    // Middleware only checks that someone is signed in. The allowlist is enforced in
    // the Node runtime (layout, login page, API) because the Edge middleware can hold
    // stale env values after .env changes, and a mismatch would cause a redirect loop.
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
