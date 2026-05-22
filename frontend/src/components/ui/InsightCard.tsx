import { Info, AlertTriangle, AlertCircle, CheckCircle2, LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

type Variant = 'info' | 'warning' | 'error' | 'success';

interface Props {
  variant: Variant;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const CONFIG: Record<Variant, { icon: LucideIcon; color: string }> = {
  info: { icon: Info, color: 'border-ate-cyan' },
  warning: { icon: AlertTriangle, color: 'border-ate-amber' },
  error: { icon: AlertCircle, color: 'border-ate-rose' },
  success: { icon: CheckCircle2, color: 'border-ate-emerald' },
};

export const InsightCard = ({ variant, title, description, action, className }: Props) => {
  const { icon: Icon, color } = CONFIG[variant];

  return (
    <div className={cn(
      "bg-[#1E2A3B] rounded-xl border border-white/5 p-5 border-l-4 transition-all hover:bg-white/[0.03]",
      color,
      className
    )}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", color.replace('border-', 'text-'))} />
          <h4 className="text-white font-bold text-sm tracking-tight">{title}</h4>
        </div>
        {variant === 'error' || variant === 'warning' ? (
          <span className="text-[9px] font-bold uppercase bg-white/5 px-1.5 py-0.5 rounded text-slate-500">Critical</span>
        ) : null}
      </div>
      
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="text-[10px] font-bold text-ate-cyan uppercase tracking-widest hover:underline flex items-center gap-1 group"
        >
          {action.label}
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      )}
    </div>
  );
};
