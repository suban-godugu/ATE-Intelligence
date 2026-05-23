import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, HelpCircle, BarChart2 } from 'lucide-react';
import { usePatternCostAnalysis } from '@/hooks/dashboard/useDashboardHooks';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface PatternROI {
  patternId: string;
  testTimeMs: number;
  costUSD: number;
  failRate: number;
  detectPower: string;
  roiScore: number;
  recommendation: 'Keep' | 'Review' | 'Remove';
}

export const PatternCostTable = () => {
  const { data, isLoading } = usePatternCostAnalysis();
  const patterns = data?.patterns as PatternROI[];

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-[var(--accent-teal)]';
    if (score > 40) return 'text-[var(--accent-amber)]';
    return 'text-[var(--accent-rose)] opacity-80';
  };

  const getPowerColor = (power: string) => {
    switch (power.toUpperCase()) {
      case 'HIGH': return 'text-[var(--accent-teal)]';
      case 'MEDIUM': return 'text-[var(--accent-amber)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const getBadgeClass = (rec: string) => {
    switch (rec) {
      case 'Keep': return 'bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border-[var(--accent-teal)]/20';
      case 'Review': return 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/20';
      case 'Remove': return 'bg-[var(--accent-rose)]/10 text-[var(--accent-rose)] border-[var(--accent-rose)]/20';
      default: return 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border)]';
    }
  };

  return (
    <div className="card p-6 flex flex-col h-full min-h-[320px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Pattern Cost Analysis</h3>
          <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help" />
        </div>
        <Link
          to="/patterns/library"
          className="text-[11px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] flex items-center gap-1.5 transition-colors group"
        >
          View All <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="flex-1 table-scroll scrollbar-thin">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <th className="pb-2 pl-2">Pattern ID</th>
              <th className="pb-2">Test Time</th>
              <th className="pb-2">Cost (USD)</th>
              <th className="pb-2">Fail Rate</th>
              <th className="pb-2">Detect Power</th>
              <th className="pb-2">ROI Score</th>
              <th className="pb-2 pr-2">Recommendation</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-2"><Skeleton className="h-10 w-full rounded-lg" /></td></tr>
              ))
            ) : !patterns?.length ? (
              <tr>
                <td colSpan={7} className="py-2">
                  <EmptyState
                    compact
                    icon={BarChart2}
                    title="No pattern data yet"
                    description="Import ATPG patterns to see cost analysis here."
                    ctaTo="/upload"
                  />
                </td>
              </tr>
            ) : (
              patterns?.map((p) => (
                <tr key={p.patternId} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-2">
                    <Link
                      to={`/patterns/library?highlight=${p.patternId}`}
                      className="text-[var(--accent-blue)] hover:text-[var(--accent-cyan)] font-mono font-bold flex items-center gap-1.5"
                    >
                      {p.patternId}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="py-3 text-[var(--text-primary)] font-mono">{p.testTimeMs.toFixed(1)} ms</td>
                  <td className="py-3 text-[var(--text-secondary)] font-mono">${p.costUSD.toFixed(4)}</td>
                  <td className="py-3 text-[var(--text-primary)] font-medium">{p.failRate.toFixed(2)}%</td>
                  <td className={cn("py-3 font-bold", getPowerColor(p.detectPower))}>
                    {p.detectPower}
                  </td>
                  <td className={cn("py-3 font-bold font-mono text-lg", getScoreColor(p.roiScore))}>
                    {p.roiScore}
                  </td>
                  <td className="py-3 pr-2">
                    <button
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95",
                        getBadgeClass(p.recommendation)
                      )}
                    >
                      {p.recommendation}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] italic">
          <span className="font-bold text-[var(--accent-primary)] not-italic">ROI Formula:</span>
          (Fail Rate × Kill Ratio × 10) / (Test Time × Cost × 1000)
        </div>
      </div>
    </div>
  );
};
