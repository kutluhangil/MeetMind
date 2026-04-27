import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pending' | 'processing' | 'completed' | 'failed';
  pulse?: boolean;
}

export function Badge({ variant = 'default', pulse, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
        {
          default:    'bg-obsidian-600 text-slate-300',
          pending:    'bg-status-pending/10 text-status-pending',
          processing: 'bg-status-processing/10 text-status-processing',
          completed:  'bg-status-completed/10 text-status-completed',
          failed:     'bg-status-failed/10 text-status-failed',
        }[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}
