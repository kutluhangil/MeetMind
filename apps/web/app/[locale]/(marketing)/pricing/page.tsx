import { getTranslations } from 'next-intl/server';
import { PricingTable } from '@/components/marketing/pricing-table';

export default async function PricingPage() {
  const t = await getTranslations('pricing');
  return (
    <main className="min-h-screen bg-obsidian-950 bg-grid bg-noise py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-100">
            {t('monthly')} / {t('yearly')}
          </h1>
        </div>
        <PricingTable />
      </div>
    </main>
  );
}
