export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Son toplantıların ve aksiyon maddelerinin özeti</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {['Toplantılar', 'Aksiyonlar', 'E-postalar', 'Bu Ay'].map((label, i) => (
          <div key={label} className="bg-obsidian-800/60 backdrop-blur-xl border border-white/[0.06] shadow-glass rounded-2xl p-6">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">—</p>
          </div>
        ))}
      </div>

      <div className="bg-obsidian-800/60 backdrop-blur-xl border border-white/[0.06] shadow-glass rounded-2xl p-6">
        <p className="text-sm text-slate-400 text-center py-12">
          Phase 6&apos;da toplantı listesi buraya eklenecek
        </p>
      </div>
    </div>
  );
}
