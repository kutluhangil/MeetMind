import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg',
        'bg-gradient-to-r from-obsidian-700 via-obsidian-600 to-obsidian-700',
        'bg-[length:200%_100%]',
        className
      )}
      {...props}
    />
  );
}
