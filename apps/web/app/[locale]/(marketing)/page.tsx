import { useTranslations } from 'next-intl';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-obsidian-950 bg-grid bg-noise">
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="absolute inset-0 bg-glow-phosphor pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-phosphor/10 border border-phosphor/20 text-phosphor text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-phosphor animate-pulse" />
            AI Meeting Intelligence
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-bold text-slate-100 leading-tight">
            Toplantılarını{' '}
            <span className="text-phosphor">akıllı</span>
            {' '}hale getir
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Toplantıyı yükle veya kaydet → AI transkript çıkarsın → kararları özetlesin → aksiyon maddelerini kişilere atasın → takip e-postası göndersin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/tr/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-phosphor text-obsidian-950 font-semibold hover:bg-phosphor-glow transition-colors shadow-phosphor"
            >
              Ücretsiz Başla
            </a>
            <a
              href="/tr/pricing"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-obsidian-700 text-slate-200 border border-obsidian-500 hover:border-obsidian-400 hover:bg-obsidian-600 transition-colors"
            >
              Planları Gör
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
