import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, Hammer, Building2, Menu, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: '', path: '/' },
    { name: 'Materials', icon: Hammer, page: 'Materials', path: '/Materials' },
    { name: 'Flats & Notes', icon: Building2, page: 'Flats', path: '/Flats' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '')) return true;
    if (path !== '/' && location.pathname.toLowerCase().startsWith(path.toLowerCase())) return true;
    return false;
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-orange-500 p-2 rounded-lg">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">SiteManager</h1>
          <p className="text-xs text-slate-400">Construction Pro</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={createPageUrl(item.page)}
            onClick={() => setIsOpen(false)}
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.path) 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-medium' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}>
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Project Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Active Site</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 w-full z-40 bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-md">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">SiteManager</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-slate-800 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pt-20 md:pt-0 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

