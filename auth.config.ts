import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe part of the auth config, used by middleware. It can't touch the
 * database, so it only checks that a session exists; the allowlist is enforced
 * in the Node runtime (app/(app)/layout.tsx, login page, API).
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/login/check-email',
  },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
