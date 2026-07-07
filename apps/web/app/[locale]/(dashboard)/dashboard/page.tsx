import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { 
  DashboardStatsWrapper, 
  DashboardStatsSkeleton 
} from '@/components/dashboard/dashboard-stats-wrapper';
import { 
  DashboardAnalyticsWrapper, 
  DashboardAnalyticsSkeleton 
} from '@/components/dashboard/dashboard-analytics-wrapper';
import { 
  RecentMeetingsWrapper, 
  RecentMeetingsSkeleton 
} from '@/components/dashboard/recent-meetings-wrapper';

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('dashboard');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100">{t('title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStatsWrapper />
      </Suspense>

      {/* Analytics Charts */}
      <Suspense fallback={<DashboardAnalyticsSkeleton />}>
        <DashboardAnalyticsWrapper locale={params.locale} />
      </Suspense>

      {/* Recent meetings */}
      <Suspense fallback={<RecentMeetingsSkeleton />}>
        <RecentMeetingsWrapper />
      </Suspense>
    </div>
  );
}
