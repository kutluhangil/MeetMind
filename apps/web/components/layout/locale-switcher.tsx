'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, locales } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 bg-obsidian-800 rounded-lg border border-obsidian-600 p-0.5">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => router.replace(pathname, { locale: loc })}
          className={cn(
            'px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wide transition-all duration-150',
            locale === loc
              ? 'bg-obsidian-600 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
