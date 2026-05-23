import { cn } from '@/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export const LoadingSpinner = ({ size = 'md', label, className }: Props) => (
  <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status" aria-live="polite">
    <div
      className={cn(
        sizes[size],
        'rounded-full border-2 border-[var(--border)] border-t-[var(--accent-primary)] animate-spin'
      )}
    />
    {label ? (
      <p className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</p>
    ) : null}
  </div>
);
