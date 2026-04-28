import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';

export async function Hero() {
  const t = await getTranslations('landing');

  return (
    <section className="relative overflow-hidden pt-24 pb-20 px-6">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid bg-obsidian-950 opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-glow-phosphor opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-phosphor/10 border border-phosphor/20 text-phosphor text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-phosphor animate-pulse-slow" />
          {t('badge')}
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-50 leading-tight tracking-tight mb-6">
          {t('headline')}
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          {t('subheadline')}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-phosphor text-obsidian-950 font-semibold hover:bg-phosphor-glow transition-colors shadow-lg shadow-phosphor/30"
          >
            {t('cta_primary')}
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-obsidian-700 text-slate-200 border border-obsidian-500 hover:border-obsidian-400 transition-colors"
          >
            {t('cta_secondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
