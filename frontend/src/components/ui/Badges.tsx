import { cn } from '@/utils';

type PatternType = 'SCAN' | 'ATPG' | 'BIST' | 'FUNC' | 'IDDQ' | 'BOUNDARY';

const TYPE_STYLES: Record<PatternType, string> = {
  SCAN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ATPG: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  BIST: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  FUNC: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  IDDQ: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  BOUNDARY: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
};

export const PatternBadge = ({ type, className }: { type: PatternType | string, className?: string }) => {
  const style = TYPE_STYLES[type as PatternType] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", style, className)}>
      {type}
    </span>
  );
};

export const ActionBadge = ({ 
  action, 
  patternId, 
  onAction,
  className 
}: { 
  action: 'KEEP' | 'REVIEW' | 'REMOVE' | string, 
  patternId?: string,
  onAction?: (id: string, action: string) => void,
  className?: string 
}) => {
  const styles = {
    KEEP: 'text-ate-emerald border-ate-emerald/30 bg-ate-emerald/5 hover:bg-ate-emerald/10',
    REVIEW: 'text-ate-amber border-ate-amber/30 bg-ate-amber/5 hover:bg-ate-amber/10',
    REMOVE: 'text-ate-rose border-ate-rose/30 bg-ate-rose/5 hover:bg-ate-rose/10',
  };

  const currentStyle = styles[action as keyof typeof styles] || 'text-slate-400 border-white/10 bg-white/5';

  return (
    <button 
      onClick={(e) => {
        if (onAction && patternId) {
          e.stopPropagation();
          onAction(patternId, action);
        }
      }}
      disabled={!onAction}
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded border uppercase transition-all",
        currentStyle,
        onAction ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      {action}
    </button>
  );
};
