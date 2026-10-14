import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { isAllowedEmail } from '@/lib/access';
import { authConfig } from './auth.config';

// Each sign-in method is enabled only when its settings are present
export const enabledProviders = {
  google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  email: !!(process.env.EMAIL_SERVER && process.env.EMAIL_FROM),
};

const providers: Provider[] = [];

if (enabledProviders.google) {
  providers.push(
    Google({
      // Google verifies email ownership, so it's safe to link a Google sign-in
      // to an account that first signed in by magic link with the same email
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (enabledProviders.email) {
  providers.push(
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 15 * 60, // magic links expire after 15 minutes
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    // Runs before a magic link is sent and again on every sign-in, so emails
    // only ever go to approved addresses
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email_verified !== true) return false;
      return isAllowedEmail(user.email ?? profile?.email);
    },
  },
});
