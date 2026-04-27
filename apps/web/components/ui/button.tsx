'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonOwnProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: React.ReactNode;
};

type ButtonProps = ButtonOwnProps & Omit<HTMLMotionProps<'button'>, keyof ButtonOwnProps>;

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-phosphor/50',
        {
          sm: 'px-3 py-1.5 text-sm',
          md: 'px-4 py-2 text-sm',
          lg: 'px-6 py-3 text-base',
        }[size],
        {
          primary:   'bg-phosphor text-obsidian-950 hover:bg-phosphor-glow shadow-lg shadow-phosphor/30',
          secondary: 'bg-obsidian-700 text-slate-200 border border-obsidian-500 hover:border-obsidian-400 hover:bg-obsidian-600',
          ghost:     'text-slate-400 hover:text-slate-100 hover:bg-obsidian-700',
          danger:    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
        }[variant],
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </motion.button>
  );
}
