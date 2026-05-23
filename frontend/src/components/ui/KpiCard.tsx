import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta: number;
  deltaLabel: string;
  sparklineData?: { value: number }[];
  breakdown?: { name: string; value: number; fill: string }[] | null;
  color: string;
  isInverse?: boolean;
  className?: string;
  alignPopover?: 'left' | 'right';
}

export const KpiCard = ({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  sparklineData,
  breakdown,
  color,
  isInverse = false,
  className,
  alignPopover = 'right',
}: Props) => {
  const isImprovement = isInverse ? delta < 0 : delta > 0;
  const gradientId = `grad-${label.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      role="figure"
      tabIndex={0}
      aria-label={`${label}: ${value}`}
      className={cn(
        'relative rounded-[var(--radius-lg)] border border-[var(--border)] p-4 flex flex-col gap-1',
        'shadow-[var(--shadow-card)] transition-all duration-200 group overflow-hidden h-[158px]',
        'hover:border-[var(--border-hover)] hover:shadow-lg focus-visible:border-[var(--border-focus)]',
        'bg-[var(--bg-card)]',
        className
      )}
    >
      {/* Gradient left accent strip */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }}
      />

      {/* Icon + Label row */}
      <div className="flex items-center gap-2 pl-1 mb-1.5">
        <div
          className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
          style={{ background: `${color}18`, color }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.13em] truncate">
          {label}
        </span>
      </div>

      {/* Value */}
      <div
        key={String(value)}
        className="pl-1 text-[24px] font-bold text-[var(--text-primary)] leading-none mono-value flex-1 animate-fade-in"
        style={{ animationDuration: '0.3s' }}
      >
        {value}
      </div>

      {/* Delta + Sparkline */}
      <div className="mt-auto space-y-1.5 pl-1">
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] font-semibold',
            isImprovement ? 'text-[var(--accent-teal)]' : 'text-[var(--accent-red)]'
          )}
        >
          {isImprovement
            ? <ArrowUp className="w-3 h-3 shrink-0" />
            : <ArrowDown className="w-3 h-3 shrink-0" />
          }
          <span>
            {Math.abs(delta)}%
            <span className="text-[var(--text-muted)] font-normal ml-1">{deltaLabel}</span>
          </span>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-9 w-full opacity-55 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Breakdown popover on hover */}
      {breakdown && breakdown.length > 0 && (
        <div
          className={cn(
            'absolute top-0 z-50 bg-[var(--bg-sidebar)] border border-[var(--border)] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] w-52 transition-all duration-150 opacity-0 group-hover:opacity-100 pointer-events-none',
            alignPopover === 'left'
              ? 'right-full mr-3 translate-x-[6px] group-hover:translate-x-0'
              : 'left-full ml-3 translate-x-[-6px] group-hover:translate-x-0'
          )}
        >
          <h4 className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 pb-2 border-b border-[var(--border)]">
            Breakdown
          </h4>
          <div className="space-y-2">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.fill }} />
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium truncate">{item.name}</span>
                </div>
                <span className="text-[10px] text-[var(--text-primary)] mono-value shrink-0">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
