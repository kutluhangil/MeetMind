'use client';

import { LocaleSwitcher } from '@/components/layout/locale-switcher';

export function Header() {
  return (
    <header className="sticky top-0 h-14 bg-obsidian-900/80 backdrop-blur-xl border-b border-obsidian-700 flex items-center justify-between px-6 z-30">
      <div className="flex items-center gap-2">
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
