import { getTranslations } from 'next-intl/server';

const icons = [
  // Transcription
  <svg key="mic" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>,
  // Summary
  <svg key="doc" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>,
  // Action items
  <svg key="check" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>,
  // Email
  <svg key="mail" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
];

export async function Features() {
  const t = await getTranslations('landing');

  const features = [
    { key: 'feature_transcription', icon: icons[0] },
    { key: 'feature_summary', icon: icons[1] },
    { key: 'feature_actions', icon: icons[2] },
    { key: 'feature_email', icon: icons[3] },
  ] as const;

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-50 text-center mb-4">
          {t('features_title')}
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
          {t('features_subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ key, icon }) => (
            <div
              key={key}
              className="p-6 rounded-2xl bg-obsidian-800/60 backdrop-blur-xl border border-white/[0.06] hover:border-phosphor/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-phosphor/10 border border-phosphor/20 flex items-center justify-center text-phosphor mb-4">
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                {t(`${key}_title` as 'feature_transcription_title')}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t(`${key}_desc` as 'feature_transcription_desc')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
