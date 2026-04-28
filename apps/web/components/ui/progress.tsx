import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'phosphor';
}

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = 'phosphor',
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1.5 rounded-full bg-obsidian-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variant === 'phosphor' ? 'bg-phosphor shadow-phosphor' : 'bg-slate-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-slate-500 text-right">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
