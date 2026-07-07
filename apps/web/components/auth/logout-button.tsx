'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { signOutAction } from '@/app/actions/auth';

export function LogoutButton() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const localeMatch = pathname.match(/^\/(tr|en)/);
  const locale = localeMatch?.[1] ?? 'tr';

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction(locale);
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center w-full gap-3 px-3 py-2 mt-1 rounded-lg text-sm transition-all duration-150 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {isPending ? t('loggingOut') : t('logout')}
    </button>
  );
}
