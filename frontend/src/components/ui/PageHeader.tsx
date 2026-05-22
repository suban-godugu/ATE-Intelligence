import { cn } from '@/utils';

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: string;
  className?: string;
}

export const PageHeader = ({ title, subtitle, actions, badge, className }: Props) => {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7', className)}>
      {/* Title block with accent bar */}
      <div
        className="space-y-1 accent-bar-left pl-4"
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-[22px] font-bold text-[var(--text-primary)] leading-none"
            style={{ letterSpacing: '-0.025em' }}
          >
            {title}
          </h1>
          {badge && (
            <span className="badge badge-primary">{badge}</span>
          )}
        </div>

        {subtitle && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="status-dot status-dot-live" />
            <span className="text-[12px] text-[var(--text-secondary)] font-medium leading-none">
              {subtitle}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
