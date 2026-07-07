import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <main className="min-h-screen bg-obsidian-950 bg-grid bg-noise">
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 md:px-6 py-12 md:py-0 text-center">
        <div className="absolute inset-0 bg-glow-phosphor pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 mt-16 md:mt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-phosphor/10 border border-phosphor/20 text-phosphor text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-phosphor animate-pulse" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-slate-100 leading-tight">
            {t('title').split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-phosphor">{t('title').split(' ').at(-1)}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            {t('description')}
          </p>
          <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-3 md:gap-4 justify-center pt-4">
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

        {/* App Mockup Visual */}
        <div className="relative z-10 w-full max-w-6xl mx-auto mt-16 md:mt-24 px-4 md:px-6">
          <div className="relative mx-auto rounded-2xl md:rounded-[2rem] border border-white/10 bg-obsidian-900/50 p-2 md:p-4 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-phosphor/10 to-transparent opacity-50" />
            <div className="relative rounded-xl md:rounded-2xl border border-white/5 bg-obsidian-950 overflow-hidden shadow-inner flex flex-col h-[300px] md:h-[500px]">
              {/* Mockup Header */}
              <div className="flex items-center px-4 py-3 border-b border-white/5 bg-obsidian-900/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
                </div>
              </div>
              {/* Mockup Content */}
              <div className="flex-1 flex p-4 md:p-6 gap-6 overflow-hidden">
                {/* Sidebar Mock */}
                <div className="hidden md:flex w-48 flex-col gap-2">
                  <div className="h-4 w-24 bg-slate-800 rounded-md mb-4" />
                  <div className="h-8 w-full bg-phosphor/10 rounded-lg border border-phosphor/20" />
                  <div className="h-8 w-full bg-slate-800/50 rounded-lg" />
                  <div className="h-8 w-full bg-slate-800/50 rounded-lg" />
                </div>
                {/* Main Mock */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="h-8 w-1/3 bg-slate-800 rounded-lg" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2 flex flex-col gap-3">
                      <div className="h-24 w-full bg-slate-800/50 rounded-xl" />
                      <div className="h-24 w-full bg-slate-800/50 rounded-xl" />
                      <div className="h-24 w-full bg-slate-800/50 rounded-xl" />
                    </div>
                    <div className="col-span-1 flex flex-col gap-3">
                      <div className="h-32 w-full bg-phosphor/5 rounded-xl border border-phosphor/10" />
                      <div className="flex-1 w-full bg-slate-800/50 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Features grid */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-16 md:mt-24 px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-display font-bold text-slate-100 text-center mb-8 md:mb-10">
            {t('features.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
