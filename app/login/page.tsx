import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { auth, enabledProviders, signIn, signOut } from '@/auth';
import { getAdminEmails, isAllowedEmail } from '@/lib/access';
import AuthCard from '@/components/AuthCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata = { title: 'Sign in · SiteManager' };

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "That account doesn't have access. Ask the site admin to add your email.",
  Verification: 'That sign-in link is invalid or has expired. Request a new one below.',
  Configuration: 'Sign-in is not configured correctly. Check the server environment variables.',
};

// Keep only the path (middleware sends an absolute URL) so the login page
// can never redirect to another site
function safeCallback(url?: string) {
  if (!url) return '/';
  try {
    const { pathname, search } = new URL(url, 'http://localhost');
    return pathname.startsWith('//') ? '/' : pathname + search;
  } catch {
    return '/';
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  const callbackUrl = safeCallback(searchParams.callbackUrl);
  const session = await auth();
  if (await isAllowedEmail(session?.user?.email)) redirect(callbackUrl);
  // Signed in, but not (or no longer) on the access list
  const deniedEmail = session?.user?.email ?? null;

  // Catch missing config here instead of failing later with a cryptic error
  const configProblems = [
    !process.env.AUTH_SECRET && 'AUTH_SECRET',
    getAdminEmails().length === 0 && 'ADMIN_EMAILS',
    !enabledProviders.google && !enabledProviders.email && 'a sign-in method (AUTH_GOOGLE_ID/SECRET or EMAIL_SERVER/EMAIL_FROM)',
  ].filter(Boolean);

  const error = configProblems.length
    ? `Sign-in is not configured: set ${configProblems.join(', ')} in the environment and restart the server.`
    : deniedEmail
      ? `${deniedEmail} doesn't have access. Ask the site admin to add your email.`
      : searchParams.error
        ? ERROR_MESSAGES[searchParams.error] ?? 'Sign-in failed. Please try again.'
        : null;

  // Clear a denied session first so the person can sign in as someone else, and
  // turn Auth.js errors (e.g. AccessDenied for an unlisted email) into a message
  // on this page. Redirects are thrown as non-AuthErrors and pass through.
  const startSignIn = async (provider: string, options: Record<string, string>) => {
    'use server';
    if (deniedEmail) await signOut({ redirect: false });
    try {
      if (provider === 'nodemailer') {
        // Send the link without Auth.js's own redirect so the address bar shows our page
        await signIn(provider, { ...options, redirectTo: callbackUrl, redirect: false });
      } else {
        await signIn(provider, { ...options, redirectTo: callbackUrl });
      }
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/login?error=${error.type}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
      throw error;
    }
    redirect('/login/check-email');
  };

  return (
    <AuthCard subtitle="Sign in to continue">
      {error && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      {enabledProviders.email && (
        <form
          className="space-y-3"
          action={async (formData: FormData) => {
            'use server';
            await startSignIn('nodemailer', { email: String(formData.get('email') ?? '') });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white">
            Email me a sign-in link
          </Button>
        </form>
      )}

      {enabledProviders.email && enabledProviders.google && (
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" /> or <div className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      {enabledProviders.google && (
        <form
          action={async () => {
            'use server';
            await startSignIn('google', {});
          }}
        >
          <Button type="submit" variant="outline" className="w-full h-11 gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continue with Google
          </Button>
        </form>
      )}

      <p className="text-xs text-center text-slate-400">Access is limited to approved team members.</p>
    </AuthCard>
  );
}
