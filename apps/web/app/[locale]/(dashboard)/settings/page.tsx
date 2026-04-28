import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { Card } from '@/components/ui/card';

export default async function SettingsPage() {
  const t = await getTranslations('settings');

  const sections = [
    {
      href: '/settings/profile' as const,
      title: t('profile.title'),
      desc: t('profile.desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      href: '/settings/billing' as const,
      title: t('billing.title'),
      desc: t('billing.desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">{t('title')}</h1>

      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="p-4 flex items-center gap-4 cursor-pointer hover:border-obsidian-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-obsidian-700 flex items-center justify-center text-slate-400 shrink-0">
                {section.icon}
              </div>
              <div>
                <p className="font-medium text-slate-200">{section.title}</p>
                <p className="text-sm text-slate-500">{section.desc}</p>
              </div>
              <svg className="w-4 h-4 text-slate-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
