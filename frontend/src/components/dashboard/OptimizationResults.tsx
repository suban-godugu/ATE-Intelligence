import { Link } from 'react-router-dom';
import { FileText, Info, ArrowRight } from 'lucide-react';
import CountUp from 'react-countup';
import { useOptimizationStore } from '@/stores/useOptimizationStore';
import { cn } from '@/utils';

export const OptimizationResults = () => {
  const { lastResults, yieldTarget } = useOptimizationStore();

  const data = lastResults || {
    estimatedSavings: 0,
    costReductionPct: 0,
    timeReductionPct: 0,
    projectedYield: 0,
    patternsRemoved: 0,
    totalSavingsUSD: 0
  };

  const ResultRow = ({ label, value, suffix = '', prefix = '', colorClass = 'text-[var(--accent-teal)]', decimals = 1 }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0 group">
      <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--text-secondary)] transition-colors">
        {label}
      </span>
      <div className={cn("text-lg font-bold font-mono transition-all duration-300", colorClass)}>
        {prefix}
        <CountUp 
          end={value} 
          duration={0.8} 
          decimals={decimals}
          separator=","
        />
        {suffix}
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 flex flex-col h-full shadow-[var(--shadow-card)] relative overflow-hidden">
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[var(--accent-teal)]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Optimization Results (AI Recommended)</h3>
          <Info className="w-4 h-4 text-[var(--text-muted)] cursor-help" />
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <ResultRow 
          label="Estimated Cost Reduction" 
          value={data.costReductionPct} 
          suffix="%" 
        />
        <ResultRow 
          label="Estimated Time Savings" 
          value={data.timeReductionPct} 
          suffix="%" 
        />
        <ResultRow 
          label="Projected Yield" 
          value={data.projectedYield || yieldTarget} 
          suffix="%" 
          decimals={2}
        />
        <ResultRow 
          label="Patterns Reduced" 
          value={data.patternsRemoved} 
          prefix="-"
          suffix={` (${Math.round((data.patternsRemoved / 150) * 100)}%)`}
          colorClass="text-[var(--accent-rose)]" 
          decimals={0}
        />
        
        <div className="flex flex-col gap-1 pt-6">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Total Savings</span>
          <div className="text-4xl font-bold text-[var(--accent-teal)] font-mono tracking-tight flex items-baseline gap-1">
            <span className="text-2xl">$</span>
            <CountUp 
              end={data.totalSavingsUSD || data.estimatedSavings} 
              duration={1} 
              separator="," 
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link 
          to="/patterns/library?filter=optimized"
          className="w-full py-3 px-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 text-[11px] font-bold text-[var(--text-secondary)] hover:text-white flex items-center justify-center gap-2 transition-all group"
        >
          <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>View Optimized Pattern Set</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
