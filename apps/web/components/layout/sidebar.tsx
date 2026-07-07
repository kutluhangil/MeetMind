'use client';

import { useTranslations } from 'next-intl';
import { useUiStore } from '@/stores/ui-store';
import { Nav } from '@/components/layout/nav';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { usePathname } from '@/lib/navigation';

export function Sidebar() {
  const t = useTranslations('nav');
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const pathname = usePathname();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-60 bg-obsidian-900 border-r border-obsidian-700 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-obsidian-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-phosphor/10 border border-phosphor/20 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-phosphor" />
            </div>
            <span className="font-display text-base font-semibold text-slate-100">MeetMind</span>
          </div>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          <Nav />
        </div>

        <div className="p-3 border-t border-obsidian-700">
          <div className="px-3 py-2 rounded-xl bg-obsidian-800 border border-obsidian-600">
            <p className="text-xs text-slate-500">{t('billing')}</p>
            <p className="text-sm font-medium text-slate-300">Free</p>
          </div>
        </div>
      </aside>
    </>
  );
}
