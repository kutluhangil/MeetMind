'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',           label: 'Dashboard' },
  { href: '/meetings',            label: 'Toplantılar' },
  { href: '/team',                label: 'Takım' },
  { href: '/settings',            label: 'Ayarlar' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-obsidian-900 border-r border-obsidian-700 flex flex-col z-40">
      <div className="p-4 border-b border-obsidian-700 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-phosphor/10 border border-phosphor/20 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-phosphor" />
        </div>
        <span className="font-display text-base font-semibold text-slate-100">MeetMind</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={`/tr${item.href}`}
              className={cn(
                'flex items-center px-3 py-2 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'bg-phosphor/10 text-phosphor border border-phosphor/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-obsidian-700'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-obsidian-700">
        <div className="px-3 py-2 rounded-xl bg-obsidian-800 border border-obsidian-600">
          <p className="text-xs text-slate-500">Plan</p>
          <p className="text-sm font-medium text-slate-300">Ücretsiz</p>
        </div>
      </div>
    </aside>
  );
}
