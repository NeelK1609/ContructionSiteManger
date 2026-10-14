import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect every page except the login pages and static assets.
  // API routes check the session themselves so they can return 401 JSON instead of a redirect.
  matcher: ['/((?!api|login|_next/static|_next/image|icon.svg|favicon.ico).*)'],
};
