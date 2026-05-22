import { Inbox, LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState = ({ title, description, icon: Icon = Inbox, action, className }: Props) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
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
