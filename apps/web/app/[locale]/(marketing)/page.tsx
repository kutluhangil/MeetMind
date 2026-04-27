import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <main className="min-h-screen bg-obsidian-950 bg-grid bg-noise">
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="absolute inset-0 bg-glow-phosphor pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-phosphor/10 border border-phosphor/20 text-phosphor text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-phosphor animate-pulse" />
            {t('badge')}
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-bold text-slate-100 leading-tight">
            {t('title').split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-phosphor">{t('title').split(' ').at(-1)}</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-phosphor text-obsidian-950 font-semibold hover:bg-phosphor-glow transition-colors shadow-phosphor"
            >
              {t('cta.primary')}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-obsidian-700 text-slate-200 border border-obsidian-500 hover:border-obsidian-400 hover:bg-obsidian-600 transition-colors"
            >
              {t('cta.secondary')}
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-24 px-6">
          <h2 className="text-2xl font-display font-bold text-slate-100 text-center mb-10">
            {t('features.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['transcription', 'summary', 'actions', 'email'] as const).map((key) => (
              <div
                key={key}
                className="bg-obsidian-800/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-glass text-left"
              >
                <p className="text-sm font-semibold text-phosphor mb-1">{t(`features.${key}.title`)}</p>
                <p className="text-sm text-slate-400">{t(`features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
