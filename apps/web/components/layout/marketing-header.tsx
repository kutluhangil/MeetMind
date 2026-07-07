import { Link } from '@/lib/navigation';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { useTranslations } from 'next-intl';

export function MarketingHeader() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 h-16 bg-obsidian-950/80 backdrop-blur-xl border-b border-obsidian-800 flex items-center justify-between px-4 md:px-6 z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-phosphor flex items-center justify-center shadow-phosphor">
            <svg className="w-5 h-5 text-obsidian-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-slate-100 group-hover:text-phosphor transition-colors">
            MeetMind
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
          >
            {t('auth.links.signIn')}
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-phosphor text-obsidian-950 hover:bg-phosphor-glow transition-all"
          >
            {t('landing.cta_primary')}
          </Link>
        </div>
      </div>
    </header>
  );
}
