import { cn } from '@/utils';

interface Props {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export const MiniProgressBar = ({ value, max = 100, showLabel = true, className }: Props) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getColor = (p: number) => {
    if (p >= 95) return 'bg-ate-emerald';
    if (p >= 85) return 'bg-ate-cyan';
    if (p >= 70) return 'bg-ate-amber';
    return 'bg-ate-rose';
  };

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-700 ease-out", getColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
};
