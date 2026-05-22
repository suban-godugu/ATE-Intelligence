import { cn } from '@/utils';
import { X } from 'lucide-react';

interface Props {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export const FilterChipBar = ({ options, selected, onChange, className }: Props) => {
  const toggle = (opt: string) => {
    if (opt === 'All') {
      onChange([]);
      return;
    }
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange(next);
  };

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto scrollbar-none pb-2", className)}>
      <button
        onClick={() => toggle('All')}
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0",
          selected.length === 0 
            ? "bg-ate-cyan text-black border-ate-cyan" 
            : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20"
        )}
      >
        All
      </button>
      
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0 flex items-center gap-1.5",
            selected.includes(opt)
              ? "bg-white/10 text-white border-white/20"
              : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20"
          )}
        >
          {opt}
          {selected.includes(opt) && <X className="w-3 h-3 text-ate-cyan" />}
        </button>
      ))}
    </div>
  );
};
