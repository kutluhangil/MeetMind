import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'outline';
  glow?: boolean;
}

export function Card({ variant = 'glass', glow, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300',
        {
          glass:   'bg-obsidian-800/60 backdrop-blur-xl border-white/[0.06] shadow-glass',
          solid:   'bg-obsidian-800 border-obsidian-600',
          outline: 'bg-transparent border-obsidian-600 hover:border-obsidian-400',
        }[variant],
        glow && 'shadow-phosphor border-phosphor/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
