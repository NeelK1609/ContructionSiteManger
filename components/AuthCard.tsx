import { ClipboardList } from 'lucide-react';

/** Centered card shell shared by the sign-in pages */
export default function AuthCard({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-orange-500 p-3 rounded-xl">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SiteManager</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
