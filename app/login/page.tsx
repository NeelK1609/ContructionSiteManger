import { redirect } from 'next/navigation';
import { auth, isAllowedEmail, signIn, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

export const metadata = { title: 'Sign in · SiteManager' };

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "This Google account doesn't have access. Ask the site admin to add your email.",
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
  if (isAllowedEmail(session?.user?.email)) redirect(callbackUrl);
  // Signed in with an account that isn't on the allowlist
  const deniedEmail = session?.user?.email ?? null;

  // Catch missing config here instead of letting Google show a cryptic error
  const missingEnv = ['AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'ALLOWED_EMAILS'].filter((key) => !process.env[key]?.trim());

  const error = missingEnv.length
    ? `Sign-in is not configured: set ${missingEnv.join(', ')} in .env and restart the server.`
    : deniedEmail
      ? `${deniedEmail} doesn't have access. Ask the site admin to add your email.`
      : searchParams.error
        ? ERROR_MESSAGES[searchParams.error] ?? 'Sign-in failed. Please try again.'
        : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-orange-500 p-3 rounded-xl">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SiteManager</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
          </div>
        </div>

        {error && (
          <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}

        <form
          action={async () => {
            'use server';
            // Clear a denied session first so Google lets the user pick another account
            if (deniedEmail) await signOut({ redirect: false });
            await signIn('google', { redirectTo: callbackUrl });
          }}
        >
          <Button type="submit" variant="outline" className="w-full h-11 gap-3" disabled={missingEnv.length > 0}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            {deniedEmail ? 'Use a different Google account' : 'Continue with Google'}
          </Button>
        </form>

        <p className="text-xs text-center text-slate-400">Access is limited to approved team members.</p>
      </div>
    </div>
  );
}
