import { getTranslations } from 'next-intl/server';

export async function DemoVideo() {
  const t = await getTranslations('landing');

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-50 mb-4">{t('demo_title')}</h2>
        <p className="text-slate-400 mb-10">{t('demo_subtitle')}</p>

        <div className="relative rounded-2xl overflow-hidden border border-obsidian-600 bg-obsidian-900 aspect-video">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-phosphor/20 border-2 border-phosphor flex items-center justify-center cursor-pointer hover:bg-phosphor/30 transition-colors">
              <svg className="w-8 h-8 text-phosphor ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 h-1 bg-obsidian-700 rounded-full">
            <div className="h-full w-0 bg-phosphor rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
