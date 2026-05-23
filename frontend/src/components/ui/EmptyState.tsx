import { type LucideIcon, Inbox, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

interface Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** onClick-based CTA (existing behavior) */
  action?: { label: string; onClick: () => void };
  /** Link-based CTA — renders a react-router <Link> */
  ctaTo?: string;
  ctaLabel?: string;
  className?: string;
  /** Renders a smaller, inline version without the dashed border box */
  compact?: boolean;
}

export const EmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
  ctaTo,
  ctaLabel = 'Upload Files',
  className,
  compact = false,
}: Props) => {
  if (compact) {
    return (
      <div className={cn('flex flex-col items-center justify-center text-center py-8 gap-2', className)}>
        <div
          className="flex items-center justify-center rounded-full mb-1"
          style={{
            width: 36,
            height: 36,
            background: 'rgba(108,99,255,0.08)',
            border: '1px solid rgba(108,99,255,0.18)',
          }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
        </div>
        <p className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        {description && (
          <p className="text-[11px] max-w-[220px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
        {ctaTo && (
          <Link
            to={ctaTo}
            className="btn btn-primary mt-1"
            style={{ fontSize: 10, padding: '4px 12px' }}
          >
            <UploadCloud className="w-3 h-3" />
            {ctaLabel}
          </Link>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="btn btn-secondary mt-1"
            style={{ fontSize: 10, padding: '4px 12px' }}
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl',
        className
      )}
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full mb-6"
        style={{
          width: 64,
          height: 64,
          background: 'rgba(108,99,255,0.08)',
          border: '1px solid rgba(108,99,255,0.18)',
        }}
      >
        <Icon className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-xs mx-auto mb-8 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      )}
      {ctaTo && (
        <Link
          to={ctaTo}
          className="btn btn-primary"
          style={{ fontSize: 12, padding: '8px 20px' }}
        >
          <UploadCloud className="w-4 h-4" />
          {ctaLabel}
        </Link>
      )}
      {action && !ctaTo && (
        <button
          onClick={action.onClick}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2 rounded-xl transition-all border border-white/10"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
