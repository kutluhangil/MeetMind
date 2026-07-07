import { MarketingHeader } from '@/components/layout/marketing-header';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col">
      <MarketingHeader />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
