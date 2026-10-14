import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <Link href="/" className="text-orange-600 hover:underline">
        Go to dashboard
      </Link>
    </div>
  );
}
