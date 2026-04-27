import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm text-slate-300 font-medium">{label}</label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 rounded-xl bg-obsidian-800 border border-obsidian-600',
          'text-slate-100 placeholder:text-slate-500 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-phosphor/40 focus:border-phosphor/40',
          'transition-all duration-200',
          error && 'border-status-failed focus:ring-status-failed/40',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-status-failed">{error}</p>}
    </div>
  );
}
