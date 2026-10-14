import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import AuthCard from '@/components/AuthCard';

export const metadata = { title: 'Check your email · SiteManager' };

export default function CheckEmailPage() {
  return (
    <AuthCard subtitle="Check your email">
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="w-10 h-10 text-orange-500" />
        <p className="text-sm text-slate-600">
          We sent you a sign-in link. Open it on this device to continue. The link expires in 15 minutes.
        </p>
        <p className="text-xs text-slate-400">No email? Check your spam folder.</p>
      </div>
      <Link href="/login" className="block text-center text-sm text-orange-600 hover:underline">
        Back to sign in
      </Link>
    </AuthCard>
  );
}
