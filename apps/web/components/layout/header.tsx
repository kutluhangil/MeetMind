'use client';

import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { useUiStore } from '@/stores/ui-store';

export function Header() {
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <header className="sticky top-0 h-14 bg-obsidian-900/80 backdrop-blur-xl border-b border-obsidian-700 flex items-center justify-between px-4 md:px-6 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2.5 -ml-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-obsidian-800 transition-colors"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* breadcrumb placeholder */}
      </div>
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <div className="w-8 h-8 rounded-full bg-obsidian-700 border border-obsidian-500 flex items-center justify-center">
          <span className="text-xs text-slate-400">U</span>
        </div>
      </div>
    </header>
  );
}
